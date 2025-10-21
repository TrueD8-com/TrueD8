import * as express from "express";
export const authRoutes = express.Router();
import { v4 as uuid } from "uuid";
import * as crypto from "crypto";
import mongoose, { ConnectOptions } from "mongoose";

import { logger } from "../api/logger";
import { publishQueueConnection } from "../api/amqp";
import myError from "../api/myError";

import { User, VerificationCode, VerificationPhoneCode } from "../db/user";

import {
  userValidationRules,
  validate,
  isEmailValid,
  isValidMobilePhone,
  numbersFormatter,
} from "../middlewares/validation";
import successRes from "../middlewares/response";
import tryCatch from "../middlewares/tryCatch";
import { isAuthorized } from "../middlewares/auth";
import * as fetch from "node-fetch";

import { Types } from "mongoose";
import { ObjectId } from "mongodb";
import { generateNonce, SiweMessage } from "siwe";

import {
  preventBruteForce,
  rateLimiterMiddleware,
} from "../middlewares/preventBruteForce";

/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////// GET ENDPOINTS   /////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
// SIWE (Sign-In With Ethereum) Wallet login routes

// NOTE: Intentionally NOT adding `import { SiweMessage } from 'siwe'` because import statements shouldn't be inserted here based on instructions.

// We will use nonces to prevent replay attacks. We'll generate and store nonce in session before each SIWE login flow.

// already imported above

/**
 * Route to get SIWE nonce
 * - Generates a nonce and stores it in session
 * - Client should fetch this before sending SIWE login
 */
authRoutes.get(
  "/siwe/nonce",
  rateLimiterMiddleware,
  tryCatch((req, res, next) => {
    const nonce = generateNonce();
    console.log("Generated nonce:", nonce);
    req.session.siweNonce = nonce;
    successRes(res, "", { nonce });
  })
);

/**
 * Route to initialize SIWE login:
 * - Receives the SIWE message and signature from client
 * - Verifies the SIWE message and signature and ensures the nonce matches session
 * - If successful, stores wallet address in session
 */
authRoutes.post(
  "/siwe/login",
  rateLimiterMiddleware,
  tryCatch(async (req, res, next) => {
    const { message, signature } = req.body;

    console.log("Received message:", message); // ADD LOG
    console.log("Received signature:", signature); // ADD LOG
    console.log("Session nonce:", req.session.siweNonce); // ADD LOG

    if (!message || !signature) {
      return next(
        new myError(
          "SIWE params missing",
          400,
          1,
          "پارامترهای لازم ارسال نشده‌اند.",
          "خطا رخ داد"
        )
      );
    }

    // Parse SIWE message
    let siweMessageObj;
    try {
      const { SiweMessage } = require("siwe");
      siweMessageObj = new SiweMessage(message);
      console.log("Parsed SIWE message:", siweMessageObj); // ADD LOG
    } catch (err) {
      console.error("SIWE parsing error:", err); // ADD LOG
      return next(
        new myError(
          "SIWE message parsing failed",
          400,
          2,
          "پیام SIWE معتبر نیست.",
          "خطا رخ داد"
        )
      );
    }

    // Check nonce
    console.log("Message nonce:", siweMessageObj.nonce); // ADD LOG
    console.log("Session nonce:", req.session.siweNonce); // ADD LOG

    if (
      !req.session.siweNonce ||
      req.session.siweNonce !== siweMessageObj.nonce
    ) {
      return next(
        new myError(
          "SIWE nonce mismatch or missing",
          400,
          2,
          "اعتبار nonce غیر مجاز است!",
          "درخواست معتبر نیست"
        )
      );
    }

    try {
      // Verify signature
      console.log("Validating signature..."); // ADD LOG
      await siweMessageObj.verify({ signature });
      console.log("Signature validation successful!"); // ADD LOG

      // Get address from message
      const walletAddress = String(siweMessageObj.address).toLowerCase();

      req.session.siwe = {
        address: walletAddress,
        chainId: siweMessageObj.chainId,
        issuedAt: siweMessageObj.issuedAt,
      };

      // Find or create user
      let user = await User.findOne({ "wallet.address": walletAddress });
      if (!user) {
        const rnd = require("crypto").randomBytes(32).toString("hex");
        user = await User.create({
          name: undefined,
          lastName: undefined,
          password: rnd,
          isActive: true,
          label: [],
          hasTicketAccount: false,
          wallet: {
            provider: "siwe",
            address: walletAddress,
            connectedAt: new Date(),
          },
        });
      } else {
        if (!user.wallet || !user.wallet.address) {
          user.wallet = {
            provider: "siwe",
            address: walletAddress,
            connectedAt: new Date(),
          };
          await user.save();
        }
      }

      req.session.userId = String(user._id);
      delete req.session.siweNonce;

      logger.info(`SIWE login success: ${walletAddress}`);

      successRes(res, "SIWE ورود موفقیت آمیز بود", {
        address: walletAddress,
        userId: String(user._id),
      });
    } catch (err) {
      console.error("SIWE validation failed:", err); // ADD LOG
      logger.error("SIWE validation failed", err);
      return next(
        new myError(
          "SIWE validation failed",
          401,
          3,
          "اعتبارسنجی SIWE با شکست مواجه شد.",
          "خطا رخ داد"
        )
      );
    }
  })
);

/**
 * Check SIWE authentication state (is session/siwe valid)
 */
authRoutes.get(
  "/siwe/auth",
  rateLimiterMiddleware,
  tryCatch((req, res, next) => {
    if (req.session.siwe && req.session.siwe.address) {
      successRes(res, "", { isAuth: true, address: req.session.siwe.address });
    } else {
      return next(
        new myError(
          "SIWE unauthorized",
          401,
          1,
          "وارد نشده‌اید!",
          "لطفا ابتدا با Wallet وارد شوید"
        )
      );
    }
  })
);

/**
 * SIWE logout (destroy wallet session)
 */
authRoutes.get(
  "/siwe/logout",
  rateLimiterMiddleware,
  tryCatch(async (req, res, next) => {
    if (req.session.siwe && req.session.siwe.address) {
      // Optionally log logout event
      try {
        await User.findOneAndUpdate(
          { "wallet.address": String(req.session.siwe.address).toLowerCase() },
          {
            $push: {
              userActivities: {
                action: "SIWE_LOGOUT",
                timestamp: Date.now(),
                ip: req.ip,
              },
            },
          }
        );
      } catch (err) {
        logger.error(`Updating SIWE logout activity error: ${err}`);
      }
      delete req.session.siwe;
    }
    // Also invalidate nonce if present
    if (req.session.siweNonce) {
      delete req.session.siweNonce;
    }
    successRes(res, "SIWE لاگ اوت موفقیت آمیز بود");
  })
);

// This end point check "Authentication" of users from MongoDB.
authRoutes.get(
  "/auth",
  rateLimiterMiddleware,
  tryCatch((req, res, next) => {
    if (!req.session.userId) {
      logger.error("Unauthorized cookie");
      const error = new myError(
        "Unauthorized cookie",
        400,
        1,
        "کاربر حق دسترسی ندارد!",
        "خطا رخ داد"
      );
      next(error);
    } else {
      successRes(res, "", { isAuth: true });
    }
  })
);

// This end point delete "Token" of users who want to logout from MongoDB.
authRoutes.get(
  "/logout",
  rateLimiterMiddleware,
  isAuthorized,
  tryCatch((req, res, next) => {
    const agant = req.useragent;
    const userActivity = {
      action: "LOGOUT",
      timestamp: Date.now(),
      device: agant.source,
      ip: req.ip,
    };
    User.findOneAndUpdate(
      { _id: req.session.userId },
      { $push: { userActivities: userActivity } }
    ).catch((err) => {
      logger.error(`Updating user activity has some error: ${err} `);
    });
    req.session.destroy();
    successRes(res, "");
  })
);

authRoutes.get(
  "/verifyEmails",
  rateLimiterMiddleware,
  userValidationRules("query", "string"),
  validate,
  tryCatch((req, res, next) => {
    const id = req.query.string;
    return VerificationCode.findOne({ name: id })
      .then((doc) => {
        if (!doc) {
          const error = new myError(
            "Verification Code is not valid!",
            400,
            5,
            "کد راستی آزمایی معتبر نیست!",
            "خطا رخ داد"
          );
          next(error);
        } else {
          return User.findOne({ emailVerificationString: doc._id })
            .then((user) => {
              if (
                user &&
                user.emailVerificationString.toString() === doc._id.toString()
              ) {
                user.email = {
                  address: doc.email,
                  validated: true,
                };
                user.emailVerificationString = undefined;
                return user
                  .save()
                  .then(() => {
                    const data = {
                      email: user.email,
                    };
                    doc.deleteOne().catch((err) => {
                      logger.error(err);
                    });
                    successRes(res, "Email is verified", data);
                  })
                  .catch((err) => {
                    next(err);
                  });
              } else {
                return User.findOne({ email: doc.email })
                  .then((user) => {
                    if (user && user.email === doc.email) {
                      user.email = {
                        address: doc.email,
                        validated: true,
                      };
                      user.emailVerificationString = undefined;
                      return user
                        .save()
                        .then(() => {
                          const data = {
                            email: user.email,
                          };

                          doc.deleteOne().catch((err) => {
                            logger.error(err);
                          });
                          successRes(res, "Email is verified", data);
                        })
                        .catch((err) => {
                          next(err);
                        });
                    } else {
                      const error = new myError(
                        "Verification Code is not valid!",
                        400,
                        5,
                        "کد راستی آزمایی معتبر نیست!",
                        "خطا رخ داد"
                      );
                      next(error);
                    }
                  })
                  .catch((err) => {
                    next(err);
                  });
              }
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);

authRoutes.get(
  "/requestForPhoneCode",
  rateLimiterMiddleware,
  userValidationRules("query", "phoneNumber"),
  validate,
  tryCatch((req, res, next) => {
    const userId = req.session.userId;
    const phoneNumber = numbersFormatter(req.query.phoneNumber, "en");
    const code = Math.floor(Math.random() * 10000);
    const data = {
      pattern_code: process.env.SMS_API_PHONE_PATTERN_CODE,
      originator: process.env.SMS_API_DEFINITE_SENDER_NUMBER,
      recipient: phoneNumber.toString(),
      values: { "verification-code": code.toString() },
    };
    const rand = uuid();
    const body = {
      phoneNumber,
      sessionId: req.cookies.sessionId,
      code,
    };
    const verificationPhoneCode = new VerificationPhoneCode({ ...body });
    return verificationPhoneCode
      .save()
      .then(() => {
        if (userId) {
          return User.findOne({ _id: userId })
            .then((user) => {
              if (user && user._id.toString() === userId) {
                user["tempPhoneNumber"] = verificationPhoneCode._id;
                return user
                  .save()
                  .then(() => {
                    fetch("http://rest.ippanel.com/v1/messages/patterns/send", {
                      method: "POST",
                      body: JSON.stringify(data),
                      headers: {
                        Authorization: process.env.SMS_API_ACCESS_KEY,
                        "Content-Type": "application/json",
                        Accept: "*/*",
                        Connection: "Keep-Alive",
                      },
                    })
                      .catch((err) => {
                        const error = new myError(
                          "The Sms service is not responding!",
                          400,
                          11,
                          "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                          "خطا رخ داد"
                        );
                        throw error;
                      })
                      .then((res) => res.json())
                      .then((response) => {
                        if (response.status === "OK") {
                          successRes(res, "");
                        } else {
                          const error = new myError(
                            "The Sms service is not responding!",
                            400,
                            11,
                            "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                            "خطا رخ داد"
                          );
                          next(error);
                        }
                      })
                      .catch((err) => {
                        next(err);
                      });
                  })
                  .catch((err) => {
                    next(err);
                  });
              } else {
                const error = new myError(
                  "The user does not exists!",
                  400,
                  11,
                  "چنین کاربری در سیستم وجود ندارد!",
                  "خطا رخ داد"
                );
                next(error);
              }
            })
            .catch((err) => {
              next(err);
            });
        } else {
          return fetch("http://rest.ippanel.com/v1/messages/patterns/send", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
              Authorization: process.env.SMS_API_ACCESS_KEY,
              "Content-Type": "application/json",
              Accept: "*/*",
              Connection: "Keep-Alive",
            },
          })
            .catch((err) => {
              const error = new myError(
                "The Sms service is not responding!",
                400,
                11,
                "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                "خطا رخ داد"
              );
              throw error;
            })
            .then((res) => res.json())
            .then((response) => {
              if (response.status === "OK") {
                successRes(res, "");
              } else {
                const error = new myError(
                  "The Sms service is not responding!",
                  400,
                  11,
                  "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                  "خطا رخ داد"
                );
                next(error);
              }
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);

authRoutes.get(
  "/verifyPhoneCode",
  rateLimiterMiddleware,
  tryCatch((req, res, next) => {
    const phoneCode = req.query.phoneCode;
    const userId = req.session.userId;
    const sessionId = req.cookies.sessionId;
    return VerificationPhoneCode.findOne({
      $and: [{ sessionId: sessionId }, { code: phoneCode }],
    })
      .then((item) => {
        if (item && item.sessionId === sessionId) {
          if (item.code === phoneCode) {
            let query;
            if (userId) {
              query = { tempPhoneNumber: item._id };
            } else {
              query = { "phoneNumber.number": item.phoneNumber };
            }
            return User.findOne(query)
              .then((user) => {
                if (user) {
                  user.phoneNumber.number = item.phoneNumber;
                  user.phoneNumber.validated = true;
                  user["tempPhoneNumber"] = undefined;
                  return user
                    .save()
                    .then(() => {
                      successRes(res, "", item.phoneNumber);
                      return item.deleteOne().catch((err) => {
                        logger.error(err);
                      });
                    })
                    .catch((err) => {
                      next(err);
                    });
                } else {
                  const error = new myError(
                    "The code is not valid!",
                    400,
                    11,
                    "کد وارد شده معتبر نیست!",
                    "خطا رخ داد"
                  );
                  next(error);
                }
              })
              .catch((err) => {
                next(err);
              });
          } else {
            const error = new myError(
              "The code is not valid!",
              400,
              11,
              "کد وارد شده معتبر نیست!",
              "خطا رخ داد"
            );
            next(error);
          }
        } else {
          const error = new myError(
            "The code is not valid!",
            400,
            11,
            "کد وارد شده معتبر نیست!",
            "خطا رخ داد"
          );
          next(error);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////// POST ENDPOINTS  /////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////

// This end point get the users' information and save those in MongoDB.
authRoutes.post(
  "/register",
  //rateLimiterMiddleware,
  userValidationRules("body", "name"),
  userValidationRules("body", "lastName"),
  userValidationRules("body", "username"),
  userValidationRules("body", "password"),
  validate,
  tryCatch((req, res, next) => {
    const username = req.body.username;
    let rand;
    let mailOptions;
    let dataSms;
    let code;
    let isEmail = false;
    let isPhoneNumber = false;
    const currencyObj = {
      currency: new mongoose.Types.ObjectId("5f859cb74da2d4150c96832d"),
      value: Number(10000000000000),
    };
    const currencyObj2 = {
      currency: new mongoose.Types.ObjectId("66101ae28a1414c98c0ea769"),
      value: Number(1000),
    };
    let setNewTempPhone = () => {
      return null;
    };
    let setEmailVeificationCode = () => {
      return null;
    };
    if (isEmailValid(username)) {
      isEmail = true;
    } else if (isValidMobilePhone(username)) {
      isPhoneNumber = true;
    }
    if (isPhoneNumber) {
      code = Math.floor(Math.random() * 10000);
      dataSms = {
        pattern_code: process.env.SMS_API_PHONE_PATTERN_CODE,
        originator: process.env.SMS_API_DEFINITE_SENDER_NUMBER,
        recipient: username.toString(),
        values: { "verification-code": code.toString() },
      };
    }
    rand = uuid();
    if (isEmail) {
      //const rand = process.env.NODE_ENV === 'test' ? 'cb0059c2-5566-4967-8c9d-1126d1e9eda4' : uuid4()

      const link = `${process.env.API}verify?type=email&string=${rand}`;
      mailOptions = {
        from: process.env.SENDER_ADDRESS, // sender address
        to: username,
        subject: "Please confirm your Email account",
        html:
          "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
          link +
          ">Click here to verify</a>",
      };
    }
    let body;
    let user;
    let verificationPhoneCode;
    if (isEmail) {
      setEmailVeificationCode = () => {
        const bodyEmailCode = {
          name: rand,
          email: username,
        };
        const newEmailCode = new VerificationCode({ ...bodyEmailCode });
        return newEmailCode
          .save()
          .then(() => {
            body = {
              name: req.body.name,
              lastName: req.body.lastName,
              password: req.body.password,
              email: {
                address: username,
                validated: false,
              },
              label: ["USER"],
              wallet: [currencyObj, currencyObj2],
              emailVerificationString: newEmailCode._id,
            };
            user = new User({ ...body });
          })
          .catch((err) => {
            throw err;
          });
      };
    } else if (isPhoneNumber) {
      setNewTempPhone = () => {
        const bodyPhoneCode = {
          phoneNumber: numbersFormatter(username, "en"),
          sessionId: req.cookies.sessionId,
          code,
        };
        verificationPhoneCode = new VerificationPhoneCode({ ...bodyPhoneCode });
        return verificationPhoneCode
          .save()
          .then(async () => {
            const currencies = await getCurrencies();
            console.log("currencies", currencies);

            body = {
              name: req.body.name,
              lastName: req.body.lastName,
              password: req.body.password,
              phoneNumber: {
                number: username,
                validated: false,
              },
              label: ["USER"],
              wallet: [currencyObj, currencyObj2],
            };

            //                         value: Number(amount),
            //                         currency: rialObject.id
            //                     }
            user = new User({ ...body });
          })
          .catch((err) => {
            if (err.code === 11000) {
              logger.error(
                `The save action on Verification Collection with document ${bodyPhoneCode} has some errors: ${err}`
              );
              const error = new myError(
                "!",
                400,
                9,
                "لطفا چند دقیقه بعد از درخواست قبلی صبر نمیایید!",
                "خطا رخ داد "
              );
              throw error;
            } else throw err;
          });
      };
    }
    return Promise.all([setNewTempPhone(), setEmailVeificationCode()])
      .then(() => {
        return user
          .save()
          .then(() => {
            const data = {
              email: user.email.address,
              tempPhoneNumber: verificationPhoneCode
                ? verificationPhoneCode._id
                : undefined,
              isActive: user.isActive,
            };
            if (isEmail) {
              const body1 = {
                aUsername: username,
                aPass: req.body.password,
                aPassConfirm: req.body.password,
                aFullname: req.body.name + req.body.lastName,
                aTitle: username,
                userId: user._id,
                aGrps: ["5fd70c592147ef000630fe24"], //[group._id.toString()],
                aEmail: username,
              };
              const body1Json = JSON.stringify(body1);
              successRes(res, "Registration is done successfully", data, {
                isEmail,
              });
              publishQueueConnection(mailOptions);

              // return fetch(process.env.API + 'api/tickets/register', {
              //   method: 'POST',
              //   body: body1Json,
              //   headers: {
              //     accessToken: process.env.ACCESS_TOKEN,
              //     'Content-Type': 'application/json'
              //   }
              // })
              //   .then((res) => res.json())
              //   .then((response) => { console.log('response: ', response) })
              //   .catch((err) => { console.log('err: ', err) })
            } else if (isPhoneNumber) {
              const body1 = {
                aUsername: username,
                aPass: req.body.password,
                aPassConfirm: req.body.password,
                aFullname: req.body.name + req.body.lastName,
                aTitle: username,

                //aGrps: [group._id.toString()],
                userId: user._id,
                aEmail: username.concat("@gmail.com"),
              };
              const body1Json = JSON.stringify(body1);
              successRes(res, "Registration is done successfully", data, {
                isPhoneNumber,
              });
              fetch("http://rest.ippanel.com/v1/messages/patterns/send", {
                method: "POST",
                body: JSON.stringify(dataSms),
                headers: {
                  Authorization: process.env.SMS_API_ACCESS_KEY,
                  "Content-Type": "application/json",
                  Accept: "*/*",
                  Connection: "Keep-Alive",
                },
              })
                .catch((err) => {
                  const error = new myError(
                    "The Sms service is not responding!",
                    400,
                    11,
                    "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                    "خطا رخ داد"
                  );
                  logger.error(error.message);
                  next(err);
                })
                .then((res) => res.json()) // expecting a json response
                .then((response) => {
                  if (response.status !== "OK") {
                    const error = new myError(
                      "The Sms service is not responding!",
                      400,
                      11,
                      "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.",
                      "خطا رخ داد"
                    );
                    logger.error(error.message);
                  }
                })
                .catch((err) => {
                  logger.error(err);
                });

              return fetch(process.env.API + "api/tickets/register", {
                method: "POST",
                body: body1Json,
                headers: {
                  accessToken: process.env.ACCESS_TOKEN,
                  "Content-Type": "application/json",
                },
              })
                .then((res) => res.json())
                .then((response) => {})
                .catch((err) => {
                  console.log(err);
                });
            }
          })
          .catch((err) => {
            if (err.code === 11000) {
              logger.error(
                `The save action on User Collection with document ${req.body.lastName} has some errors: ${err}`
              );
              const error = new myError(
                "The user has registered already!",
                400,
                9,
                "شما قبلا ثبت نام کرده اید!",
                "خطا رخ داد "
              );
              next(error);
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        next(err);
      });
  })
);

authRoutes.post(
  "/sendEmailVerificationLink",
  rateLimiterMiddleware,
  userValidationRules("body", "email"),
  validate,
  tryCatch((req, res, next) => {
    const email = req.body.email;
    const userId = req.session.userId;
    const rand = uuid();
    // const rand = process.env.NODE_ENV === 'test' ? 'cb0059c2-5566-4967-8c9d-1126d1e9eda5' : uuid4()
    const link = `${process.env.API}verify?type=email&string=${rand}`;
    const mailOptions = {
      from: process.env.SENDER_ADDRESS, // sender address
      to: email,
      subject: "Please confirm your Email account",
      html:
        "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
        link +
        ">Click here to verify</a>",
    };
    const bodyEmailCode = {
      name: rand,
      email,
    };
    const newEmailCode = new VerificationCode({ ...bodyEmailCode });
    return newEmailCode
      .save()
      .then(() => {
        if (userId) {
          return User.findOne({ _id: userId })
            .then((user) => {
              if (user && user._id.toString() === userId) {
                return user
                  .updateOne({
                    $set: { emailVerificationString: newEmailCode._id },
                  })
                  .then(() => {
                    const data = {
                      email: email,
                    };
                    successRes(res, "Please verify your email", data);
                    publishQueueConnection(mailOptions);
                  })
                  .catch((err) => {
                    next(err);
                  });
              } else {
                const error = new myError(
                  "The user does not exists!",
                  400,
                  11,
                  "چنین کاربری در سیستم وجود ندارد!",
                  "خطا رخ داد"
                );
                next(error);
              }
            })
            .catch((err) => {
              next(err);
            });
        } else {
          const data = {
            email: email,
          };
          successRes(res, "Please verify your email", data);
          publishQueueConnection(mailOptions);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);

authRoutes.post(
  "/sendPasswordVerificationLink",
  rateLimiterMiddleware,
  userValidationRules("body", "email"),
  validate,
  tryCatch((req, res, next) => {
    const email = req.body.email;
    return User.findOne({
      $and: [{ "email.address": email }, { "email.validated": true }],
    })
      .then((user) => {
        if (!user) {
          const error = new myError(
            "Email address is not valid!",
            400,
            12,
            "چنین کاربری در سیستم ثبت‌نام نهایی انجام نداده است!",
            "خطا رخ داد"
          );
          next(error);
        } else {
          const rand =
            process.env.NODE_ENV === "test"
              ? "e39459ee-18b4-4967-aaaa-f22fb26a8beb"
              : uuid();
          // const rand = uuid4()
          const link = `${process.env.API}verify?type=password&string=${rand}`;
          const mailOptions = {
            from: process.env.SENDER_ADDRESS, // sender address
            to: email,
            subject: "Please confirm your Email account",
            html:
              "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
              link +
              ">Click here to verify</a>",
          };
          const hash = crypto
            .createHmac("sha256", process.env.CRYPTO_SECRET)
            .update(rand)
            .digest("hex");
          const verificationCode = new VerificationCode({
            code: hash,
            name: rand,
          });
          return verificationCode
            .save()
            .then(() => {
              return user
                .updateOne({
                  $set: {
                    resetPasswordVerificationString: new Types.ObjectId(
                      verificationCode._id
                    ),
                  },
                })
                .then(() => {
                  successRes(res, "Please verify your email");
                  publishQueueConnection(mailOptions);
                })
                .catch((err) => {
                  next(err);
                });
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        logger.error(
          `The find action on User Collection with email ${email} has some errors: ${err}`
        );
        next(err);
      });
  })
);

authRoutes.post(
  "/resetPassword",
  rateLimiterMiddleware,
  userValidationRules("body", "id"),
  userValidationRules("body", "password"),
  validate,
  tryCatch((req, res, next) => {
    const id = req.body.id;
    const hash = crypto
      .createHmac("sha256", process.env.CRYPTO_SECRET)
      .update(id)
      .digest("hex");
    return VerificationCode.findOne({ code: hash })
      .then((doc) => {
        if (!doc) {
          logger.warn(`ResetPasswordVerificationString ${hash} is not valid!`);
          const error = new myError(
            "Verification Code is not valid!",
            400,
            5,
            "کد راستی آزمایی معتبر نیست!",
            "خطا رخ داد"
          );
          next(error);
        } else {
          return User.findOne({ resetPasswordVerificationString: doc._id })
            .then((user) => {
              if (!user) {
                logger.error(
                  `The query on User Collection with resetPasswordVerificationString ${id} has response null!`
                );
                const error = new myError(
                  "Verification Code is not valid!",
                  400,
                  5,
                  "کد راستی آزمایی معتبر نیست!",
                  "خطا رخ داد"
                );
                next(error);
              } else {
                user.password = req.body.password;
                user.resetPasswordVerificationString = undefined;
                VerificationCode.deleteOne({ code: hash }).catch((err) => {
                  logger.error(err);
                });
                return user
                  .save()
                  .then(() => {
                    const data = {
                      email: user.email.address,
                    };
                    successRes(res, "password is successfuly reset", data);
                  })
                  .catch((err) => {
                    next(err);
                  });
              }
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);

authRoutes.post(
  "/resetPasswordWithPhone",
  rateLimiterMiddleware,
  userValidationRules("body", "password"),
  userValidationRules("body", "passwordConfirm"),
  // userValidationRules('body', 'verificationCode'),
  validate,
  tryCatch((req, res, next) => {
    console.log(req.body);
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    const verificationCode = req.body.verificationCode;
    const sessionId = req.cookies.sessionId;
    if (password !== passwordConfirm) {
      const error = new myError(
        "passwords do not match!",
        400,
        11,
        "پسورد ها باهم همخوانی ندارند",
        "خطا رخ داد"
      );
      next(error);
    } else {
      return VerificationPhoneCode.findOne({
        $and: [{ code: verificationCode }, { sessionId: sessionId }],
      })
        .then((item) => {
          if (
            item &&
            item.code.toString() === verificationCode.toString() &&
            item.sessionId.toString() === sessionId.toString()
          ) {
            return User.findOne({ "phoneNumber.number": item.phoneNumber })
              .then((user) => {
                if (
                  user &&
                  user.phoneNumber &&
                  user.phoneNumber.number === item.phoneNumber
                ) {
                  if (user.phoneNumber.validated === true) {
                    user.password = password;
                    return user
                      .save()
                      .then(() => {
                        return item
                          .deleteOne()
                          .then(() => {
                            successRes(res, "", user.phoneNumber.number);
                          })
                          .catch((err) => {
                            next(err);
                          });
                      })
                      .catch((err) => {
                        next(err);
                      });
                  } else {
                    const error = new myError(
                      "The phoneNumber is not validated!",
                      400,
                      18,
                      "شماره مورد نظر هنوز راستی آزمایی نشده است!",
                      "خطا رخ داد"
                    );
                    next(error);
                  }
                } else {
                  const error = new myError(
                    "The code is not valid!",
                    400,
                    11,
                    "کد معتبر نیست",
                    "خطا رخ داد"
                  );
                  next(error);
                }
              })
              .catch((err) => {
                next(err);
              });
          } else {
            const error = new myError(
              "The code is not valid!",
              400,
              11,
              "کد معتبر نیست",
              "خطا رخ داد"
            );
            next(error);
          }
        })
        .catch((err) => {
          next(err);
        });
    }
  })
);

authRoutes.post(
  "/changePassword",
  rateLimiterMiddleware,
  isAuthorized,
  userValidationRules("body", "password"),
  validate,
  userValidationRules("body", "newPassword"),
  validate,
  tryCatch((req, res, next) => {
    return User.findOne({ email: req.session.email })
      .then((user) => {
        if (!user) {
          logger.warn("Email address is not valid!");
          const error = new myError(
            "Email address is not valid!",
            12,
            400,
            "آدرس ایمیل معتبر نیست!",
            "خطا رخ داد"
          );
          next(error);
        } else {
          return user
            .comparePasswordPromise(req.body.password)
            .then((isMatch) => {
              if (!isMatch) {
                logger.warn("Password is not valid!");
                const error = new myError(
                  "Inputs are not valid!",
                  400,
                  15,
                  "ورودی های درخواستی معتبر نیستند!",
                  "خطا رخ داد"
                );
                next(error);
              } else {
                user.password = req.body.newPassword;
                return user
                  .save()
                  .then(() => {
                    successRes(res, "password is successfuly changed");
                  })
                  .catch((err) => {
                    next(err);
                  });
              }
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
);

// This end point execute the following actions:
// 1. Find the document of a user who send the email.doc
// 2. Compare the Passord to hash of the password which is stored in MongoDB.
// 3. Generate a token and save it in MongoDB.
// 4. Send the tocken as a cookie to client.
authRoutes.post(
  "/login",
  //rateLimiterMiddleware,
  //preventBruteForce,
  userValidationRules("body", "username"),
  userValidationRules("body", "password"),
  validate,
  tryCatch((req, res, next) => {
    const agent = req.useragent;
    const username = req.body.username;
    let isEmail = false;
    let isPhoneNumber = false;
    let query;
    if (isEmailValid(username)) {
      isEmail = true;
      query = { "email.address": username };
    } else if (isValidMobilePhone(username)) {
      isPhoneNumber = true;
      query = { "phoneNumber.number": username };
    }
    return User.findOne(query)
      .then((user) => {
        if (!user) {
          const error = new myError(
            "Email or Password are not valid!",
            400,
            8,
            "نام کاربری یا گذرواژه معتبر نیستند!",
            "خطا رخ داد"
          );
          next(error);
        } else if (user && isEmail && user.email.validated !== true) {
          const error = new myError(
            "The email is not verified!",
            400,
            17,
            "آدرس ایمیل شما هنوز راستی آزمایی نشده است!",
            "خطا رخ داد"
          );
          next(error);
        } else if (
          user &&
          isPhoneNumber &&
          user.phoneNumber.number &&
          user.phoneNumber.validated !== true
        ) {
          const error = new myError(
            "The mobile phone is not verified!",
            400,
            18,
            "شماره موبایل شما هنوز راستی آزمایی نشده است!",
            "خطا رخ داد"
          );
          next(error);
        } else if (user && user.isActive !== true) {
          const error = new myError(
            "The account is not active!",
            400,
            18,
            "حساب کاربری شما غیرفعال شده است!",
            "خطا رخ داد"
          );
          next(error);
        } else {
          return user
            .comparePasswordPromise(req.body.password)
            .then((isMatch) => {
              if (!isMatch) {
                logger.info("Passwords are not match");
                const error = new myError(
                  "Username or Password are not valid!",
                  400,
                  8,
                  "نام کاربری یا گذرواژه معتبر نیستند!",
                  "خطا رخ داد"
                );
                next(error);
              } else {
                const userActivity = {
                  action: "LOGIN",
                  timestamp: Date.now(),
                  device: agent.source,
                  ip: req.ip,
                };
                user.userActivities.push(userActivity);
                return user
                  .save()
                  .then(() => {
                    req.session.userId = user._id;
                    const profile = {
                      name: user.name,
                      lastName: user.lastName,
                      userId: user._id,
                      userType: user.userType,
                    };
                    successRes(res, "", profile);
                  })
                  .catch((err) => {
                    logger.error(`Adding activity has some errors: ${err}`);
                    const error = new myError(
                      "Error happened during the login!",
                      500,
                      16,
                      "در ورود شما مشکلی پیش آمده است!",
                      "خطا در سرور"
                    );
                    next(error);
                  });
              }
            })
            .catch((err) => {
              logger.error(`comparePassword method has some errors: ${err}`);
              const error = new myError(
                "Error happened during the login!",
                500,
                16,
                "در ورود شما مشکلی پیش آمده است!",
                "خطا در سرور"
              );
              next(error);
            });
        }
      })
      .catch((err) => {
        logger.error(
          `The find action on User Collection with email ${req.body.email} has some errors: ${err}`
        );
        const error = new myError(
          "Error happened during the login!",
          500,
          16,
          "در ورود شما مشکلی پیش آمده است!",
          "خطا در سرور"
        );
        next(error);
      });
  })
);

type ObjectIdConstructor = {
  (str: string): mongoose.Types.ObjectId;
  new (str: string): mongoose.Types.ObjectId;
};
