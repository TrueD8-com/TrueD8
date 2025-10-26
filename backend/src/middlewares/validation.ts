import {
  body,
  param,
  query,
  validationResult,
  check,
  cookie,
} from "express-validator";
import myError from "../api/myError";
//@ts-ignore

import { every, isDate, isLength } from "lodash-es";

export function isEmailValid(mail) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(mail);
}

export const isValidMobilePhone = (phone) => {
  return (
    phone.length === 11 &&
    (phone[0] === "0" || phone[0] === "۰") &&
    (phone[1] === "9" || phone[1] === "۹") &&
    (/^\d+$/.test(phone) || /^\d+$/.test(numbersFormatter(phone, "en")))
  );
};

const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d.getTime());
};
// A helper for converting non-persian numbers to persian ones.
let arabicNumbers = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٠"],
  persianNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"],
  englishNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

function searchAndReplaceInNumbers(value, source, target) {
  for (let i = 0, len = target.length; i < len; i++) {
    value = value.replace(new RegExp(source[i], "g"), target[i]);
  }
  return value;
}

export function numbersFormatter(value, to = "fa") {
  value = typeof value === "number" ? String(value) : value;
  if (!value) return value;
  let output = value;
  if (to === "fa") {
    output = searchAndReplaceInNumbers(output, englishNumbers, persianNumbers);
    output = searchAndReplaceInNumbers(output, arabicNumbers, persianNumbers);
  } else if (to === "en") {
    output = searchAndReplaceInNumbers(output, persianNumbers, englishNumbers);
    output = searchAndReplaceInNumbers(output, arabicNumbers, englishNumbers);
  }
  return output;
}
import * as mongo from "mongodb";
const ObjectId = mongo.ObjectId;
export const userValidationRules = (type, input) => {
  /// /////////////////////////////////////////
  /// //////// body  //////////////////////////
  /// /////////////////////////////////////////

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// user  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////

  // ----------- SKH ----------------

  // ------- body --------

  if (type === "body" && input === "curGivenId") {
    return [
      body("curGivenId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curGivenId is required!",
        clientMessage: "شناسه ارز پیشنهادی مورد نیاز است!",
      }),
      body("curGivenId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curGivenId is not valid!",
        clientMessage: "شناسه ارز پیشنهادی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curGivenIdOp") {
    return [
      body("curGivenIdOp").optional().isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curGivenIdOp is not valid!",
        clientMessage: "شناسه ارز پیشنهادی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curGivenVal") {
    return [
      body("curGivenVal").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curGivenVal is required!",
        clientMessage: "مقدار ارز پیشنهادی مورد نیاز است!",
      }),
      body("curGivenVal").isNumeric().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curGivenVal is not valid!",
        clientMessage: "مقدار ارز پیشنهادی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curGivenValOp") {
    return [
      body("curGivenValOp")
        .optional()
        .custom((v) => {
          if (!v.from && !v.to) {
            return false;
          } else if (v.from && Number(v.from <= 0)) {
            return false;
          } else if (v.to && Number(v.to <= 0)) {
            return false;
          } else {
            return true;
          }
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curGivenValOp is not valid!",
          clientMessage: "مقدار ارز پیشنهادی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "curTakenId") {
    return [
      body("curTakenId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curTakenId is required!",
        clientMessage: "شناسه ارز درخواستی مورد نیاز است!",
      }),
      body("curTakenId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curTakenId is not valid!",
        clientMessage: "شناسه ارز درخواستی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curTakenIdOp") {
    return [
      body("curTakenIdOp").optional().isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curTakenIdOp is not valid!",
        clientMessage: "شناسه ارز درخواستی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curTakenVal") {
    return [
      body("curTakenVal").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curTakenVal is required!",
        clientMessage: "مقدار ارز درخواستی مورد نیاز است!",
      }),
      body("curTakenVal").isNumeric().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "curTakenVal is not valid!",
        clientMessage: "مقدار ارز درخواستی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "curTakenValOp") {
    return [
      body("curTakenValOp")
        .optional()
        .custom((v) => {
          if (!v.from && !v.to) {
            return false;
          } else if (v.from && Number(v.from <= 0)) {
            return false;
          } else if (v.to && Number(v.to <= 0)) {
            return false;
          } else {
            return true;
          }
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curTakenValOp is not valid!",
          clientMessage: "مقدار ارز پیشنهادی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "expDate") {
    return [
      body("expDate").exists().withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "expDate is not valid!",
        clientMessage: "تاریخ انقضا مورد نیاز است!",
      }),
      body("expDate")
        .custom((v) => {
          let date = new Date(v).getTime();
          console.log(
            "date is ",
            date,
            "and the diffrence is ",
            new Date().getTime() - date
          );
          return date > new Date().getTime();
        })
        .withMessage({
          clientCode: 12,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "expDate is not valid!",
          clientMessage: "تاریخ انقضا معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "expDateOp") {
    return [
      body("expDateOp")
        .optional()
        .custom((v) => {
          if (!v.from && !v.to) {
            return false;
          } else if (v.from && isValidDate(v.from)) {
            return false;
          } else if (v.to && isValidDate(v.to)) {
            return false;
          } else if (v.from > v.to) {
            return false;
          } else {
            return true;
          }
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "expDateOp is not valid!",
          clientMessage: "تاریخ انقضا پیشنهادی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "created_atOp") {
    return [
      body("created_atOp")
        .optional()
        .custom((v) => {
          if (!v.from && !v.to) {
            return false;
          } else if (v.from && isValidDate(v.from)) {
            return false;
          } else if (v.to && isValidDate(v.to)) {
            return false;
          } else if (v.from > v.to) {
            return false;
          } else {
            return true;
          }
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "created_atOp is not valid!",
          clientMessage: "تاریخ تولید پیشنهادی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "currency") {
    return [
      body("currency").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "currency is required!",
        clientMessage: "ارز مورد نیاز است!",
      }),
      body("currency").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "currency is not valid!",
        clientMessage: "ارز معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "currencyId") {
    return [
      body("currencyId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "currency is required!",
        clientMessage: "ارز مورد نیاز است!",
      }),
      body("currencyId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "currency is not valid!",
        clientMessage: "ارز معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "quantity") {
    return [
      body("quantity").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "quantity is required!",
        clientMessage: "تعداد درخواستی ارز مورد نیاز است!",
      }),
      body("quantity").isNumeric().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "quantity is not valid!",
        clientMessage: "تعداد درخواستی ارز معتبر نیست!",
      }),
    ];
  }
  if (type === "body" && input === "offerIdOp") {
    return [
      body("offerIdOp").optional().isUUID().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "offerId is not valid!",
        clientMessage: "شناسه پیشنهاد معتبر نیست!",
      }),
    ];
  }

  // ------- Query --------

  if (type === "query" && input === "offerId") {
    return [
      query("offerId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "offerId is required!",
        clientMessage: "شناسه پیشنهاد مورد نیاز است!",
      }),
      query("offerId").isUUID().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "offerId is not valid!",
        clientMessage: "شناسه پیشنهاد معتبر نیست!",
      }),
    ];
  }

  // --------------------------------

  // -------------------------------- /
  else if (type === "query" && input === "currencyId") {
    return [
      query("currencyId")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curreny id can not method not ",
          clientMessage: " ارز نمی‌تواند خال باشد.",
        })
        .isMongoId()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curreny id is not valid!",
          clientMessage: "ارز  معتبر نیست.!",
        }),
    ];
  } else if (type === "body" && input === "name") {
    return [
      body("name")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "name cn not be empty",
          clientMessage: "نام نمی تواند خالی باشد",
        })
        .isString()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "name is not valid!",
          clientMessage: " نام معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "currencyName") {
    return [
      body("currencyName")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "name cn not be empty",
          clientMessage: "نام نمی تواند خالی باشد",
        })
        .isString()
        .custom((curName) => {
          return (
            curName === "BITCOIN" ||
            curName === "RIAL" ||
            curName === "TRON" ||
            curName === "ETHEREUM"
          );
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "currency name info  is not valid!",
          clientMessage: " نام معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "persianName") {
    return [
      body("persianName")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "name cn not be empty",
          clientMessage: "نام فارسی نمی تواند خالی باشد",
        })
        .isString()
        .custom((perName) => {
          return (
            perName === "اتریوم" ||
            perName === "ترون" ||
            perName === "بیت کوین" ||
            perName === "ریال"
          );
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "persian name is not valid !",
          clientMessage: " نام فارسی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "abName") {
    return [
      body("abName")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "short name can not be empty",
          clientMessage: "مخفف نمی تواند خالی باشد",
        })
        .isString()
        .custom((shortName) => {
          return (
            shortName === "ETH" ||
            shortName === "BTC" ||
            shortName === "TRX" ||
            shortName === "IRR"
          );
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "short name is not valid!",
          clientMessage: " مخفف  معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "currencyId") {
    return [
      body("currencyId")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curreny id can not method not ",
          clientMessage: " ارز نمی‌تواند خال باشد.",
        })
        .isMongoId()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curreny id is not valid!",
          clientMessage: "ارز  معتبر نیست.!",
        }),
    ];
  } else if (type === "body" && input === "currencyValue") {
    return [
      body("currencyValue")
        .exists()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "curreny value is not exsist!",
          clientMessage: " مقدار نمی تواند خالی باشد!",
        })
        .isNumeric()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "currency value should be number",
          clientMessage: "مقدار ارز بایذ عدد باشد",
        })
        .custom((v) => {
          return v >= 0;
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "the value should be positive!",
          clientMessage: "مقدار باید مثبت باشد",
        }),
    ];
  } else if (type === "body" && input === "receiverUserId") {
    return [
      body("receiverUserId")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: " receiver User Id can not be empty",
          clientMessage: " شناسه گیرنده نمی تواند خالی باشد ",
        })
        .isMongoId()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "receiver User Id is not valid!",
          clientMessage: "شناسه گیرنده معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "receiverUsername") {
    return [
      body("receiverUsername")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: " receiver Username can not be empty",
          clientMessage: " شناسه گیرنده نمی تواند خالی باشد ",
        })
        .custom((v) => {
          return isEmailValid(v) || isValidMobilePhone(v);
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "receiver Username is not valid!",
          clientMessage: "شناسه گیرنده معتبر نیست",
        }),
    ];
  }

  /// /////////////////////////////////////////
  /// //////// query  //////////////////////////
  /// /////////////////////////////////////////

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// user  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "uuid") {
    return [
      query("uuid").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "uuid is required!",
        clientMessage: "شناسه منحصربفرد پیشنهاد مورد نیاز است!",
      }),
      query("uuid").isUUID().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "uuid is not valid!",
        clientMessage: "شناسه منحصربفرد پیشنهاد معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "title") {
    return [
      body("title").optional().isString().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "title is not valid!",
        clientMessage: "تیتر معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "body") {
    return [
      body("body").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "body is not present!",
        clientMessage: "بدنه نظر موجود نیست!",
      }),
      body("body").isString().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "body is not valid!",
        clientMessage: "بدنه معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "rate") {
    return [
      body("rate").optional().isNumeric().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "rate is not valid!",
        clientMessage: "امتیاز معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "titleOp") {
    return [
      body("titleOp").optional().isString().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "title is not valid!",
        clientMessage: "تیتر معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "bodyOp") {
    return [
      body("bodyOp").optional().isString().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "body is not valid!",
        clientMessage: "بدنه نظر معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "rateOp") {
    return [
      body("rateOp").optional().isNumeric().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "rate is not valid!",
        clientMessage: "امتیاز معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "reviewId") {
    return [
      body("reviewId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ReviewId Code is required!",
        clientMessage: "شناسه نظر مورد نیاز است!",
      }),
      body("reviewId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ReviewId Code is not valid!",
        clientMessage: "شناسه نظر معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "question") {
    return [
      body("question").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "question is required!",
        clientMessage: "سوال مورد نیاز است!",
      }),
      body("question").isString().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "question is not valid!",
        clientMessage: "سوال صحیح معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "profileName") {
    return [
      body("profileName").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "profileName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "profileLastName") {
    return [
      body("profileLastName").optional().exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "profileLastName is required!",
        clientMessage: "نام خانوادگی معتبر نیست!",
      }),
      //  body('question').isString().withMessage({ clientCode: 5, statusCode: 422, title: 'خطا رخ داد', messageEnglish: 'question is not valid!', clientMessage: 'سوال صحیح معتبر نیست!' })
    ];
  } else if (type === "body" && input === "profileBirthdate") {
    console.log(body("profileBirthdate"));
    return [
      body("profileBirthdate")
        .optional()
        .custom((v) => {
          return v.year && v.month && v.day;
        })
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "profileBirthdate is required!",
          clientMessage: "سن مورد نیاز است",
        }),
    ];
  } else if (type === "body" && input === "profilePhoneNumber") {
    return [
      body("profilePhoneNumber").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "profilePhoneNumber is required!",
        clientMessage: "شماره تلفن مورد نیاز است!",
      }),
    ];
  } else if (type === "body" && input === "question") {
    return [
      body("question").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "question is required!",
        clientMessage: "سوال مورد نیاز است!",
      }),
      body("question").isString().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "question is not valid!",
        clientMessage: "سوال صحیح معتبر نیست!",
      }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// service  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "body" && input === "productId") {
    return [
      body("productId").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is required!",
        clientMessage: "شناسه محصول مورد نیاز است!",
      }),
      body("productId").isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
      body("productId").isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "quantity") {
    return [
      body("quantity").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Quantity is required!",
        clientMessage: "تعداد محصول مورد نیاز است!",
      }),
      body("quantity").isInt({ min: 1 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Quantity is not valid!",
        clientMessage: "تعداد محصول معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "isExisted") {
    return [
      body("isExisted").optional().isBoolean().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "isExisted is not valid!",
        clientMessage: "شناسه وجود معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "rate") {
    return [
      body("rate").optional().isInt({ min: 1, max: 5 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Rate is not valid!",
        clientMessage: "شناسه امتیازدهی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productRate") {
    return [
      body("productRate").optional().isInt({ min: 1, max: 5 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productRate is not valid!",
        clientMessage: "شناسه امتیازدهی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "brands") {
    return [
      body("brands").optional().isArray({ min: 1 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "brands is not valid!",
        clientMessage: "شناسه برند معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryBrands") {
    return [
      body("categoryBrands").optional().isArray({ min: 1 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryBrands is not valid!",
        clientMessage: "شناسه برند معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "priceObject") {
    return [
      body("priceObject")
        .optional()
        .custom((value) => {
          return value.from >= 0 && value.to;
        })
        .withMessage({
          clientCode: 28,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "priceObject are not valid!",
          clientMessage: "مقادیر معتبر نیستند!",
        }),
      body("priceObject")
        .optional()
        .custom((value) => {
          return value.from < value.to;
        })
        .withMessage({
          clientCode: 128,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "priceObject are not valid!",
          clientMessage: "مقادیر معتبر نیستند!",
        }),
      body("priceObject.from").optional().isInt({ min: 0 }).withMessage({
        clientCode: 101,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "priceObject are not valid!",
        clientMessage: "مقادیر معتبر نیستند!",
      }),
      body("priceObject.to").optional().isInt({ min: 0 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "priceObject are not valid!",
        clientMessage: "مقادیر معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "offPercentOp") {
    return [
      body("offPercentOp").optional().isInt({ min: 1 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "OffPercent is not valid!",
        clientMessage: "شناسه تخفیف معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "offPercent") {
    return [
      body("offPercent").exists().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "OffPercent is not present!",
        clientMessage: "شناسه تخفیف لازم است!",
      }),
      body("offPercent").isInt({ min: 1 }).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "OffPercent is not valid!",
        clientMessage: "شناسه تخفیف معتبر نیست!",
      }),
    ];
  }
  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// auth  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "body" && input === "email") {
    return [
      body("email").exists().withMessage({
        clientCode: 7,
        statusCode: 422,
        messageEnglish: "Email and Password are required!",
        clientMessage: "ایمیل و گذرواژه مورد نیاز است!",
      }),
      body("email").isEmail().withMessage({
        clientCode: 8,
        statusCode: 422,
        messageEnglish: "Email or Password are not valid!",
        clientMessage: "ایمیل یا گذرواژه معتبر نیست",
      }),
    ];
  } else if (type === "body" && input === "password") {
    return [
      body("password").exists().withMessage({
        clientCode: 7,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Email and Password are required!",
        clientMessage: "ایمیل و گذرواژه مورد نیاز است!",
      }),
      body("password").isString().isLength({ min: 6 }).withMessage({
        clientCode: 8,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Email or Password are not valid!",
        clientMessage: "ایمیل یا گذرواژه معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "newPassword") {
    return [
      body("newPassword").exists().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Passwords are required!",
        clientMessage: "گذرواژه ها مورد نیاز است!",
      }),
      body("newPassword").isString().isLength({ min: 6 }).withMessage({
        clientCode: 80,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "New password is not strong!",
        clientMessage: "گذرواژه به اندازه کافی قوی انتخاب نشده است!",
      }),
    ];
  } else if (type === "body" && input === "passwordConfirm") {
    return [
      body("passwordConfirm").exists().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Passwords are required!",
        clientMessage: "گذرواژه ها مورد نیاز است!",
      }),
      body("passwordConfirm").isString().isLength({ min: 6 }).withMessage({
        clientCode: 80,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "New password is not strong!",
        clientMessage: "گذرواژه به اندازه کافی قوی انتخاب نشده است!",
      }),
    ];
  } else if (type === "body" && input === "name") {
    return [
      body("name").exists().withMessage({
        clientCode: 76,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Name is required!",
        clientMessage: "نام مورد نیاز است!",
      }),
      body("name").isString().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Name is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "lastName") {
    return [
      body("lastName").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "LastName is required!",
        clientMessage: "نام خانوادگی مورد نیاز است!",
      }),
      body("lastName").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "LastName is not valid!",
        clientMessage: "نام خانوادگی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "phoneNumber") {
    return [
      body("phoneNumber")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "phoneNumber",
          clientMessage: "  شماره تلفن ورودی معتبر نیست!",
        })
        .isLength({ min: 8, max: 11 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "phoneNumber",
          clientMessage: " آشماره تلفن ورودی معتبر نیست!",
        }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// admin  ///////////////////////////////////////////////////////////////
  /// //////////////////////////////////////////////////////////////////////////////z
  else if (type === "body" && input === "orderOrderStatus") {
    return [
      // body('orderOrderStatus').optional().custom((v) => { return (v.status) })
      //   .withMessage({ clientCode: 78, statusCode: 422, title: 'خطا رخ داد', messageEnglish: 'orderOrderStatus is required!', clientMessage: ' حالت ورودی سفارش معتبر نیست!' }),
      // body('orderOrderStatus').optional()
      //   .custom((v) => { return Object.keys(v).every((i) => { return ['status', 'date'].includes(i) }) })
      //   .withMessage({ clientCode: 78, statusCode: 422, title: 'خطا رخ داد', messageEnglish: "orderOrderStatus is not valid!", clientMessage: ' حالت ورودی سفارش معتبر نیست!' }),
      body("orderOrderStatus").optional().equals("Canceled").withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderStatus is not valid!",
        clientMessage: " حالت ورودی سفارش معتبر نیست!",
      }),
      // body('orderOrderStatus.status').optional().isIn(['Pending', 'Successful', 'Failed', 'Canceled', 'Edited'])
      //   .withMessage({ clientCode: 78, statusCode: 422, title: 'خطا رخ داد', messageEnglish: "orderOrderStatus's fields are not valid!", clientMessage: ' حالت ورودی سفارش معتبر نیست!' }),
      // body('orderOrderStatus.date').optional().custom(isDate)
      //   .withMessage({ clientCode: 78, statusCode: 422, title: 'خطا رخ داد', messageEnglish: "orderOrderStatus's fields are not valid!", clientMessage: ' حالت ورودی سفارش معتبر نیست!' })
    ];
  } else if (type === "body" && input === "orderAddress") {
    return [
      body("orderAddress")
        .optional()
        .custom((v) => {
          return (
            v.phone ||
            v.mobilePhone ||
            v.city ||
            v.address ||
            v.province ||
            v.postalCode
          );
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress")
        .optional()
        .custom((v) => {
          return Object.keys(v).every((i) => {
            return [
              "phone",
              "mobilePhone",
              "city",
              "address",
              "province",
              "postalCode",
            ].includes(i);
          });
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.phone")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 8, max: 11 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.mobilePhone")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 10, max: 11 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.city")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 2, max: 20 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.address")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 1, max: 100 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.province")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 2, max: 20 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
      body("orderAddress.postalCode")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 10, max: 10 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderAddress's fields are not valid!",
          clientMessage: " آدرس ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "orderDelivery") {
    return [
      body("orderDelivery")
        .optional()
        .custom((v) => {
          return v.status || v.date || v.code;
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        }),
      body("orderDelivery")
        .optional()
        .custom((v) => {
          return Object.keys(v).every((i) => {
            return ["status", "date", "code"].includes(i);
          });
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        }),
      body("orderDelivery.status")
        .optional()
        .isIn(["Sent", "Received", "Failed", "Unknown"])
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        }),
      body("orderDelivery.code")
        .optional()
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        })
        .isLength({ min: 1, max: 15 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        }),
      body("orderDelivery.price").optional().isInt({ min: 0 }).withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderDelivery's fields are not valid!",
        clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
      }),
      body("orderDelivery.date")
        .optional()
        .custom((v) => {
          let date = new Date(v).getTime();
          return date < new Date().getTime();
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderDelivery's fields are not valid!",
          clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "orderOrderId") {
    return [
      body("orderOrderId").exists().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderId's fields are not valid!",
        clientMessage: "شناسه ورودی سفارش معتبر نیست!",
      }),

      body("orderOrderId")
        .custom((v) => {
          return (
            v.toString().indexOf(".1") > -1 || v.toString().indexOf(".2") > -1
          );
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderOrderId's fields are not valid!",
          clientMessage: "شناسه ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "orderItems") {
    return [
      body("orderItems")
        .optional()
        .custom((v) => {
          let existanceArray = [];
          return v.every((f) => {
            if (existanceArray.includes(f.product.toString())) {
              return false;
            }
            existanceArray.push(f.product.toString());
            return Object.keys(f).every((i) => {
              if (i == "product") {
                return ObjectId.isValid(f.product);
              } else if (i == "quantity") {
                return (
                  Number.isInteger(Number(f.quantity)) &&
                  Number(f.quantity) >= 0
                );
              } else {
                return false;
              }
            });
          });
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderItems's fields are not valid!",
          clientMessage: "تعداد ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "province") {
    return [
      body("province").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Province is required!",
        clientMessage: "نام استان مورد نیاز است!",
      }),
      body("province").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Province is not valid!",
        clientMessage: "نام استان معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "title") {
    return [
      body("title").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "title is not valid!",
        clientMessage: "عنوان آدرس معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "district") {
    return [
      body("district").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "district is not valid!",
        clientMessage: "منطقه شهری آدرس معتبر نیست!",
      }),
      body("district")
        .optional()
        .isIn([
          "منطقه ۱۱",
          "منطقه ۱۰",
          "منطقه ۹",
          "منطقه ۸",
          "منطقه ۷",
          "منطقه ۶",
          "منطقه ۵",
          "منطقه ۴",
          "منطقه ۳",
          "منطقه ۲",
          "منطقه ۱",
          "منطقه ۲۲",
          "منطقه ۲۱",
          "منطقه ۲۰",
          "منطقه ۱۹",
          "منطقه ۱۸",
          "منطقه ۱۷",
          "منطقه ۱۶",
          "منطقه ۱۵",
          "منطقه ۱۴",
          "منطقه ۱۳",
          "منطقه ۱۲",
        ])
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "district is not valid!",
          clientMessage: "منطقه شهری آدرس معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "city") {
    return [
      body("city").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "City is required!",
        clientMessage: "نام شهر مورد نیاز است!",
      }),
      body("city").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "City is not valid!",
        clientMessage: "نام شهر معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "address") {
    return [
      body("address").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Address is required!",
        clientMessage: "آدرس مورد نیاز است!",
      }),
      body("address").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Address is not valid!",
        clientMessage: "آدرس معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "postalCode") {
    return [
      body("postalCode").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "PostalCode is required!",
        clientMessage: "کد پستی مورد نیاز است!",
      }),
      body("postalCode")
        .custom((v) => {
          return (
            v &&
            v.length === 10 &&
            (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en")))
          );
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "PostalCode is not valid!",
          clientMessage: "کد پستی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "phone") {
    return [
      body("phone").optional().isString().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "phone's is not valid!",
        clientMessage: "شماره تلفن معتبر نیست!",
      }),
      body("phone").optional().isLength({ min: 5, max: 11 }).withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "phone's is not valid!",
        clientMessage: "شماره تلفن معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "mobilePhone") {
    return [
      body("mobilePhone").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "MobilePhone's is not valid!",
        clientMessage: "شماره موبایل معتبر نیست!",
      }),
      body("mobilePhone")
        .custom((v) => {
          return (
            v.length === 11 &&
            (v[0] == "0" || v[0] == "۰") &&
            (v[1] == "9" || v[1] == "۹") &&
            (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en")))
          );
        })
        .isLength({ min: 10, max: 11 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "MobilePhone's is not valid!",
          clientMessage: "شماره موبایل معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "addressId") {
    return [
      body("addressId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "AddressId Code is required!",
        clientMessage: "شناسه آدرس مورد نیاز است!",
      }),
      body("addressId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "AddressId Code is not valid!",
        clientMessage: "شناسه آدرس معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "paymentMethod") {
    return [
      body("paymentMethod").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "PaymentMethod Code is required!",
        clientMessage: "نحوه پرداخت مورد نیاز است!",
      }),
      body("paymentMethod")
        .isIn(["Cash", "Online", "FireBox", "ChargeCapsule"])
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "PaymentMethod Code is not valid!",
          clientMessage: "نحوه پرداخت معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "offCodeId") {
    return [
      body("offCodeId").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "OffCodeId Code is required!",
        clientMessage: "نام کد مورد معتبر نیست!",
      }),
      body("offCodeId").optional().isLength({ min: 1 }).withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "OffCodeId Code is not valid!",
        clientMessage: "نام کد معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "filterQuantity") {
    return [
      body("filterQuantity")
        .optional()
        .custom((v) => {
          return (
            v.from &&
            v.to &&
            typeof Number(v.from) === "number" &&
            typeof Number(v.to) === "number" &&
            v.from < v.to
          );
        })
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "filterQuantity Code is required!",
          clientMessage: "فیلتر تعداد معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "filterCategory") {
    return [
      body("filterCategory").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "filterCategory Code is required!",
        clientMessage: "فیلتر دسته بندی معتبر نیست!",
      }),
      body("filterCategory").optional().isLength({ min: 1 }).withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "filterCategory Code is required!",
        clientMessage: "فیلتر دسته بندی معتبر نیست!",
      }),
    ];
  }
  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// admin  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "body" && input === "reviewIds") {
    return [
      body("reviewIds").isArray({ min: 1 }).withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ReviewId Code is not valid!",
        clientMessage: "شناسه نظر معتبر نیست!",
      }),
      body("reviewIds")
        .custom((r) => {
          r.every((i) => {
            return i.isMongoId();
          });
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ReviewId Code is not valid!",
          clientMessage: "شناسه نظر معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "qAndAs") {
    return [
      body("qAndAs").isArray({ min: 1 }).withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "QAndAs Code are not valid!",
        clientMessage: "شناسه های سوالات معتبر نیستند!",
      }),
      body("qAndAs")
        .custom((r) => {
          r.every((i) => {
            return i.isMongoId();
          });
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "QAndAs Code are not valid!",
          clientMessage: "شناسه های سوالات معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "englishName") {
    return [
      body("englishName").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "englishName is required!",
        clientMessage: "نام انگلیسی مورد نیاز است!",
      }),
      body("englishName").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "englishName is not valid!",
        clientMessage: "نام انگلیسی معتبر نیست!",
      }),
      body("englishName").isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "englishName is not valid!",
        clientMessage: "نام انگلیسی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productEnglishName") {
    return [
      body("productEnglishName").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productEnglishName is not valid!",
        clientMessage: "نام انگلیسی معتبر نیست!",
      }),
      body("productEnglishName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productEnglishName is not valid!",
        clientMessage: "نام انگلیسی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "tags") {
    return [
      body("tags").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Tags is required!",
        clientMessage: "تگ مورد نیاز است!",
      }),
      body("tags").isArray({ min: 1, max: 10 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Tags is not valid!",
        clientMessage: "تگ معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "tagsOp") {
    return [
      body("tagsOp").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "TagsOp is not valid!",
        clientMessage: "تگ معتبر نیست!",
      }),
      body("tagsOp").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "TagsOp is not valid!",
        clientMessage: "تگ معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productTags") {
    return [
      body("productTags").optional().isArray({ min: 1, max: 10 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productTags is not valid!",
        clientMessage: "تگ معتبر نیست!",
      }),
      body("productTags")
        .optional()
        .custom((v) => {
          return v.every((i) => {
            return typeof i === "string";
          });
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "productTags is not valid!",
          clientMessage: "تگ معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "brand") {
    return [
      body("brand").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "brand is required!",
        clientMessage: "نام برند مورد نیاز است!",
      }),
      body("brand").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "brand is not valid!",
        clientMessage: "نام برند معتبر نیست!",
      }),
      body("brand").isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "brand is not valid!",
        clientMessage: "نام برند معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productBrand") {
    return [
      body("productBrand").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productBrand is not valid!",
        clientMessage: "نام برند معتبر نیست!",
      }),
      body("productBrand").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productBrand is not valid!",
        clientMessage: "نام برند معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productCode") {
    return [
      body("productCode").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCode is required!",
        clientMessage: "کد محصول مورد نیاز است!",
      }),
      body("productCode").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCode is not valid!",
        clientMessage: "کد محصول معتبر نیست!",
      }),
      body("productCode").isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCode is not valid!",
        clientMessage: "کد محصول معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "subCategory") {
    return [
      body("subCategory").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "subCategory is required!",
        clientMessage: "زیر دسته بندی مورد نیاز است!",
      }),
      body("subCategory").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "subCategory is not valid!",
        clientMessage: "زیر دسته بندی معتبر نیست!",
      }),
      body("subCategory").isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "subCategory is not valid!",
        clientMessage: "زیر دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productProductCode") {
    return [
      body("productProductCode").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productProductCode is not valid!",
        clientMessage: "کد محصول معتبر نیست!",
      }),
      body("productProductCode").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productProductCode is not valid!",
        clientMessage: "کد محصول معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryCode") {
    return [
      body("categoryCode").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCode is required!",
        clientMessage: "کد دسته بندی مورد نیاز است!",
      }),
      body("categoryCode").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productCategoryCode") {
    return [
      body("productCategoryCode").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCategoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
      body("productCategoryCode").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCategoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryCategoryCode") {
    return [
      body("categoryCategoryCode").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCategoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
      body("categoryCategoryCode").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCategoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryId") {
    return [
      body("categoryId").optional().isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CategoryId is not valid!",
        clientMessage: "شناسه دسته بندی معتبر نیست!",
      }),
      body("categoryId").optional().isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CategoryId is not valid!",
        clientMessage: "شناسه دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "image") {
    return [
      body("image").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "image is required!",
        clientMessage: "آدرس عکس مورد نیاز است!",
      }),
      body("image").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "image is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("image").isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "image is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("image")
        .custom((v) => {
          return v.split(".").length === 2 && ObjectId.isValid(v.split(".")[0]);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "image is not valid!",
          clientMessage: "آدرس عکس معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "productImage") {
    return [
      body("productImage").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productImage is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("productImage").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productImage is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("productImage")
        .optional()
        .custom((v) => {
          return v.split(".").length === 2 && ObjectId.isValid(v.split(".")[0]);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "productImage is not valid!",
          clientMessage: "آدرس عکس معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "categoryImage") {
    return [
      body("categoryImage").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryImage is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("categoryImage").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryImage is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("categoryImage")
        .optional()
        .custom((v) => {
          return v.split(".").length === 2 && ObjectId.isValid(v.split(".")[0]);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "categoryImage is not valid!",
          clientMessage: "آدرس عکس معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "categoryDescription") {
    return [
      body("categoryDescription").optional().isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryDescription is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
      body("categoryDescription").optional().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryDescription is not valid!",
        clientMessage: "آدرس عکس معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "cardGallery") {
    return [
      body("cardGallery").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "cardGallery is required!",
        clientMessage: "آدرس گالری مورد نیاز است!",
      }),
      body("cardGallery").isArray({ min: 1, max: 3 }).withMessage({
        clientCode: 80,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "cardGallery is not valid!",
        clientMessage: "آدرس گالری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productCardGallery") {
    return [
      body("productCardGallery")
        .optional()
        .isArray({ min: 1, max: 3 })
        .withMessage({
          clientCode: 80,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "productCardGallery is not valid!",
          clientMessage: "آدرس گالری معتبر نیست!",
        }),
      body("productCardGallery")
        .optional()
        .custom((v) => {
          return every((i) => {
            return (
              i.split(".").length === 2 && ObjectId.isValid(i.split(".")[0])
            );
          });
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "productCardGallery is not valid!",
          clientMessage: "آدرس عکس معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "price") {
    return [
      body("price").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "price required!",
        clientMessage: "قیمت مورد نیاز است!",
      }),
      body("price").isInt({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "price are not valid!",
        clientMessage: "قیمت معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "newPrice") {
    return [
      body("newPrice").optional().isInt({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "newPrice are not valid!",
        clientMessage: "قیمت جدید معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productPrice") {
    return [
      body("productPrice").optional().isInt({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productPrice are not valid!",
        clientMessage: "قیمت معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productNewPrice") {
    return [
      body("productNewPrice").optional().isInt({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productNewPrice are not valid!",
        clientMessage: "قیمت جدید معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "description") {
    return [
      body("description")
        .optional()
        .isString()
        .isLength({ min: 1, max: 1000 })
        .withMessage({
          clientCode: 15,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Body are not valid!",
          clientMessage: "توضیح بیشتر معتبر نیست!",
        }),
      body("gallery").optional().isArray({ min: 1, max: 20 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Gallery are not valid!",
        clientMessage: "گالری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productDescription") {
    return [
      body("productDescription")
        .optional()
        .isString()
        .withMessage({
          clientCode: 15,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Body are not valid!",
          clientMessage: "توضیح بیشتر معتبر نیست!",
        })
        .isLength({ max: 1000 })
        .withMessage({
          clientCode: 15,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Body are not valid!",
          clientMessage: "توضیح بیشتر معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "productGallery") {
    return [
      body("productGallery").optional().isArray({ max: 20 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Gallery are not valid!",
        clientMessage: "گالری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "cardProperties") {
    return [
      body("cardProperties").optional().isArray({ max: 10 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CardProperties are not valid!",
        clientMessage: "ویژگی های کارت معتبر نیستند!",
      }),
      body("cardProperties")
        .optional()
        .custom((v) => {
          return v.every((i) => {
            return (
              i.key &&
              typeof i.key === "string" &&
              i.value &&
              typeof i.value === "string"
            );
          });
        })
        .withMessage({
          clientCode: 15,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "CardProperties are not valid!",
          clientMessage: "ویژگی های کارت معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "properties") {
    return [
      body("properties").optional().isArray({ max: 10 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Properties are not valid!",
        clientMessage: "ویژگی های کارت معتبر نیستند!",
      }),
      body("properties")
        .optional()
        .custom((v) => {
          return v.every((i) => {
            i.title &&
              i.content &&
              Array.isArray(i.content) &&
              i.content.length > 0;
            // return i.content.every((j) => { return j.key && typeof j.key === 'string' && j.value && typeof j.value === 'string' })
          });
        })
        .withMessage({
          clientCode: 15,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Properties are not valid!",
          clientMessage: "ویژگی های کارت معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "accessLevels") {
    return [
      body("accessLevels").optional().notEmpty().withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "AccessLevels are not valid!",
        clientMessage: "سطوح دسترسی معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "productCardProperties") {
    return [
      body("productCardProperties").optional().isArray({ min: 1 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCardProperties are not valid!",
        clientMessage: "ویژگی های کارت معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "productProperties") {
    return [
      body("productProperties").optional().isArray({ min: 1 }).withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productProperties are not valid!",
        clientMessage: "ویژگی های کارت معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "productAccessLevels") {
    return [
      body("productAccessLevels").optional().notEmpty().withMessage({
        clientCode: 15,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productAccessLevels are not valid!",
        clientMessage: "سطوح دسترسی معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "commercialhName") {
    return [
      body("commercialhName").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CommercialhName is required!",
        clientMessage: "نام تجاری مورد نیاز است!",
      }),
      body("commercialhName").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CommercialhName is not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "searchItems") {
    return [
      body("searchItems").optional().isArray({ min: 1, max: 7 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "searchItems is not valid!",
        clientMessage: "آیتم های جستجو معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "categorySearchItems") {
    return [
      body("categorySearchItems")
        .optional()
        .isArray({ min: 1, max: 7 })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "categorySearchItems is not valid!",
          clientMessage: "آیتم های جستجو معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "_id") {
    return [
      body("_id").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "_id is required!",
        clientMessage: "شناسه  مورد نیاز است!",
      }),
      body("_id").isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "_id is not valid!",
        clientMessage: "شناسه  معتبر نیست!",
      }),
      body("_id").isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "_id is not valid!",
        clientMessage: "شناسه  معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "managerName") {
    return [
      body("managerName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
      body("managerName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "managerLastName") {
    return [
      body("managerLastName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerLastName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
      body("managerLastName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerLastName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "managerEmail") {
    return [
      body("managerEmail").optional().isEmail().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerEmail is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "managerIsActive") {
    return [
      body("managerIsActive").optional().isBoolean().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "managerIsActive is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "managerRole") {
    return [
      body("managerRole")
        .optional()
        .isIn(["Supporter", "Manager", "Deliveryman"])
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "managerRole is not valid!",
          clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "supporterName") {
    return [
      body("supporterName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
      body("supporterName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "supporterLastName") {
    return [
      body("supporterLastName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterLastName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
      body("supporterLastName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterLastName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "supporterEmail") {
    return [
      body("supporterEmail").optional().isEmail().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterEmail is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "supporterIsActive") {
    return [
      body("supporterIsActive").optional().isBoolean().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "supporterIsActive is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "supporterRole") {
    return [
      body("supporterRole")
        .optional()
        .isIn(["Supporter", "Manager", "Deliveryman"])
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "supporterRole is not valid!",
          clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
        }),
    ];
  } else if (type === "body" && input === "deliverymanName") {
    return [
      body("deliverymanName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
      body("deliverymanName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanName is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "deliverymanLastName") {
    return [
      body("deliverymanLastName").optional().isString().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanLastName is not valid!",
        clientMessage: "نام خانوادگی معتبر نیست!",
      }),
      body("deliverymanLastName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanLastName is not valid!",
        clientMessage: "نام خانوادگی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "deliverymanEmail") {
    return [
      body("deliverymanEmail").optional().isEmail().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanEmail is not valid!",
        clientMessage: "نام کاربری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "deliverymanIsActive") {
    return [
      body("deliverymanIsActive").optional().isBoolean().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliverymanIsActive is not valid!",
        clientMessage: "مجوز فعالیت معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "deliverymanRole") {
    return [
      body("deliverymanRole")
        .optional()
        .isIn(["Supporter", "Manager", "Deliveryman"])
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "deliverymanRole is not valid!",
          clientMessage: "نقش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "userIsActive") {
    return [
      body("userIsActive").optional().isBoolean().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "userIsActive is not valid!",
        clientMessage: "نام معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "userUserType") {
    return [
      body("userUserType").optional().isIn([1, 2, 3, 4, 5]).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "userUserType is not valid!",
        clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "isActive") {
    return [
      body("isActive").exists().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "IsActive is not valid!",
        clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
      }),
      body("isActive").isBoolean().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "IsActive is not valid!",
        clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "role") {
    return [
      body("role").exists().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Role is not valid!",
        clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
      }),
      body("role").isIn(["Supporter", "Manager"]).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Role is not valid!",
        clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "quantity") {
    return [
      body("quantity").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Quantity is required!",
        clientMessage: "تعداد مورد نیاز است!",
      }),
      body("quantity").isInt({ min: 0 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Quantity are not valid!",
        clientMessage: "تعداد معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "regionNum") {
    return [
      body("regionNum").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "RegionNum is required!",
        clientMessage: "شماره منطقه مورد نیاز است!",
      }),
      body("regionNum").isInt({ min: 0, max: 22 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "RegionNum are not valid!",
        clientMessage: "شماره منطقه معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "shippingPrice") {
    return [
      body("shippingPrice").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ShippingPrice is required!",
        clientMessage: "قیمت ارسال مورد نیاز است!",
      }),
      body("shippingPrice").isInt({ min: 0 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ShippingPrice are not valid!",
        clientMessage: "قیمت ارسال معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "userId") {
    return [
      body("userId").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "UserId is required!",
        clientMessage: "شناسه  مورد نیاز است!",
      }),
    ];
  } else if (type === "body" && input === "id") {
    return [
      body("id").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      body("id").isUUID().withMessage({
        clientCode: 5,
        statusCode: 422,
        messageEnglish: "Verification Code is not valid!",
        clientMessage: "کد راستی آزمایی معتبر نیست!",
      }),
    ];
  }
  //what was this?
  //  else if (type === 'body' && input === 'c') {
  //   return [
  //     body('id').exists().withMessage({ clientCode: 4, statusCode: 422, messageEnglish: 'Verification Code is required!', clientMessage: 'کد راستی آزمایی مورد نیاز است!' }),
  //     body('id').isUUID().withMessage({ clientCode: 5, statusCode: 422, messageEnglish: 'Verification Code is not valid!', clientMessage: 'کد راستی آزمایی معتبر نیست!' })
  //   ]
  // }
  else if (type === "body" && input === "verificationCode") {
    return [
      body("verificationCode").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      body("verificationCode")
        .isString()
        .isLength({ min: 4, max: 4 })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          messageEnglish: "Verification Code is not valid!",
          clientMessage: "کد راستی آزمایی معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "answer") {
    return [
      body("answer").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      body("answer").isString().isLength({ min: 1, max: 200 }).withMessage({
        clientCode: 5,
        statusCode: 422,
        messageEnglish: "Verification Code is not valid!",
        clientMessage: "کد راستی آزمایی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "questionId") {
    return [
      body("questionId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      body("questionId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        messageEnglish: "Verification Code is not valid!",
        clientMessage: "کد راستی آزمایی معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "username") {
    return [
      body("username").exists().withMessage({
        clientCode: 11,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Username address is required!",
        clientMessage: "نام کاربری مورد نیاز است!",
      }),
      body("username")
        .custom((v) => {
          return isEmailValid(v) || isValidMobilePhone(v);
        })
        .withMessage({
          clientCode: 12,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Username address is not valid!",
          clientMessage: "نام کاربری معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "queries") {
    return [
      body("queries").exists().withMessage({
        clientCode: 38,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Queries are required!",
        clientMessage: "جستجوها مورد نیاز است!",
      }),
      body("queries").isArray({ min: 1 }).withMessage({
        clientCode: 38,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Queries are not valid!",
        clientMessage: "جستجوها معتبر نیستند!",
      }),
    ];
  } else if (type === "body" && input === "commercialName") {
    return [
      body("commercialName").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "commercialName required!",
        clientMessage: "نام تجاری مورد نیاز است!",
      }),
      body("commercialName").isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "commercialName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryName") {
    return [
      body("categoryName").optional().isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
      body("categoryName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "productName") {
    return [
      body("productName").optional().isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
      body("productName").optional().isLength({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "categoryCommercialName") {
    return [
      body("categoryCommercialName").optional().isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCommercialName are not valid!",
        clientMessage: "نام تجاری معتبر نیست!",
      }),
      body("categoryCommercialName")
        .optional()
        .isLength({ min: 1 })
        .withMessage({
          clientCode: 10,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "categoryCommercialName are not valid!",
          clientMessage: "نام تجاری معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "code") {
    return [
      body("code").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف مورد نیاز است!",
      }),
      body("code").isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
      body("code").isLength({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "type") {
    return [
      body("type").exists().withMessage({
        clientCode: 52,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Type is required!",
        clientMessage: "نوع مورد نیاز است!",
      }),
      body("type")
        .isIn([
          "ALL_ALL",
          "ALL_CATEGORY",
          "ALL_PRODUCT",
          "ONE_ALL",
          "ONE_CATEGORY",
          "ONE_PRODUCT",
        ])
        .withMessage({
          clientCode: 53,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Type is not valid!",
          clientMessage: "نوع معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "usernameOp") {
    return [
      body("usernameOp")
        .optional()
        .custom((v) => {
          return isEmailValid(v) || isValidMobilePhone(v);
        })
        .withMessage({
          clientCode: 12,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "UsernameOp is not valid!",
          clientMessage: "آدرس ایمیل معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "minPrice") {
    return [
      body("minPrice").optional().isInt({ min: 1 }).withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "minPrice is not valid!",
        clientMessage: "حداقل میزان خرید معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "maxOff") {
    return [
      body("maxOff").optional().isInt({ min: 1 }).withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "maxOff is not valid!",
        clientMessage: "حداکثر تخفیف روی یک آیتم معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "maxTotalOff") {
    return [
      body("maxTotalOff").optional().isInt({ min: 1 }).withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "maxTotalOff is not valid!",
        clientMessage: "حداکثر تخفیف در یک خرید معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "offPercent") {
    return [
      body("offPercent").exists().withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "offPercent is not valid!",
        clientMessage: "درصد تخفیف مورد نیاز است!",
      }),
      body("offPercent").isInt({ min: 1 }).withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "offPercent is not valid!",
        clientMessage: "درصد تخفیف معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "quantityOp") {
    return [
      body("quantityOp").optional().isInt({ min: 1 }).withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "quantity is not valid!",
        clientMessage: "تعداد مجاز استفاده از کد تخفیف معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "expiredDate") {
    return [
      body("expiredDate").exists().withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "expiredDate is not valid!",
        clientMessage: "تاریخ انقضا مورد نیاز است!",
      }),
      body("expiredDate")
        .custom((v) => {
          let date = new Date(v).getTime();
          console.log(
            "date is ",
            date,
            "and the diffrence is ",
            new Date().getTime() - date
          );
          return date > new Date().getTime();
        })
        .withMessage({
          clientCode: 12,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "expiredDate is not valid!",
          clientMessage: "تاریخ انقضا معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "codeOp") {
    return [
      body("codeOp").optional().isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
      body("codeOP").optional().isLength({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "date") {
    return [
      body("date")
        .optional()
        .custom((v) => {
          return (
            (v.from && v.from === v.from.getTime()) ||
            (v.to && v.to === v.from.getTime())
          );
        })
        .withMessage({
          clientCode: 12,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "Date is not valid!",
          clientMessage: "تاریخ انقضا معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "isValid") {
    return [
      body("isValid").optional().isBoolean().withMessage({
        clientCode: 12,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "isValid is not valid!",
        clientMessage: "پرچم نمایش تمام کدها معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "orderId") {
    return [
      body("orderId").exists().isFloat().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderId's fields are not present!",
        clientMessage: "شناسه ورودی سفارش موجود نیست!",
      }),
      body("orderId")
        .custom((v) => {
          return ["1", "2", "3", "4"].includes(v.toString().split(".")[1]);
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderOrderId's fields are not valid!",
          clientMessage: "شناسه ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "paymentMethodOp") {
    return [
      body("paymentMethodOp").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "PaymentMethod Code is not valid!",
        clientMessage: "نحوه پرداخت معتبر نیست!",
      }),
      body("paymentMethodOp").optional().isIn(["Cash", "Online"]).withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "PaymentMethod Code is not valid!",
        clientMessage: "نحوه پرداخت معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "deliveryStatusOp") {
    return [
      body("deliveryStatusOp").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliver status is not valid!",
        clientMessage: "وضعیت ارسال معتبر نیست",
      }),
      body("deliveryStatusOp")
        .optional()
        .isIn(["Sent", "Received", "Failed", "Unknown"])
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "deliver status is not valid!",
          clientMessage: "وضعیت ارسال معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "deliveryStatus") {
    return [
      body("deliveryStatus").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "deliver status is not valid!",
        clientMessage: "وضعیت ارسال معتبر نیست",
      }),
      body("deliveryStatus")
        .isIn(["Sent", "Received", "Failed", "Unknown"])
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "deliver status is not valid!",
          clientMessage: "وضعیت ارسال معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "usernameOp") {
    return [
      body("usernameOp").optional().isEmail().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "username is not valid!",
        clientMessage: "وضعیت یوزرنیم ارسالی معتبر نیست",
      }),
    ];
  } else if (type === "body" && input === "orderStatusOp") {
    return [
      body("orderStatusOp").optional().isString().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "order status is not valid!",
        clientMessage: "وضعیت سفارش معتبر نیست",
      }),
      body("orderStatusOp")
        .optional()
        .isIn([
          "Successful",
          "Failed",
          "Reverted",
          "Canceled",
          "Pending",
          "Edited",
        ])
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "order status is not valid!",
          clientMessage: "وضعیت سفارش معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "dateOp") {
    return [
      // body('dateOp').optional()
      // .custom((v) => {

      //   return Object.keys(v).length ===2})
      // .withMessage({ clientCode: 4, statusCode: 422, title: 'خطا رخ داد', messageEnglish: 'date object is not valid!', clientMessage: 'وضعیت تاریخ های ورودی معتبر نیست' }),
      body("dateOp")
        .optional()
        .custom((v) => {
          let from = new Date(v.from).getTime();
          let to = new Date(v.to).getTime();
          if (to > from) {
            return true;
          } else return false;
        })
        .withMessage({
          clientCode: 5,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "date object is not valid!",
          clientMessage: "وضعیت تاریخ های ورودی معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "priceOp") {
    return [
      body("priceOp")
        .optional()
        .custom((v) => {
          return Object.keys(v).every((i) => {
            return ["from", "to"].includes(i);
          });
        })
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "price object is not valid!",
          clientMessage: "وضعیت قیمت های ورودی معتبر نیست",
        }),
      body("priceOp")
        .optional()
        .custom((v) => {
          if (v["to"] > v["from"]) {
            return true;
          } else return false;
        })
        .withMessage({
          clientCode: 4,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "price object is not valid!",
          clientMessage: "وضعیت قیمت های ورودی معتبر نیست",
        }),
    ];
  } else if (type === "body" && input === "orderIdOp") {
    return [
      body("orderIdOp").optional().isFloat().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderId's fields are not valid!",
        clientMessage: "شناسه ورودی سفارش معتبر نیست!",
      }),

      body("orderIdOp")
        .optional()
        .custom((v) => {
          return (
            v.toString().indexOf(".1") > -1 || v.toString().indexOf(".2") > -1
          );
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderOrderId's fields are not valid!",
          clientMessage: "شناسه ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "isExcel") {
    return [
      body("isExcel").optional().isBoolean().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "excel flag is invalid!",
        clientMessage: "وضعیت خروجی اکسل صحیح نیست",
      }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// ticket  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "body" && input === "ticketSubject") {
    return [
      body("ticketSubject").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "subject is required!",
        clientMessage: "متن موضوع مورد نیاز است!",
      }),
      body("ticketSubject")
        .isString()
        .isLength({ min: 8, max: 1500 })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "subject is not valid!",
          clientMessage: "متن موضوع معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "ticketType") {
    return [
      body("ticketType").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticketType is required!",
        clientMessage: "نوع تیکت مورد نیاز است!",
      }),
      body("ticketType")
        .isString()
        .custom((k) => {
          return ["Task", "Issue"].includes(k);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticketType is not valid!",
          clientMessage: "نوع تیکت معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "ticketIssue") {
    return [
      body("ticketIssue").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticketIssue is required!",
        clientMessage: "متن مشکل مورد نیاز است!",
      }),
      body("ticketIssue")
        .isString()
        .isLength({ min: 8, max: 1500 })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticketIssue is not valid!",
          clientMessage: "متن مشکل معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "ticketId") {
    return [
      body("ticketId").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is required!",
        clientMessage: "کد تیکت مورد نیاز است!",
      }),
      body("ticketId").isMongoId().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is not valid!",
        clientMessage: "کد تیکت معتبر نیست!",
      }),
    ];
  } else if (type === "body" && input === "ticketIdArray") {
    return [
      body("ticketIdArray").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is required!",
        clientMessage: "کد تیکت مورد نیاز است!",
      }),
      body("ticketIdArray").isArray().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is required!",
        clientMessage: "کد تیکت مورد نیاز است!",
      }),

      body("ticketIdArray")
        .custom((r) => {
          return r.every((i) => {
            console.log("i is ", i);
            return ObjectId.isValid(i);
          });
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticket id is not valid!",
          clientMessage: "کد تیکت معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "ticketComment") {
    return [
      body("ticketComment").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticketComment is required!",
        clientMessage: "متن تیکت مورد نیاز است!",
      }),
      body("ticketComment")
        .isString()
        .isLength({ min: 8, max: 1500 })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticketComment is not valid!",
          clientMessage: "متن تیکت معتبر نیست!",
        }),
    ];
  } else if (type === "body" && input === "ticketPriority") {
    return [
      body("ticketPriority").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticketPriority is required!",
        clientMessage: "متن الویت مورد نیاز است!",
      }),
      body("ticketPriority")
        .isString()
        .custom((k) => {
          return ["Urgent", "Normal", "Critical"].includes(k);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticketPriority is not valid!",
          clientMessage: " الویت معتبر نیست!",
        }),
    ];
  }

  /// /////////////////////////////////////////
  /// //////// query /////////////////////////
  /// /////////////////////////////////////////

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// ticket  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "ticketId") {
    return [
      query("ticketId").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is required!",
        clientMessage: "کد تیکت مورد نیاز است!",
      }),
      query("ticketId").isMongoId().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket id is not valid!",
        clientMessage: "کد تیکت معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "ticketStatus") {
    return [
      query("ticketStatus").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ticket status is required!",
        clientMessage: "کد تیکت مورد نیاز است!",
      }),
      query("ticketStatus")
        .isString()
        .custom((k) => {
          return ["0", "1", "2", "3"].includes(k);
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "ticket status is not valid!",
          clientMessage: "وضعیت تیکت معتبر نیست!",
        }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// admin  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "categoryCode") {
    return [
      query("categoryCode").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCode is required!",
        clientMessage: "کد دسته بندی مورد نیاز است!",
      }),
      query("categoryCode").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "categoryCode is not valid!",
        clientMessage: "کد دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "productCode") {
    return [
      query("productCode").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCode is required!",
        clientMessage: "کد محصول مورد نیاز است!",
      }),
      query("productCode").isString().isLength({ min: 1 }).withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "productCode is not valid!",
        clientMessage: "کد محصول معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "code") {
    return [
      query("code").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف مورد نیاز است!",
      }),
      query("code").isString().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
      query("code").isLength({ min: 1 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Code are not valid!",
        clientMessage: "نام کد تخفیف معتبر نیست!",
      }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// service  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "productId") {
    return [
      query("productId").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is required!",
        clientMessage: "شناسه محصول مورد نیاز است!",
      }),
      query("productId").isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
      query("productId").isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "categoryId") {
    return [
      query("categoryId").optional().isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CategoryId is not valid!",
        clientMessage: "شناسه دسته بندی معتبر نیست!",
      }),
      query("categoryId").optional().isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "CategoryId is not valid!",
        clientMessage: "شناسه دسته بندی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "sortBy") {
    return [
      query("sortBy").optional().isIn(["1", "2", "3", "4", "5"]).withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "SortBy is not valid!",
        clientMessage: "شناسه مرتب سازی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "id") {
    return [
      query("id").exists().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Transaction Id is required!",
        clientMessage: "شناسه تراکنش مورد نیاز است!",
      }),
      query("id").isHexadecimal().withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Transaction Id is not valid!",
        clientMessage: "شناسه تراکنش معتبر نیست!",
      }),
      query("id").isString().isLength({ min: 128, max: 128 }).withMessage({
        clientCode: 10,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Transaction Id is not valid!",
        clientMessage: "شناسه تراکنش معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "username") {
    return [
      query("username").exists().withMessage({
        clientCode: 70,
        statusCode: 422,
        clientMessage: "Username is required!",
      }),
      query("username")
        .custom((v) => {
          return isEmailValid(v) || isValidMobilePhone(v);
        })
        .withMessage({
          clientCode: 71,
          statusCode: 422,
          clientMessage: "Username is not valid!",
        }),
    ];
  } else if (type === "query" && input === "string") {
    return [
      query("string").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      query("string").isUUID().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Verification Code is not valid!",
        clientMessage: "کد راستی آزمایی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "page") {
    return [
      query("page").exists().withMessage({
        clientCode: 33,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Page is required!",
        clientMessage: "عدد صفحه مورد نیاز است!",
      }),
      query("page").isInt().isLength({ min: 1, max: 2 }).withMessage({
        clientCode: 34,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Page is not valid!",
        clientMessage: "عدد صفحه معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "location") {
    return [
      query("location").exists().withMessage({
        clientCode: 35,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Location is required!",
        clientMessage: "مبدا درخواست نشانه لوکیشن را ندارد!",
      }),
      query("location")
        .isIn(["none", "home", "dashboard", "wallet", "offers", "all"])
        .withMessage({
          clientCode: 36,
          statusCode: 422,
          messageEnglish: "Location is not valid!",
          clientMessage: "نشانه لوکیشن معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "reviewId") {
    return [
      query("reviewId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ReviewId Code is required!",
        clientMessage: "شناسه نظر مورد نیاز است!",
      }),
      query("reviewId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ReviewId Code is not valid!",
        clientMessage: "شناسه نظر معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "addressId") {
    return [
      query("addressId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "AddressId Code is required!",
        clientMessage: "شناسه آدرس مورد نیاز است!",
      }),
      query("addressId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "AddressId Code is not valid!",
        clientMessage: "شناسه آدرس معتبر نیست!",
      }),
    ];
  }
  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// wallet  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "etheriumAccountAddress") {
    return [
      query("etheriumAccountAddress")
        .exists()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "etheriumAccountAddress is not exsist!",
          clientMessage: " آدرس اکانت اتریوم نباید خالی باشد!",
        })
        .isString()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "etheriumAccountAddress should be string",
          clientMessage: "آدرس اکانت اتریوم باید رشته باشد",
        })
        .isHexadecimal()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "etheriumAccountAddress should be hexadecimal",
          clientMessage: "آدرس اکانت اتریوم باید هگزادسیمال باشد",
        }),
    ];
  }

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// user  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "pageNumber") {
    return [
      query("pageNumber")
        .exists()
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "page is not exsist!",
          clientMessage: " شماره صفحه نباید خالی باشد!",
        })
        .isInt()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "page number should be number",
          clientMessage: "شماره صفحه بایذ عدد صحیح باشد",
        }),
    ];
  } else if (type === "query" && input === "interval") {
    return [
      query("interval")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "interval is required!",
          clientMessage: "  بازه مورد نیاز است!",
        })
        .isString()
        .custom((i) => {
          return ["h", "d", "w", "m", "y"].includes(i);
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: " interval is not valid!",
          clientMessage: " بازه معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "kind") {
    return [
      query("kind")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "kind is required!",
          clientMessage: "  نوع سفارش پذیرفته شده مورد نیاز است!",
        })
        .isString()
        .custom((k) => {
          return ["1", "2"].includes(k);
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: " kind is not valid!",
          clientMessage: " نوع سفارش پذیرفه شده معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "type") {
    return [
      query("type")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "type is required!",
          clientMessage: "نوع سفارش مورد نیاز است!",
        })
        .isString()
        .custom((k) => {
          return ["1", "2", "3"].includes(k);
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "type  is not valid!",
          clientMessage: " نوع سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "status") {
    return [
      query("status")
        .exists()
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "status is required!",
          clientMessage: " حالت مورد نیز است.!",
        })
        .isString()
        .custom((s) => {
          return ["buy", "sell"].includes(s);
        })
        .withMessage({
          clientCode: 27,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: " status is not valid!",
          clientMessage: " حالت  معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "RialId") {
    return [
      query("RialId").optional().isMongoId().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "rial id is not valid!",
        clientMessage: "شناسه ریال معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "pid") {
    return [
      query("pid").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "pid is required!",
        clientMessage: "کد پیگیری سفارش مورد نیاز است!",
      }),
      query("pid").isNumeric().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "pid is not valid!",
        clientMessage: "کد پیگیری سفارش معتبر نیست!",
      }),
      query("pid")
        .custom((v) => {
          return v.length === 11;
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "pid is not valid!",
          clientMessage: "کد پیگیری سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "Status") {
    return [
      query("Status").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Status is required!",
        clientMessage: "کد وضعیت  مورد نیاز است!",
      }),
      query("Status").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Status is not valid!",
        clientMessage: "کد وضعیت معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "Amount") {
    return [
      query("Amount").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Amount is required!",
        clientMessage: "مقدار خرید مورد نیاز است!",
      }),
      query("Amount").isNumeric().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Amount is not valid!",
        clientMessage: "مقدار خرید معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "Authority") {
    return [
      query("Authority").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Authority is required!",
        clientMessage: "شناسه مخصوص زرین پال مورد نیاز است!",
      }),
      query("Authority").isNumeric().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Authority is not valid!",
        clientMessage: "شناسه مخصوص زرین پال معتبر نیست!",
      }),
      query("Authority")
        .custom((v) => {
          return v.length === 36;
        })
        .withMessage({
          clientCode: 79,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "authority is not valid!",
          clientMessage: "شناسه مخصوص زرین پال معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "questionId") {
    return [
      query("questionId").exists().withMessage({
        clientCode: 4,
        statusCode: 422,
        messageEnglish: "Verification Code is required!",
        clientMessage: "کد راستی آزمایی مورد نیاز است!",
      }),
      query("questionId").isMongoId().withMessage({
        clientCode: 5,
        statusCode: 422,
        messageEnglish: "Verification Code is not valid!",
        clientMessage: "کد راستی آزمایی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "orderMongoId") {
    return [
      query("orderMongoId").exists().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "order id fields are not valid!",
        clientMessage: " شناسه سفارش ورودی موجود نیست !",
      }),
      query("orderMongoId").isMongoId().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "order id fields are not valid!",
        clientMessage: "شناسه  سفارش ورودی معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "orderId") {
    return [
      query("orderId").exists().isFloat().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderId's fields are not present!",
        clientMessage: "شناسه ورودی سفارش موجود نیست!",
      }),
      query("orderId")
        .custom((v) => {
          return ["1", "2", "3", "4"].includes(v.toString().split(".")[1]);
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderOrderId's fields are not valid!",
          clientMessage: "شناسه ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "orderIdOp") {
    return [
      query("orderIdOp").optional().isFloat().withMessage({
        clientCode: 77,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "orderOrderId's fields are not present!",
        clientMessage: "شناسه ورودی سفارش موجود نیست!",
      }),
      query("orderIdOp")
        .optional()
        .custom((v) => {
          return ["1", "2", "3", "4"].includes(v.toString().split(".")[1]);
        })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "orderOrderId's fields are not valid!",
          clientMessage: "شناسه ورودی سفارش معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "productId") {
    return [
      query("productId").exists().withMessage({
        clientCode: 27,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is required!",
        clientMessage: "شناسه محصول مورد نیاز است!",
      }),
      query("productId").isHexadecimal().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
      query("productId").isMongoId().withMessage({
        clientCode: 28,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ProductId is not valid!",
        clientMessage: "شناسه محصول معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "phoneNumber") {
    return [
      query("phoneNumber").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "phoneNumber's is not valid!",
        clientMessage: "شماره موبایل معتبر نیست!",
      }),
      query("phoneNumber")
        .custom((v) => {
          return (
            v.length === 11 &&
            (v[0] == "0" || v[0] == "۰") &&
            (v[1] == "9" || v[1] == "۹") &&
            (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en")))
          );
        })
        .isLength({ min: 10, max: 11 })
        .withMessage({
          clientCode: 78,
          statusCode: 422,
          title: "خطا رخ داد",
          messageEnglish: "phoneNumber's is not valid!",
          clientMessage: "شماره موبایل معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "tags") {
    return [
      query("tags").exists().withMessage({
        clientCode: 78,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Tags is required!",
        clientMessage: "تگ مورد نیاز است!",
      }),
      query("tags").isString().withMessage({
        clientCode: 79,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "Tags is not valid!",
        clientMessage: "تگ معتبر نیست!",
      }),
    ];
  }
  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// admin  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "query" && input === "searchType") {
    return [
      query("searchType").exists().withMessage({
        clientCode: 35,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "searchType is required!",
        clientMessage: "شناسه جستجو مورد نیاز است!",
      }),
      query("searchType").isIn(["users", "orders", "products"]).withMessage({
        clientCode: 36,
        statusCode: 422,
        messageEnglish: "searchType is not valid!",
        clientMessage: "شناسه جستجو معتبر نیست!",
      }),
    ];
  } else if (type === "query" && input === "fromDate") {
    return [
      query("fromDate")
        .optional()
        .custom((v) => {
          let date = new Date(v).getTime();
          return date < new Date().getTime();
        })
        .withMessage({
          clientCode: 36,
          statusCode: 422,
          messageEnglish: "fromDate is not valid!",
          clientMessage: "شناسه جستجو معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "toDate") {
    return [
      query("toDate")
        .optional()
        .custom((v) => {
          let date = new Date(v).getTime();
          return !isNaN(date);
        })
        .withMessage({
          clientCode: 36,
          statusCode: 422,
          messageEnglish: "toDate is not valid!",
          clientMessage: "شناسه جستجو معتبر نیست!",
        }),
    ];
  } else if (type === "query" && input === "codeId") {
    return [
      query("codeId").exists().withMessage({
        clientCode: 36,
        statusCode: 422,
        messageEnglish: "toDate is not valid!",
        clientMessage: "شناسه کد موجود نیست!",
      }),
      query("codeId").isMongoId().withMessage({
        clientCode: 36,
        statusCode: 422,
        messageEnglish: "toDate is not valid!",
        clientMessage: "شناسه کد معتبر نیست!",
      }),
    ];
  }

  /// /////////////////////////////////////////
  /// //////// param /////////////////////////
  /// /////////////////////////////////////////
  else if (type === "param" && input === "imageName") {
    return [
      param("imageName").exists().withMessage({
        clientCode: 41,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "ImageName is required!",
        clientMessage: "آدرس عکس مورد نیاز است!",
      }),
    ];
  }
  /// /////////////////////////////////////////
  /// //////// cookie  //////////////////////////
  /// /////////////////////////////////////////

  /// /////////////////////////////////////////////////////////////////////////////////
  /// //////// service  ///////////////////////////////////////////////////////////////
  /// /////////////////////////////////////////////////////////////////////////////////
  else if (type === "cookie" && input === "sessionId") {
    return [
      cookie("sessionId").exists().withMessage({
        clientCode: 41,
        statusCode: 422,
        title: "خطا رخ داد",
        messageEnglish: "sessionId is required!",
        clientMessage: "مشکلی پیش آمده است!",
      }),
    ];
  }
};

export const validate = (req, res, next) => {
  const Result = validationResult(req);
  if (!Result["errors"] || Result["errors"].length === 0) {
    next();
  } else {
    console.log(Result["errors"]);
    const error = new myError(
      Result["errors"][0].msg.messageEnglish,
      Result["errors"][0].msg.statusCode,
      Result["errors"][0].msg.clientCode,
      Result["errors"][0].msg.clientMessage,
      Result["errors"][0].msg.title
    );
    next(error);
  }
};
