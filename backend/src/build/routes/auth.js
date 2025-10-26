"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
var express = __importStar(require("express"));
exports.authRoutes = express.Router();
var uuid_1 = require("uuid");
var crypto = __importStar(require("crypto"));
var mongoose_1 = __importDefault(require("mongoose"));
var logger_1 = require("../api/logger");
var amqp_1 = require("../api/amqp");
var myError_1 = __importDefault(require("../api/myError"));
var user_1 = require("../db/user");
var validation_1 = require("../middlewares/validation");
var response_1 = __importDefault(require("../middlewares/response"));
var tryCatch_1 = __importDefault(require("../middlewares/tryCatch"));
var auth_1 = require("../middlewares/auth");
var fetch = __importStar(require("node-fetch"));
var mongoose_2 = require("mongoose");
var siwe_1 = require("siwe");
var preventBruteForce_1 = require("../middlewares/preventBruteForce");
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
exports.authRoutes.get("/siwe/nonce", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) {
    var nonce = (0, siwe_1.generateNonce)();
    console.log("Generated nonce:", nonce);
    req.session.siweNonce = nonce;
    (0, response_1.default)(res, "", { nonce: nonce });
}));
/**
 * Route to initialize SIWE login:
 * - Receives the SIWE message and signature from client
 * - Verifies the SIWE message and signature and ensures the nonce matches session
 * - If successful, stores wallet address in session
 */
exports.authRoutes.post("/siwe/login", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, signature, siweMessageObj, walletAddress, user, rnd, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, message = _a.message, signature = _a.signature;
                console.log("Received message:", message); // ADD LOG
                console.log("Received signature:", signature); // ADD LOG
                console.log("Session nonce:", req.session.siweNonce); // ADD LOG
                if (!message || !signature) {
                    return [2 /*return*/, next(new myError_1.default("SIWE params missing", 400, 1, "پارامترهای لازم ارسال نشده‌اند.", "خطا رخ داد"))];
                }
                try {
                    siweMessageObj = new siwe_1.SiweMessage(message);
                    console.log("Parsed SIWE message:", siweMessageObj); // ADD LOG
                }
                catch (err) {
                    console.error("SIWE parsing error:", err); // ADD LOG
                    return [2 /*return*/, next(new myError_1.default("SIWE message parsing failed", 400, 2, "پیام SIWE معتبر نیست.", "خطا رخ داد"))];
                }
                // Check nonce
                console.log("Message nonce:", siweMessageObj.nonce); // ADD LOG
                console.log("Session nonce:", req.session.siweNonce); // ADD LOG
                if (!req.session.siweNonce ||
                    req.session.siweNonce !== siweMessageObj.nonce) {
                    return [2 /*return*/, next(new myError_1.default("SIWE nonce mismatch or missing", 400, 2, "اعتبار nonce غیر مجاز است!", "درخواست معتبر نیست"))];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 8, , 9]);
                // Verify signature
                console.log("Validating signature..."); // ADD LOG
                return [4 /*yield*/, siweMessageObj.verify({ signature: signature })];
            case 2:
                _b.sent();
                console.log("Signature validation successful!"); // ADD LOG
                walletAddress = String(siweMessageObj.address).toLowerCase();
                req.session.siwe = {
                    address: walletAddress,
                    chainId: siweMessageObj.chainId,
                    issuedAt: siweMessageObj.issuedAt,
                };
                return [4 /*yield*/, user_1.User.findOne({ "wallet.address": walletAddress })];
            case 3:
                user = _b.sent();
                if (!!user) return [3 /*break*/, 5];
                rnd = require("crypto").randomBytes(32).toString("hex");
                return [4 /*yield*/, user_1.User.create({
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
                    })];
            case 4:
                user = _b.sent();
                return [3 /*break*/, 7];
            case 5:
                if (!(!user.wallet || !user.wallet.address)) return [3 /*break*/, 7];
                user.wallet = {
                    provider: "siwe",
                    address: walletAddress,
                    connectedAt: new Date(),
                };
                return [4 /*yield*/, user.save()];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                req.session.userId = String(user._id);
                delete req.session.siweNonce;
                logger_1.logger.info("SIWE login success: ".concat(walletAddress));
                (0, response_1.default)(res, "SIWE ورود موفقیت آمیز بود", {
                    address: walletAddress,
                    userId: String(user._id),
                });
                return [3 /*break*/, 9];
            case 8:
                err_1 = _b.sent();
                console.error("SIWE validation failed:", err_1); // ADD LOG
                logger_1.logger.error("SIWE validation failed", err_1);
                return [2 /*return*/, next(new myError_1.default("SIWE validation failed", 401, 3, "اعتبارسنجی SIWE با شکست مواجه شد.", "خطا رخ داد"))];
            case 9: return [2 /*return*/];
        }
    });
}); }));
/**
 * Check SIWE authentication state (is session/siwe valid)
 */
exports.authRoutes.get("/siwe/auth", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) {
    if (req.session.siwe && req.session.siwe.address) {
        (0, response_1.default)(res, "", { isAuth: true, address: req.session.siwe.address });
    }
    else {
        return next(new myError_1.default("SIWE unauthorized", 401, 1, "وارد نشده‌اید!", "لطفا ابتدا با Wallet وارد شوید"));
    }
}));
/**
 * SIWE logout (destroy wallet session)
 */
exports.authRoutes.get("/siwe/logout", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(req.session.siwe && req.session.siwe.address)) return [3 /*break*/, 5];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, user_1.User.findOneAndUpdate({ "wallet.address": String(req.session.siwe.address).toLowerCase() }, {
                        $push: {
                            userActivities: {
                                action: "SIWE_LOGOUT",
                                timestamp: Date.now(),
                                ip: req.ip,
                            },
                        },
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                err_2 = _a.sent();
                logger_1.logger.error("Updating SIWE logout activity error: ".concat(err_2));
                return [3 /*break*/, 4];
            case 4:
                delete req.session.siwe;
                _a.label = 5;
            case 5:
                // Also invalidate nonce if present
                if (req.session.siweNonce) {
                    delete req.session.siweNonce;
                }
                (0, response_1.default)(res, "SIWE لاگ اوت موفقیت آمیز بود");
                return [2 /*return*/];
        }
    });
}); }));
// This end point check "Authentication" of users from MongoDB.
exports.authRoutes.get("/auth", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) {
    if (!req.session.userId) {
        logger_1.logger.error("Unauthorized cookie");
        var error = new myError_1.default("Unauthorized cookie", 400, 1, "کاربر حق دسترسی ندارد!", "خطا رخ داد");
        next(error);
    }
    else {
        (0, response_1.default)(res, "", { isAuth: true });
    }
}));
// This end point delete "Token" of users who want to logout from MongoDB.
exports.authRoutes.get("/logout", preventBruteForce_1.rateLimiterMiddleware, auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var agant = req.useragent;
    var userActivity = {
        action: "LOGOUT",
        timestamp: Date.now(),
        device: agant.source,
        ip: req.ip,
    };
    user_1.User.findOneAndUpdate({ _id: req.session.userId }, { $push: { userActivities: userActivity } }).catch(function (err) {
        logger_1.logger.error("Updating user activity has some error: ".concat(err, " "));
    });
    req.session.destroy();
    (0, response_1.default)(res, "");
}));
exports.authRoutes.get("/verifyEmails", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("query", "string"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var id = req.query.string;
    return user_1.VerificationCode.findOne({ name: id })
        .then(function (doc) {
        if (!doc) {
            var error = new myError_1.default("Verification Code is not valid!", 400, 5, "کد راستی آزمایی معتبر نیست!", "خطا رخ داد");
            next(error);
        }
        else {
            return user_1.User.findOne({ emailVerificationString: doc._id })
                .then(function (user) {
                if (user &&
                    user.emailVerificationString.toString() === doc._id.toString()) {
                    user.email = {
                        address: doc.email,
                        validated: true,
                    };
                    user.emailVerificationString = undefined;
                    return user
                        .save()
                        .then(function () {
                        var data = {
                            email: user.email,
                        };
                        doc.deleteOne().catch(function (err) {
                            logger_1.logger.error(err);
                        });
                        (0, response_1.default)(res, "Email is verified", data);
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
                else {
                    return user_1.User.findOne({ email: doc.email })
                        .then(function (user) {
                        // @ts-ignore
                        if (user && user.email === doc.email) {
                            user.email = {
                                address: doc.email,
                                validated: true,
                            };
                            user.emailVerificationString = undefined;
                            return user
                                .save()
                                .then(function () {
                                var data = {
                                    email: user.email,
                                };
                                doc.deleteOne().catch(function (err) {
                                    logger_1.logger.error(err);
                                });
                                (0, response_1.default)(res, "Email is verified", data);
                            })
                                .catch(function (err) {
                                next(err);
                            });
                        }
                        else {
                            var error = new myError_1.default("Verification Code is not valid!", 400, 5, "کد راستی آزمایی معتبر نیست!", "خطا رخ داد");
                            next(error);
                        }
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
exports.authRoutes.get("/requestForPhoneCode", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("query", "phoneNumber"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var phoneNumber = (0, validation_1.numbersFormatter)(req.query.phoneNumber, "en");
    var code = Math.floor(Math.random() * 10000);
    var data = {
        pattern_code: process.env.SMS_API_PHONE_PATTERN_CODE,
        originator: process.env.SMS_API_DEFINITE_SENDER_NUMBER,
        recipient: phoneNumber.toString(),
        values: { "verification-code": code.toString() },
    };
    var rand = (0, uuid_1.v4)();
    var body = {
        phoneNumber: phoneNumber,
        sessionId: req.cookies.sessionId,
        code: code,
    };
    var verificationPhoneCode = new user_1.VerificationPhoneCode(__assign({}, body));
    return verificationPhoneCode
        .save()
        .then(function () {
        if (userId) {
            return user_1.User.findOne({ _id: userId })
                .then(function (user) {
                if (user && user._id.toString() === userId) {
                    user["tempPhoneNumber"] = verificationPhoneCode._id;
                    return user
                        .save()
                        .then(function () {
                        //@ts-ignore
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
                            .catch(function (err) {
                            var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                            throw error;
                        })
                            .then(function (res) { return res.json(); })
                            .then(function (response) {
                            // @ts-ignore
                            if (response.status === "OK") {
                                (0, response_1.default)(res, "");
                            }
                            else {
                                var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                                next(error);
                            }
                        })
                            .catch(function (err) {
                            next(err);
                        });
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
                else {
                    var error = new myError_1.default("The user does not exists!", 400, 11, "چنین کاربری در سیستم وجود ندارد!", "خطا رخ داد");
                    next(error);
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
        else {
            //@ts-ignore
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
                .catch(function (err) {
                var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                throw error;
            })
                .then(function (res) { return res.json(); })
                .then(function (response) {
                // @ts-ignore
                if (response.status === "OK") {
                    (0, response_1.default)(res, "");
                }
                else {
                    var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                    next(error);
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
exports.authRoutes.get("/verifyPhoneCode", preventBruteForce_1.rateLimiterMiddleware, (0, tryCatch_1.default)(function (req, res, next) {
    var phoneCode = req.query.phoneCode;
    var userId = req.session.userId;
    var sessionId = req.cookies.sessionId;
    return user_1.VerificationPhoneCode.findOne({
        $and: [{ sessionId: sessionId }, { code: phoneCode }],
    })
        .then(function (item) {
        if (item && item.sessionId === sessionId) {
            if (item.code === phoneCode) {
                var query = void 0;
                if (userId) {
                    query = { tempPhoneNumber: item._id };
                }
                else {
                    query = { "phoneNumber.number": item.phoneNumber };
                }
                return user_1.User.findOne(query)
                    .then(function (user) {
                    if (user) {
                        user.phoneNumber.number = item.phoneNumber;
                        user.phoneNumber.validated = true;
                        user["tempPhoneNumber"] = undefined;
                        return user
                            .save()
                            .then(function () {
                            (0, response_1.default)(res, "", item.phoneNumber);
                            return item.deleteOne().catch(function (err) {
                                logger_1.logger.error(err);
                            });
                        })
                            .catch(function (err) {
                            next(err);
                        });
                    }
                    else {
                        var error = new myError_1.default("The code is not valid!", 400, 11, "کد وارد شده معتبر نیست!", "خطا رخ داد");
                        next(error);
                    }
                })
                    .catch(function (err) {
                    next(err);
                });
            }
            else {
                var error = new myError_1.default("The code is not valid!", 400, 11, "کد وارد شده معتبر نیست!", "خطا رخ داد");
                next(error);
            }
        }
        else {
            var error = new myError_1.default("The code is not valid!", 400, 11, "کد وارد شده معتبر نیست!", "خطا رخ داد");
            next(error);
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////// POST ENDPOINTS  /////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////////////////////////////////////////////////////////////////////////
// This end point get the users' information and save those in MongoDB.
exports.authRoutes.post("/register", 
//rateLimiterMiddleware,
(0, validation_1.userValidationRules)("body", "name"), (0, validation_1.userValidationRules)("body", "lastName"), (0, validation_1.userValidationRules)("body", "username"), (0, validation_1.userValidationRules)("body", "password"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var username = req.body.username;
    var rand;
    var mailOptions;
    var dataSms;
    var code;
    var isEmail = false;
    var isPhoneNumber = false;
    var currencyObj = {
        currency: new mongoose_1.default.Types.ObjectId("5f859cb74da2d4150c96832d"),
        value: Number(10000000000000),
    };
    var currencyObj2 = {
        currency: new mongoose_1.default.Types.ObjectId("66101ae28a1414c98c0ea769"),
        value: Number(1000),
    };
    var setNewTempPhone = function () {
        return null;
    };
    var setEmailVeificationCode = function () {
        return null;
    };
    if ((0, validation_1.isEmailValid)(username)) {
        isEmail = true;
    }
    else if ((0, validation_1.isValidMobilePhone)(username)) {
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
    rand = (0, uuid_1.v4)();
    if (isEmail) {
        //const rand = process.env.NODE_ENV === 'test' ? 'cb0059c2-5566-4967-8c9d-1126d1e9eda4' : uuid4()
        var link = "".concat(process.env.API, "verify?type=email&string=").concat(rand);
        mailOptions = {
            from: process.env.SENDER_ADDRESS, // sender address
            to: username,
            subject: "Please confirm your Email account",
            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
                link +
                ">Click here to verify</a>",
        };
    }
    var body;
    var user;
    var verificationPhoneCode;
    if (isEmail) {
        setEmailVeificationCode = function () {
            var bodyEmailCode = {
                name: rand,
                email: username,
            };
            var newEmailCode = new user_1.VerificationCode(__assign({}, bodyEmailCode));
            return newEmailCode
                .save()
                .then(function () {
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
                user = new user_1.User(__assign({}, body));
            })
                .catch(function (err) {
                throw err;
            });
        };
    }
    else if (isPhoneNumber) {
        setNewTempPhone = function () {
            var bodyPhoneCode = {
                phoneNumber: (0, validation_1.numbersFormatter)(username, "en"),
                sessionId: req.cookies.sessionId,
                code: code,
            };
            verificationPhoneCode = new user_1.VerificationPhoneCode(__assign({}, bodyPhoneCode));
            return verificationPhoneCode
                .save()
                .then(function () { return __awaiter(void 0, void 0, void 0, function () {
                var currencies;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, getCurrencies()];
                        case 1:
                            currencies = _a.sent();
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
                            user = new user_1.User(__assign({}, body));
                            return [2 /*return*/];
                    }
                });
            }); })
                .catch(function (err) {
                if (err.code === 11000) {
                    logger_1.logger.error("The save action on Verification Collection with document ".concat(bodyPhoneCode, " has some errors: ").concat(err));
                    var error = new myError_1.default("!", 400, 9, "لطفا چند دقیقه بعد از درخواست قبلی صبر نمیایید!", "خطا رخ داد ");
                    throw error;
                }
                else
                    throw err;
            });
        };
    }
    return Promise.all([setNewTempPhone(), setEmailVeificationCode()])
        .then(function () {
        return user
            .save()
            .then(function () {
            var data = {
                email: user.email.address,
                tempPhoneNumber: verificationPhoneCode
                    ? verificationPhoneCode._id
                    : undefined,
                isActive: user.isActive,
            };
            if (isEmail) {
                var body1 = {
                    aUsername: username,
                    aPass: req.body.password,
                    aPassConfirm: req.body.password,
                    aFullname: req.body.name + req.body.lastName,
                    aTitle: username,
                    userId: user._id,
                    aGrps: ["5fd70c592147ef000630fe24"], //[group._id.toString()],
                    aEmail: username,
                };
                var body1Json = JSON.stringify(body1);
                (0, response_1.default)(res, "Registration is done successfully", data, {
                    isEmail: isEmail,
                });
                (0, amqp_1.publishQueueConnection)(mailOptions);
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
            }
            else if (isPhoneNumber) {
                var body1 = {
                    aUsername: username,
                    aPass: req.body.password,
                    aPassConfirm: req.body.password,
                    aFullname: req.body.name + req.body.lastName,
                    aTitle: username,
                    //aGrps: [group._id.toString()],
                    userId: user._id,
                    aEmail: username.concat("@gmail.com"),
                };
                var body1Json = JSON.stringify(body1);
                (0, response_1.default)(res, "Registration is done successfully", data, {
                    isPhoneNumber: isPhoneNumber,
                });
                //@ts-ignore
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
                    .catch(function (err) {
                    var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                    logger_1.logger.error(error.message);
                    next(err);
                })
                    // @ts-ignore
                    .then(function (res) { return res.json(); }) // expecting a json response
                    .then(function (response) {
                    if (response.status !== "OK") {
                        var error = new myError_1.default("The Sms service is not responding!", 400, 11, "سرویس ارسال پیامک دچار مشکل شده است. لطفا لحظاتی بعد دوباره اقدام فرمایید.", "خطا رخ داد");
                        logger_1.logger.error(error.message);
                    }
                })
                    .catch(function (err) {
                    logger_1.logger.error(err);
                });
                //@ts-ignore
                return fetch(process.env.API + "api/tickets/register", {
                    method: "POST",
                    body: body1Json,
                    headers: {
                        accessToken: process.env.ACCESS_TOKEN,
                        "Content-Type": "application/json",
                    },
                })
                    .then(function (res) { return res.json(); })
                    .then(function (response) { })
                    .catch(function (err) {
                    console.log(err);
                });
            }
        })
            .catch(function (err) {
            if (err.code === 11000) {
                logger_1.logger.error("The save action on User Collection with document ".concat(req.body.lastName, " has some errors: ").concat(err));
                var error = new myError_1.default("The user has registered already!", 400, 9, "شما قبلا ثبت نام کرده اید!", "خطا رخ داد ");
                next(error);
            }
            else {
                next(err);
            }
        });
    })
        .catch(function (err) {
        next(err);
    });
}));
exports.authRoutes.post("/sendEmailVerificationLink", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("body", "email"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var email = req.body.email;
    var userId = req.session.userId;
    var rand = (0, uuid_1.v4)();
    // const rand = process.env.NODE_ENV === 'test' ? 'cb0059c2-5566-4967-8c9d-1126d1e9eda5' : uuid4()
    var link = "".concat(process.env.API, "verify?type=email&string=").concat(rand);
    var mailOptions = {
        from: process.env.SENDER_ADDRESS, // sender address
        to: email,
        subject: "Please confirm your Email account",
        html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
            link +
            ">Click here to verify</a>",
    };
    var bodyEmailCode = {
        name: rand,
        email: email,
    };
    var newEmailCode = new user_1.VerificationCode(__assign({}, bodyEmailCode));
    return newEmailCode
        .save()
        .then(function () {
        if (userId) {
            return user_1.User.findOne({ _id: userId })
                .then(function (user) {
                if (user && user._id.toString() === userId) {
                    return user
                        .updateOne({
                        $set: { emailVerificationString: newEmailCode._id },
                    })
                        .then(function () {
                        var data = {
                            email: email,
                        };
                        (0, response_1.default)(res, "Please verify your email", data);
                        (0, amqp_1.publishQueueConnection)(mailOptions);
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
                else {
                    var error = new myError_1.default("The user does not exists!", 400, 11, "چنین کاربری در سیستم وجود ندارد!", "خطا رخ داد");
                    next(error);
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
        else {
            var data = {
                email: email,
            };
            (0, response_1.default)(res, "Please verify your email", data);
            (0, amqp_1.publishQueueConnection)(mailOptions);
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
exports.authRoutes.post("/sendPasswordVerificationLink", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("body", "email"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var email = req.body.email;
    return user_1.User.findOne({
        $and: [{ "email.address": email }, { "email.validated": true }],
    })
        .then(function (user) {
        if (!user) {
            var error = new myError_1.default("Email address is not valid!", 400, 12, "چنین کاربری در سیستم ثبت‌نام نهایی انجام نداده است!", "خطا رخ داد");
            next(error);
        }
        else {
            var rand = process.env.NODE_ENV === "test"
                ? "e39459ee-18b4-4967-aaaa-f22fb26a8beb"
                : (0, uuid_1.v4)();
            // const rand = uuid4()
            var link = "".concat(process.env.API, "verify?type=password&string=").concat(rand);
            var mailOptions_1 = {
                from: process.env.SENDER_ADDRESS, // sender address
                to: email,
                subject: "Please confirm your Email account",
                html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
                    link +
                    ">Click here to verify</a>",
            };
            var hash = crypto
                .createHmac("sha256", process.env.CRYPTO_SECRET)
                .update(rand)
                .digest("hex");
            var verificationCode_1 = new user_1.VerificationCode({
                code: hash,
                name: rand,
            });
            return verificationCode_1
                .save()
                .then(function () {
                return user
                    .updateOne({
                    $set: {
                        resetPasswordVerificationString: new mongoose_2.Types.ObjectId(verificationCode_1._id),
                    },
                })
                    .then(function () {
                    (0, response_1.default)(res, "Please verify your email");
                    (0, amqp_1.publishQueueConnection)(mailOptions_1);
                })
                    .catch(function (err) {
                    next(err);
                });
            })
                .catch(function (err) {
                next(err);
            });
        }
    })
        .catch(function (err) {
        logger_1.logger.error("The find action on User Collection with email ".concat(email, " has some errors: ").concat(err));
        next(err);
    });
}));
exports.authRoutes.post("/resetPassword", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("body", "id"), (0, validation_1.userValidationRules)("body", "password"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var id = req.body.id;
    var hash = crypto
        .createHmac("sha256", process.env.CRYPTO_SECRET)
        .update(id)
        .digest("hex");
    return user_1.VerificationCode.findOne({ code: hash })
        .then(function (doc) {
        if (!doc) {
            logger_1.logger.warn("ResetPasswordVerificationString ".concat(hash, " is not valid!"));
            var error = new myError_1.default("Verification Code is not valid!", 400, 5, "کد راستی آزمایی معتبر نیست!", "خطا رخ داد");
            next(error);
        }
        else {
            return user_1.User.findOne({ resetPasswordVerificationString: doc._id })
                .then(function (user) {
                if (!user) {
                    logger_1.logger.error("The query on User Collection with resetPasswordVerificationString ".concat(id, " has response null!"));
                    var error = new myError_1.default("Verification Code is not valid!", 400, 5, "کد راستی آزمایی معتبر نیست!", "خطا رخ داد");
                    next(error);
                }
                else {
                    user.password = req.body.password;
                    user.resetPasswordVerificationString = undefined;
                    user_1.VerificationCode.deleteOne({ code: hash }).catch(function (err) {
                        logger_1.logger.error(err);
                    });
                    return user
                        .save()
                        .then(function () {
                        var data = {
                            email: user.email.address,
                        };
                        (0, response_1.default)(res, "password is successfuly reset", data);
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
exports.authRoutes.post("/resetPasswordWithPhone", preventBruteForce_1.rateLimiterMiddleware, (0, validation_1.userValidationRules)("body", "password"), (0, validation_1.userValidationRules)("body", "passwordConfirm"), 
// userValidationRules('body', 'verificationCode'),
validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    console.log(req.body);
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;
    var verificationCode = req.body.verificationCode;
    var sessionId = req.cookies.sessionId;
    if (password !== passwordConfirm) {
        var error = new myError_1.default("passwords do not match!", 400, 11, "پسورد ها باهم همخوانی ندارند", "خطا رخ داد");
        next(error);
    }
    else {
        return user_1.VerificationPhoneCode.findOne({
            $and: [{ code: verificationCode }, { sessionId: sessionId }],
        })
            .then(function (item) {
            if (item &&
                item.code.toString() === verificationCode.toString() &&
                item.sessionId.toString() === sessionId.toString()) {
                return user_1.User.findOne({ "phoneNumber.number": item.phoneNumber })
                    .then(function (user) {
                    if (user &&
                        user.phoneNumber &&
                        user.phoneNumber.number === item.phoneNumber) {
                        if (user.phoneNumber.validated === true) {
                            user.password = password;
                            return user
                                .save()
                                .then(function () {
                                return item
                                    .deleteOne()
                                    .then(function () {
                                    (0, response_1.default)(res, "", user.phoneNumber.number);
                                })
                                    .catch(function (err) {
                                    next(err);
                                });
                            })
                                .catch(function (err) {
                                next(err);
                            });
                        }
                        else {
                            var error = new myError_1.default("The phoneNumber is not validated!", 400, 18, "شماره مورد نظر هنوز راستی آزمایی نشده است!", "خطا رخ داد");
                            next(error);
                        }
                    }
                    else {
                        var error = new myError_1.default("The code is not valid!", 400, 11, "کد معتبر نیست", "خطا رخ داد");
                        next(error);
                    }
                })
                    .catch(function (err) {
                    next(err);
                });
            }
            else {
                var error = new myError_1.default("The code is not valid!", 400, 11, "کد معتبر نیست", "خطا رخ داد");
                next(error);
            }
        })
            .catch(function (err) {
            next(err);
        });
    }
}));
exports.authRoutes.post("/changePassword", preventBruteForce_1.rateLimiterMiddleware, auth_1.isAuthorized, (0, validation_1.userValidationRules)("body", "password"), validation_1.validate, (0, validation_1.userValidationRules)("body", "newPassword"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    return user_1.User.findOne({ email: req.session.email })
        .then(function (user) {
        if (!user) {
            logger_1.logger.warn("Email address is not valid!");
            var error = new myError_1.default("Email address is not valid!", 12, 400, "آدرس ایمیل معتبر نیست!", "خطا رخ داد");
            next(error);
        }
        else {
            return (user
                // @ts-ignore
                .comparePasswordPromise(req.body.password)
                .then(function (isMatch) {
                if (!isMatch) {
                    logger_1.logger.warn("Password is not valid!");
                    var error = new myError_1.default("Inputs are not valid!", 400, 15, "ورودی های درخواستی معتبر نیستند!", "خطا رخ داد");
                    next(error);
                }
                else {
                    user.password = req.body.newPassword;
                    return user
                        .save()
                        .then(function () {
                        (0, response_1.default)(res, "password is successfuly changed");
                    })
                        .catch(function (err) {
                        next(err);
                    });
                }
            })
                .catch(function (err) {
                next(err);
            }));
        }
    })
        .catch(function (err) {
        next(err);
    });
}));
// This end point execute the following actions:
// 1. Find the document of a user who send the email.doc
// 2. Compare the Passord to hash of the password which is stored in MongoDB.
// 3. Generate a token and save it in MongoDB.
// 4. Send the tocken as a cookie to client.
exports.authRoutes.post("/login", 
//rateLimiterMiddleware,
//preventBruteForce,
(0, validation_1.userValidationRules)("body", "username"), (0, validation_1.userValidationRules)("body", "password"), validation_1.validate, (0, tryCatch_1.default)(function (req, res, next) {
    var agent = req.useragent;
    var username = req.body.username;
    var isEmail = false;
    var isPhoneNumber = false;
    var query;
    if ((0, validation_1.isEmailValid)(username)) {
        isEmail = true;
        query = { "email.address": username };
    }
    else if ((0, validation_1.isValidMobilePhone)(username)) {
        isPhoneNumber = true;
        query = { "phoneNumber.number": username };
    }
    return user_1.User.findOne(query)
        .then(function (user) {
        if (!user) {
            var error = new myError_1.default("Email or Password are not valid!", 400, 8, "نام کاربری یا گذرواژه معتبر نیستند!", "خطا رخ داد");
            next(error);
        }
        else if (user && isEmail && user.email.validated !== true) {
            var error = new myError_1.default("The email is not verified!", 400, 17, "آدرس ایمیل شما هنوز راستی آزمایی نشده است!", "خطا رخ داد");
            next(error);
        }
        else if (user &&
            isPhoneNumber &&
            user.phoneNumber.number &&
            user.phoneNumber.validated !== true) {
            var error = new myError_1.default("The mobile phone is not verified!", 400, 18, "شماره موبایل شما هنوز راستی آزمایی نشده است!", "خطا رخ داد");
            next(error);
        }
        else if (user && user.isActive !== true) {
            var error = new myError_1.default("The account is not active!", 400, 18, "حساب کاربری شما غیرفعال شده است!", "خطا رخ داد");
            next(error);
        }
        else {
            return (user
                // @ts-ignore
                .comparePasswordPromise(req.body.password)
                .then(function (isMatch) {
                if (!isMatch) {
                    logger_1.logger.info("Passwords are not match");
                    var error = new myError_1.default("Username or Password are not valid!", 400, 8, "نام کاربری یا گذرواژه معتبر نیستند!", "خطا رخ داد");
                    next(error);
                }
                else {
                    var userActivity = {
                        action: "LOGIN",
                        timestamp: Date.now(),
                        device: agent.source,
                        ip: req.ip,
                    };
                    user.userActivities.push(userActivity);
                    return user
                        .save()
                        .then(function () {
                        req.session.userId = user._id;
                        var profile = {
                            name: user.name,
                            lastName: user.lastName,
                            userId: user._id,
                            userType: user.userType,
                        };
                        (0, response_1.default)(res, "", profile);
                    })
                        .catch(function (err) {
                        logger_1.logger.error("Adding activity has some errors: ".concat(err));
                        var error = new myError_1.default("Error happened during the login!", 500, 16, "در ورود شما مشکلی پیش آمده است!", "خطا در سرور");
                        next(error);
                    });
                }
            })
                .catch(function (err) {
                logger_1.logger.error("comparePassword method has some errors: ".concat(err));
                var error = new myError_1.default("Error happened during the login!", 500, 16, "در ورود شما مشکلی پیش آمده است!", "خطا در سرور");
                next(error);
            }));
        }
    })
        .catch(function (err) {
        logger_1.logger.error("The find action on User Collection with email ".concat(req.body.email, " has some errors: ").concat(err));
        var error = new myError_1.default("Error happened during the login!", 500, 16, "در ورود شما مشکلی پیش آمده است!", "خطا در سرور");
        next(error);
    });
}));
//# sourceMappingURL=auth.js.map