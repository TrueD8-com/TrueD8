"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.userValidationRules = exports.isValidMobilePhone = void 0;
exports.isEmailValid = isEmailValid;
exports.numbersFormatter = numbersFormatter;
var express_validator_1 = require("express-validator");
var myError_1 = __importDefault(require("../api/myError"));
//@ts-ignore
var lodash_es_1 = require("lodash-es");
function isEmailValid(mail) {
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(mail);
}
var isValidMobilePhone = function (phone) {
    return (phone.length === 11 &&
        (phone[0] === "0" || phone[0] === "۰") &&
        (phone[1] === "9" || phone[1] === "۹") &&
        (/^\d+$/.test(phone) || /^\d+$/.test(numbersFormatter(phone, "en"))));
};
exports.isValidMobilePhone = isValidMobilePhone;
var isValidDate = function (d) {
    return d instanceof Date && !isNaN(d.getTime());
};
// A helper for converting non-persian numbers to persian ones.
var arabicNumbers = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٠"], persianNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"], englishNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
function searchAndReplaceInNumbers(value, source, target) {
    for (var i = 0, len = target.length; i < len; i++) {
        value = value.replace(new RegExp(source[i], "g"), target[i]);
    }
    return value;
}
function numbersFormatter(value, to) {
    if (to === void 0) { to = "fa"; }
    value = typeof value === "number" ? String(value) : value;
    if (!value)
        return value;
    var output = value;
    if (to === "fa") {
        output = searchAndReplaceInNumbers(output, englishNumbers, persianNumbers);
        output = searchAndReplaceInNumbers(output, arabicNumbers, persianNumbers);
    }
    else if (to === "en") {
        output = searchAndReplaceInNumbers(output, persianNumbers, englishNumbers);
        output = searchAndReplaceInNumbers(output, arabicNumbers, englishNumbers);
    }
    return output;
}
var mongo = __importStar(require("mongodb"));
var ObjectId = mongo.ObjectId;
var userValidationRules = function (type, input) {
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
            (0, express_validator_1.body)("curGivenId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curGivenId is required!",
                clientMessage: "شناسه ارز پیشنهادی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("curGivenId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curGivenId is not valid!",
                clientMessage: "شناسه ارز پیشنهادی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curGivenIdOp") {
        return [
            (0, express_validator_1.body)("curGivenIdOp").optional().isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curGivenIdOp is not valid!",
                clientMessage: "شناسه ارز پیشنهادی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curGivenVal") {
        return [
            (0, express_validator_1.body)("curGivenVal").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curGivenVal is required!",
                clientMessage: "مقدار ارز پیشنهادی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("curGivenVal").isNumeric().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curGivenVal is not valid!",
                clientMessage: "مقدار ارز پیشنهادی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curGivenValOp") {
        return [
            (0, express_validator_1.body)("curGivenValOp")
                .optional()
                .custom(function (v) {
                if (!v.from && !v.to) {
                    return false;
                }
                else if (v.from && Number(v.from <= 0)) {
                    return false;
                }
                else if (v.to && Number(v.to <= 0)) {
                    return false;
                }
                else {
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
    }
    else if (type === "body" && input === "curTakenId") {
        return [
            (0, express_validator_1.body)("curTakenId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curTakenId is required!",
                clientMessage: "شناسه ارز درخواستی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("curTakenId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curTakenId is not valid!",
                clientMessage: "شناسه ارز درخواستی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curTakenIdOp") {
        return [
            (0, express_validator_1.body)("curTakenIdOp").optional().isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curTakenIdOp is not valid!",
                clientMessage: "شناسه ارز درخواستی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curTakenVal") {
        return [
            (0, express_validator_1.body)("curTakenVal").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curTakenVal is required!",
                clientMessage: "مقدار ارز درخواستی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("curTakenVal").isNumeric().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "curTakenVal is not valid!",
                clientMessage: "مقدار ارز درخواستی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "curTakenValOp") {
        return [
            (0, express_validator_1.body)("curTakenValOp")
                .optional()
                .custom(function (v) {
                if (!v.from && !v.to) {
                    return false;
                }
                else if (v.from && Number(v.from <= 0)) {
                    return false;
                }
                else if (v.to && Number(v.to <= 0)) {
                    return false;
                }
                else {
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
    }
    else if (type === "body" && input === "expDate") {
        return [
            (0, express_validator_1.body)("expDate").exists().withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "expDate is not valid!",
                clientMessage: "تاریخ انقضا مورد نیاز است!",
            }),
            (0, express_validator_1.body)("expDate")
                .custom(function (v) {
                var date = new Date(v).getTime();
                console.log("date is ", date, "and the diffrence is ", new Date().getTime() - date);
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
    }
    else if (type === "body" && input === "expDateOp") {
        return [
            (0, express_validator_1.body)("expDateOp")
                .optional()
                .custom(function (v) {
                if (!v.from && !v.to) {
                    return false;
                }
                else if (v.from && isValidDate(v.from)) {
                    return false;
                }
                else if (v.to && isValidDate(v.to)) {
                    return false;
                }
                else if (v.from > v.to) {
                    return false;
                }
                else {
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
    }
    else if (type === "body" && input === "created_atOp") {
        return [
            (0, express_validator_1.body)("created_atOp")
                .optional()
                .custom(function (v) {
                if (!v.from && !v.to) {
                    return false;
                }
                else if (v.from && isValidDate(v.from)) {
                    return false;
                }
                else if (v.to && isValidDate(v.to)) {
                    return false;
                }
                else if (v.from > v.to) {
                    return false;
                }
                else {
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
    }
    else if (type === "body" && input === "currency") {
        return [
            (0, express_validator_1.body)("currency").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "currency is required!",
                clientMessage: "ارز مورد نیاز است!",
            }),
            (0, express_validator_1.body)("currency").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "currency is not valid!",
                clientMessage: "ارز معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "currencyId") {
        return [
            (0, express_validator_1.body)("currencyId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "currency is required!",
                clientMessage: "ارز مورد نیاز است!",
            }),
            (0, express_validator_1.body)("currencyId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "currency is not valid!",
                clientMessage: "ارز معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "quantity") {
        return [
            (0, express_validator_1.body)("quantity").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "quantity is required!",
                clientMessage: "تعداد درخواستی ارز مورد نیاز است!",
            }),
            (0, express_validator_1.body)("quantity").isNumeric().withMessage({
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
            (0, express_validator_1.body)("offerIdOp").optional().isUUID().withMessage({
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
            (0, express_validator_1.query)("offerId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "offerId is required!",
                clientMessage: "شناسه پیشنهاد مورد نیاز است!",
            }),
            (0, express_validator_1.query)("offerId").isUUID().withMessage({
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
            (0, express_validator_1.query)("currencyId")
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
    }
    else if (type === "body" && input === "name") {
        return [
            (0, express_validator_1.body)("name")
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
    }
    else if (type === "body" && input === "currencyName") {
        return [
            (0, express_validator_1.body)("currencyName")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "name cn not be empty",
                clientMessage: "نام نمی تواند خالی باشد",
            })
                .isString()
                .custom(function (curName) {
                return (curName === "BITCOIN" ||
                    curName === "RIAL" ||
                    curName === "TRON" ||
                    curName === "ETHEREUM");
            })
                .withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "currency name info  is not valid!",
                clientMessage: " نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "persianName") {
        return [
            (0, express_validator_1.body)("persianName")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "name cn not be empty",
                clientMessage: "نام فارسی نمی تواند خالی باشد",
            })
                .isString()
                .custom(function (perName) {
                return (perName === "اتریوم" ||
                    perName === "ترون" ||
                    perName === "بیت کوین" ||
                    perName === "ریال");
            })
                .withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "persian name is not valid !",
                clientMessage: " نام فارسی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "abName") {
        return [
            (0, express_validator_1.body)("abName")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "short name can not be empty",
                clientMessage: "مخفف نمی تواند خالی باشد",
            })
                .isString()
                .custom(function (shortName) {
                return (shortName === "ETH" ||
                    shortName === "BTC" ||
                    shortName === "TRX" ||
                    shortName === "IRR");
            })
                .withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "short name is not valid!",
                clientMessage: " مخفف  معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "currencyId") {
        return [
            (0, express_validator_1.body)("currencyId")
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
    }
    else if (type === "body" && input === "currencyValue") {
        return [
            (0, express_validator_1.body)("currencyValue")
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
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "receiverUserId") {
        return [
            (0, express_validator_1.body)("receiverUserId")
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
    }
    else if (type === "body" && input === "receiverUsername") {
        return [
            (0, express_validator_1.body)("receiverUsername")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: " receiver Username can not be empty",
                clientMessage: " شناسه گیرنده نمی تواند خالی باشد ",
            })
                .custom(function (v) {
                return isEmailValid(v) || (0, exports.isValidMobilePhone)(v);
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
            (0, express_validator_1.query)("uuid").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "uuid is required!",
                clientMessage: "شناسه منحصربفرد پیشنهاد مورد نیاز است!",
            }),
            (0, express_validator_1.query)("uuid").isUUID().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "uuid is not valid!",
                clientMessage: "شناسه منحصربفرد پیشنهاد معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "title") {
        return [
            (0, express_validator_1.body)("title").optional().isString().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "title is not valid!",
                clientMessage: "تیتر معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "body") {
        return [
            (0, express_validator_1.body)("body").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "body is not present!",
                clientMessage: "بدنه نظر موجود نیست!",
            }),
            (0, express_validator_1.body)("body").isString().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "body is not valid!",
                clientMessage: "بدنه معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "rate") {
        return [
            (0, express_validator_1.body)("rate").optional().isNumeric().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "rate is not valid!",
                clientMessage: "امتیاز معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "titleOp") {
        return [
            (0, express_validator_1.body)("titleOp").optional().isString().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "title is not valid!",
                clientMessage: "تیتر معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "bodyOp") {
        return [
            (0, express_validator_1.body)("bodyOp").optional().isString().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "body is not valid!",
                clientMessage: "بدنه نظر معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "rateOp") {
        return [
            (0, express_validator_1.body)("rateOp").optional().isNumeric().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "rate is not valid!",
                clientMessage: "امتیاز معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "reviewId") {
        return [
            (0, express_validator_1.body)("reviewId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ReviewId Code is required!",
                clientMessage: "شناسه نظر مورد نیاز است!",
            }),
            (0, express_validator_1.body)("reviewId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ReviewId Code is not valid!",
                clientMessage: "شناسه نظر معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "question") {
        return [
            (0, express_validator_1.body)("question").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "question is required!",
                clientMessage: "سوال مورد نیاز است!",
            }),
            (0, express_validator_1.body)("question").isString().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "question is not valid!",
                clientMessage: "سوال صحیح معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "profileName") {
        return [
            (0, express_validator_1.body)("profileName").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "profileName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "profileLastName") {
        return [
            (0, express_validator_1.body)("profileLastName").optional().exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "profileLastName is required!",
                clientMessage: "نام خانوادگی معتبر نیست!",
            }),
            //  body('question').isString().withMessage({ clientCode: 5, statusCode: 422, title: 'خطا رخ داد', messageEnglish: 'question is not valid!', clientMessage: 'سوال صحیح معتبر نیست!' })
        ];
    }
    else if (type === "body" && input === "profileBirthdate") {
        console.log((0, express_validator_1.body)("profileBirthdate"));
        return [
            (0, express_validator_1.body)("profileBirthdate")
                .optional()
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "profilePhoneNumber") {
        return [
            (0, express_validator_1.body)("profilePhoneNumber").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "profilePhoneNumber is required!",
                clientMessage: "شماره تلفن مورد نیاز است!",
            }),
        ];
    }
    else if (type === "body" && input === "question") {
        return [
            (0, express_validator_1.body)("question").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "question is required!",
                clientMessage: "سوال مورد نیاز است!",
            }),
            (0, express_validator_1.body)("question").isString().withMessage({
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
            (0, express_validator_1.body)("productId").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is required!",
                clientMessage: "شناسه محصول مورد نیاز است!",
            }),
            (0, express_validator_1.body)("productId").isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
            (0, express_validator_1.body)("productId").isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "quantity") {
        return [
            (0, express_validator_1.body)("quantity").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Quantity is required!",
                clientMessage: "تعداد محصول مورد نیاز است!",
            }),
            (0, express_validator_1.body)("quantity").isInt({ min: 1 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Quantity is not valid!",
                clientMessage: "تعداد محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "isExisted") {
        return [
            (0, express_validator_1.body)("isExisted").optional().isBoolean().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "isExisted is not valid!",
                clientMessage: "شناسه وجود معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "rate") {
        return [
            (0, express_validator_1.body)("rate").optional().isInt({ min: 1, max: 5 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Rate is not valid!",
                clientMessage: "شناسه امتیازدهی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productRate") {
        return [
            (0, express_validator_1.body)("productRate").optional().isInt({ min: 1, max: 5 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productRate is not valid!",
                clientMessage: "شناسه امتیازدهی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "brands") {
        return [
            (0, express_validator_1.body)("brands").optional().isArray({ min: 1 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "brands is not valid!",
                clientMessage: "شناسه برند معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryBrands") {
        return [
            (0, express_validator_1.body)("categoryBrands").optional().isArray({ min: 1 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryBrands is not valid!",
                clientMessage: "شناسه برند معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "priceObject") {
        return [
            (0, express_validator_1.body)("priceObject")
                .optional()
                .custom(function (value) {
                return value.from >= 0 && value.to;
            })
                .withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "priceObject are not valid!",
                clientMessage: "مقادیر معتبر نیستند!",
            }),
            (0, express_validator_1.body)("priceObject")
                .optional()
                .custom(function (value) {
                return value.from < value.to;
            })
                .withMessage({
                clientCode: 128,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "priceObject are not valid!",
                clientMessage: "مقادیر معتبر نیستند!",
            }),
            (0, express_validator_1.body)("priceObject.from").optional().isInt({ min: 0 }).withMessage({
                clientCode: 101,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "priceObject are not valid!",
                clientMessage: "مقادیر معتبر نیستند!",
            }),
            (0, express_validator_1.body)("priceObject.to").optional().isInt({ min: 0 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "priceObject are not valid!",
                clientMessage: "مقادیر معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "offPercentOp") {
        return [
            (0, express_validator_1.body)("offPercentOp").optional().isInt({ min: 1 }).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "OffPercent is not valid!",
                clientMessage: "شناسه تخفیف معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "offPercent") {
        return [
            (0, express_validator_1.body)("offPercent").exists().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "OffPercent is not present!",
                clientMessage: "شناسه تخفیف لازم است!",
            }),
            (0, express_validator_1.body)("offPercent").isInt({ min: 1 }).withMessage({
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
            (0, express_validator_1.body)("email").exists().withMessage({
                clientCode: 7,
                statusCode: 422,
                messageEnglish: "Email and Password are required!",
                clientMessage: "ایمیل و گذرواژه مورد نیاز است!",
            }),
            (0, express_validator_1.body)("email").isEmail().withMessage({
                clientCode: 8,
                statusCode: 422,
                messageEnglish: "Email or Password are not valid!",
                clientMessage: "ایمیل یا گذرواژه معتبر نیست",
            }),
        ];
    }
    else if (type === "body" && input === "password") {
        return [
            (0, express_validator_1.body)("password").exists().withMessage({
                clientCode: 7,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Email and Password are required!",
                clientMessage: "ایمیل و گذرواژه مورد نیاز است!",
            }),
            (0, express_validator_1.body)("password").isString().isLength({ min: 6 }).withMessage({
                clientCode: 8,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Email or Password are not valid!",
                clientMessage: "ایمیل یا گذرواژه معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "newPassword") {
        return [
            (0, express_validator_1.body)("newPassword").exists().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Passwords are required!",
                clientMessage: "گذرواژه ها مورد نیاز است!",
            }),
            (0, express_validator_1.body)("newPassword").isString().isLength({ min: 6 }).withMessage({
                clientCode: 80,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "New password is not strong!",
                clientMessage: "گذرواژه به اندازه کافی قوی انتخاب نشده است!",
            }),
        ];
    }
    else if (type === "body" && input === "passwordConfirm") {
        return [
            (0, express_validator_1.body)("passwordConfirm").exists().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Passwords are required!",
                clientMessage: "گذرواژه ها مورد نیاز است!",
            }),
            (0, express_validator_1.body)("passwordConfirm").isString().isLength({ min: 6 }).withMessage({
                clientCode: 80,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "New password is not strong!",
                clientMessage: "گذرواژه به اندازه کافی قوی انتخاب نشده است!",
            }),
        ];
    }
    else if (type === "body" && input === "name") {
        return [
            (0, express_validator_1.body)("name").exists().withMessage({
                clientCode: 76,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Name is required!",
                clientMessage: "نام مورد نیاز است!",
            }),
            (0, express_validator_1.body)("name").isString().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Name is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "lastName") {
        return [
            (0, express_validator_1.body)("lastName").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "LastName is required!",
                clientMessage: "نام خانوادگی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("lastName").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "LastName is not valid!",
                clientMessage: "نام خانوادگی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "phoneNumber") {
        return [
            (0, express_validator_1.body)("phoneNumber")
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
            (0, express_validator_1.body)("orderOrderStatus").optional().equals("Canceled").withMessage({
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
    }
    else if (type === "body" && input === "orderAddress") {
        return [
            (0, express_validator_1.body)("orderAddress")
                .optional()
                .custom(function (v) {
                return (v.phone ||
                    v.mobilePhone ||
                    v.city ||
                    v.address ||
                    v.province ||
                    v.postalCode);
            })
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderAddress's fields are not valid!",
                clientMessage: " آدرس ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderAddress")
                .optional()
                .custom(function (v) {
                return Object.keys(v).every(function (i) {
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
            (0, express_validator_1.body)("orderAddress.phone")
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
            (0, express_validator_1.body)("orderAddress.mobilePhone")
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
            (0, express_validator_1.body)("orderAddress.city")
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
            (0, express_validator_1.body)("orderAddress.address")
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
            (0, express_validator_1.body)("orderAddress.province")
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
            (0, express_validator_1.body)("orderAddress.postalCode")
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
    }
    else if (type === "body" && input === "orderDelivery") {
        return [
            (0, express_validator_1.body)("orderDelivery")
                .optional()
                .custom(function (v) {
                return v.status || v.date || v.code;
            })
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderDelivery's fields are not valid!",
                clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderDelivery")
                .optional()
                .custom(function (v) {
                return Object.keys(v).every(function (i) {
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
            (0, express_validator_1.body)("orderDelivery.status")
                .optional()
                .isIn(["Sent", "Received", "Failed", "Unknown"])
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderDelivery's fields are not valid!",
                clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderDelivery.code")
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
            (0, express_validator_1.body)("orderDelivery.price").optional().isInt({ min: 0 }).withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderDelivery's fields are not valid!",
                clientMessage: "وضعیت ارسال ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderDelivery.date")
                .optional()
                .custom(function (v) {
                var date = new Date(v).getTime();
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
    }
    else if (type === "body" && input === "orderOrderId") {
        return [
            (0, express_validator_1.body)("orderOrderId").exists().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not valid!",
                clientMessage: "شناسه ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderOrderId")
                .custom(function (v) {
                return (v.toString().indexOf(".1") > -1 || v.toString().indexOf(".2") > -1);
            })
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not valid!",
                clientMessage: "شناسه ورودی سفارش معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "orderItems") {
        return [
            (0, express_validator_1.body)("orderItems")
                .optional()
                .custom(function (v) {
                var existanceArray = [];
                return v.every(function (f) {
                    if (existanceArray.includes(f.product.toString())) {
                        return false;
                    }
                    existanceArray.push(f.product.toString());
                    return Object.keys(f).every(function (i) {
                        if (i == "product") {
                            return ObjectId.isValid(f.product);
                        }
                        else if (i == "quantity") {
                            return (Number.isInteger(Number(f.quantity)) &&
                                Number(f.quantity) >= 0);
                        }
                        else {
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
    }
    else if (type === "body" && input === "province") {
        return [
            (0, express_validator_1.body)("province").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Province is required!",
                clientMessage: "نام استان مورد نیاز است!",
            }),
            (0, express_validator_1.body)("province").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Province is not valid!",
                clientMessage: "نام استان معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "title") {
        return [
            (0, express_validator_1.body)("title").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "title is not valid!",
                clientMessage: "عنوان آدرس معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "district") {
        return [
            (0, express_validator_1.body)("district").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "district is not valid!",
                clientMessage: "منطقه شهری آدرس معتبر نیست!",
            }),
            (0, express_validator_1.body)("district")
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
    }
    else if (type === "body" && input === "city") {
        return [
            (0, express_validator_1.body)("city").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "City is required!",
                clientMessage: "نام شهر مورد نیاز است!",
            }),
            (0, express_validator_1.body)("city").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "City is not valid!",
                clientMessage: "نام شهر معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "address") {
        return [
            (0, express_validator_1.body)("address").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Address is required!",
                clientMessage: "آدرس مورد نیاز است!",
            }),
            (0, express_validator_1.body)("address").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Address is not valid!",
                clientMessage: "آدرس معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "postalCode") {
        return [
            (0, express_validator_1.body)("postalCode").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PostalCode is required!",
                clientMessage: "کد پستی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("postalCode")
                .custom(function (v) {
                return (v &&
                    v.length === 10 &&
                    (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en"))));
            })
                .withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PostalCode is not valid!",
                clientMessage: "کد پستی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "phone") {
        return [
            (0, express_validator_1.body)("phone").optional().isString().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "phone's is not valid!",
                clientMessage: "شماره تلفن معتبر نیست!",
            }),
            (0, express_validator_1.body)("phone").optional().isLength({ min: 5, max: 11 }).withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "phone's is not valid!",
                clientMessage: "شماره تلفن معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "mobilePhone") {
        return [
            (0, express_validator_1.body)("mobilePhone").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "MobilePhone's is not valid!",
                clientMessage: "شماره موبایل معتبر نیست!",
            }),
            (0, express_validator_1.body)("mobilePhone")
                .custom(function (v) {
                return (v.length === 11 &&
                    (v[0] == "0" || v[0] == "۰") &&
                    (v[1] == "9" || v[1] == "۹") &&
                    (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en"))));
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
    }
    else if (type === "body" && input === "addressId") {
        return [
            (0, express_validator_1.body)("addressId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "AddressId Code is required!",
                clientMessage: "شناسه آدرس مورد نیاز است!",
            }),
            (0, express_validator_1.body)("addressId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "AddressId Code is not valid!",
                clientMessage: "شناسه آدرس معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "paymentMethod") {
        return [
            (0, express_validator_1.body)("paymentMethod").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PaymentMethod Code is required!",
                clientMessage: "نحوه پرداخت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("paymentMethod")
                .isIn(["Cash", "Online", "FireBox", "ChargeCapsule"])
                .withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PaymentMethod Code is not valid!",
                clientMessage: "نحوه پرداخت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "offCodeId") {
        return [
            (0, express_validator_1.body)("offCodeId").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "OffCodeId Code is required!",
                clientMessage: "نام کد مورد معتبر نیست!",
            }),
            (0, express_validator_1.body)("offCodeId").optional().isLength({ min: 1 }).withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "OffCodeId Code is not valid!",
                clientMessage: "نام کد معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "filterQuantity") {
        return [
            (0, express_validator_1.body)("filterQuantity")
                .optional()
                .custom(function (v) {
                return (v.from &&
                    v.to &&
                    typeof Number(v.from) === "number" &&
                    typeof Number(v.to) === "number" &&
                    v.from < v.to);
            })
                .withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "filterQuantity Code is required!",
                clientMessage: "فیلتر تعداد معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "filterCategory") {
        return [
            (0, express_validator_1.body)("filterCategory").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "filterCategory Code is required!",
                clientMessage: "فیلتر دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.body)("filterCategory").optional().isLength({ min: 1 }).withMessage({
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
            (0, express_validator_1.body)("reviewIds").isArray({ min: 1 }).withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ReviewId Code is not valid!",
                clientMessage: "شناسه نظر معتبر نیست!",
            }),
            (0, express_validator_1.body)("reviewIds")
                .custom(function (r) {
                r.every(function (i) {
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
    }
    else if (type === "body" && input === "qAndAs") {
        return [
            (0, express_validator_1.body)("qAndAs").isArray({ min: 1 }).withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "QAndAs Code are not valid!",
                clientMessage: "شناسه های سوالات معتبر نیستند!",
            }),
            (0, express_validator_1.body)("qAndAs")
                .custom(function (r) {
                r.every(function (i) {
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
    }
    else if (type === "body" && input === "englishName") {
        return [
            (0, express_validator_1.body)("englishName").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "englishName is required!",
                clientMessage: "نام انگلیسی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("englishName").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "englishName is not valid!",
                clientMessage: "نام انگلیسی معتبر نیست!",
            }),
            (0, express_validator_1.body)("englishName").isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "englishName is not valid!",
                clientMessage: "نام انگلیسی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productEnglishName") {
        return [
            (0, express_validator_1.body)("productEnglishName").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productEnglishName is not valid!",
                clientMessage: "نام انگلیسی معتبر نیست!",
            }),
            (0, express_validator_1.body)("productEnglishName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productEnglishName is not valid!",
                clientMessage: "نام انگلیسی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "tags") {
        return [
            (0, express_validator_1.body)("tags").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Tags is required!",
                clientMessage: "تگ مورد نیاز است!",
            }),
            (0, express_validator_1.body)("tags").isArray({ min: 1, max: 10 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Tags is not valid!",
                clientMessage: "تگ معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "tagsOp") {
        return [
            (0, express_validator_1.body)("tagsOp").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "TagsOp is not valid!",
                clientMessage: "تگ معتبر نیست!",
            }),
            (0, express_validator_1.body)("tagsOp").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "TagsOp is not valid!",
                clientMessage: "تگ معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productTags") {
        return [
            (0, express_validator_1.body)("productTags").optional().isArray({ min: 1, max: 10 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productTags is not valid!",
                clientMessage: "تگ معتبر نیست!",
            }),
            (0, express_validator_1.body)("productTags")
                .optional()
                .custom(function (v) {
                return v.every(function (i) {
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
    }
    else if (type === "body" && input === "brand") {
        return [
            (0, express_validator_1.body)("brand").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "brand is required!",
                clientMessage: "نام برند مورد نیاز است!",
            }),
            (0, express_validator_1.body)("brand").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "brand is not valid!",
                clientMessage: "نام برند معتبر نیست!",
            }),
            (0, express_validator_1.body)("brand").isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "brand is not valid!",
                clientMessage: "نام برند معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productBrand") {
        return [
            (0, express_validator_1.body)("productBrand").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productBrand is not valid!",
                clientMessage: "نام برند معتبر نیست!",
            }),
            (0, express_validator_1.body)("productBrand").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productBrand is not valid!",
                clientMessage: "نام برند معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productCode") {
        return [
            (0, express_validator_1.body)("productCode").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCode is required!",
                clientMessage: "کد محصول مورد نیاز است!",
            }),
            (0, express_validator_1.body)("productCode").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCode is not valid!",
                clientMessage: "کد محصول معتبر نیست!",
            }),
            (0, express_validator_1.body)("productCode").isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCode is not valid!",
                clientMessage: "کد محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "subCategory") {
        return [
            (0, express_validator_1.body)("subCategory").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "subCategory is required!",
                clientMessage: "زیر دسته بندی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("subCategory").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "subCategory is not valid!",
                clientMessage: "زیر دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.body)("subCategory").isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "subCategory is not valid!",
                clientMessage: "زیر دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productProductCode") {
        return [
            (0, express_validator_1.body)("productProductCode").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productProductCode is not valid!",
                clientMessage: "کد محصول معتبر نیست!",
            }),
            (0, express_validator_1.body)("productProductCode").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productProductCode is not valid!",
                clientMessage: "کد محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryCode") {
        return [
            (0, express_validator_1.body)("categoryCode").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCode is required!",
                clientMessage: "کد دسته بندی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("categoryCode").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productCategoryCode") {
        return [
            (0, express_validator_1.body)("productCategoryCode").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCategoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.body)("productCategoryCode").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCategoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryCategoryCode") {
        return [
            (0, express_validator_1.body)("categoryCategoryCode").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCategoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryCategoryCode").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCategoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryId") {
        return [
            (0, express_validator_1.body)("categoryId").optional().isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CategoryId is not valid!",
                clientMessage: "شناسه دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryId").optional().isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CategoryId is not valid!",
                clientMessage: "شناسه دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "image") {
        return [
            (0, express_validator_1.body)("image").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "image is required!",
                clientMessage: "آدرس عکس مورد نیاز است!",
            }),
            (0, express_validator_1.body)("image").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "image is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("image").isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "image is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("image")
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "productImage") {
        return [
            (0, express_validator_1.body)("productImage").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productImage is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("productImage").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productImage is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("productImage")
                .optional()
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "categoryImage") {
        return [
            (0, express_validator_1.body)("categoryImage").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryImage is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryImage").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryImage is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryImage")
                .optional()
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "categoryDescription") {
        return [
            (0, express_validator_1.body)("categoryDescription").optional().isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryDescription is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryDescription").optional().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryDescription is not valid!",
                clientMessage: "آدرس عکس معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "cardGallery") {
        return [
            (0, express_validator_1.body)("cardGallery").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "cardGallery is required!",
                clientMessage: "آدرس گالری مورد نیاز است!",
            }),
            (0, express_validator_1.body)("cardGallery").isArray({ min: 1, max: 3 }).withMessage({
                clientCode: 80,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "cardGallery is not valid!",
                clientMessage: "آدرس گالری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productCardGallery") {
        return [
            (0, express_validator_1.body)("productCardGallery")
                .optional()
                .isArray({ min: 1, max: 3 })
                .withMessage({
                clientCode: 80,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCardGallery is not valid!",
                clientMessage: "آدرس گالری معتبر نیست!",
            }),
            (0, express_validator_1.body)("productCardGallery")
                .optional()
                .custom(function (v) {
                return (0, lodash_es_1.every)(function (i) {
                    return (i.split(".").length === 2 && ObjectId.isValid(i.split(".")[0]));
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
    }
    else if (type === "body" && input === "price") {
        return [
            (0, express_validator_1.body)("price").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "price required!",
                clientMessage: "قیمت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("price").isInt({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "price are not valid!",
                clientMessage: "قیمت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "newPrice") {
        return [
            (0, express_validator_1.body)("newPrice").optional().isInt({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "newPrice are not valid!",
                clientMessage: "قیمت جدید معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productPrice") {
        return [
            (0, express_validator_1.body)("productPrice").optional().isInt({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productPrice are not valid!",
                clientMessage: "قیمت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productNewPrice") {
        return [
            (0, express_validator_1.body)("productNewPrice").optional().isInt({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productNewPrice are not valid!",
                clientMessage: "قیمت جدید معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "description") {
        return [
            (0, express_validator_1.body)("description")
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
            (0, express_validator_1.body)("gallery").optional().isArray({ min: 1, max: 20 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Gallery are not valid!",
                clientMessage: "گالری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productDescription") {
        return [
            (0, express_validator_1.body)("productDescription")
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
    }
    else if (type === "body" && input === "productGallery") {
        return [
            (0, express_validator_1.body)("productGallery").optional().isArray({ max: 20 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Gallery are not valid!",
                clientMessage: "گالری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "cardProperties") {
        return [
            (0, express_validator_1.body)("cardProperties").optional().isArray({ max: 10 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CardProperties are not valid!",
                clientMessage: "ویژگی های کارت معتبر نیستند!",
            }),
            (0, express_validator_1.body)("cardProperties")
                .optional()
                .custom(function (v) {
                return v.every(function (i) {
                    return (i.key &&
                        typeof i.key === "string" &&
                        i.value &&
                        typeof i.value === "string");
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
    }
    else if (type === "body" && input === "properties") {
        return [
            (0, express_validator_1.body)("properties").optional().isArray({ max: 10 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Properties are not valid!",
                clientMessage: "ویژگی های کارت معتبر نیستند!",
            }),
            (0, express_validator_1.body)("properties")
                .optional()
                .custom(function (v) {
                return v.every(function (i) {
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
    }
    else if (type === "body" && input === "accessLevels") {
        return [
            (0, express_validator_1.body)("accessLevels").optional().notEmpty().withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "AccessLevels are not valid!",
                clientMessage: "سطوح دسترسی معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "productCardProperties") {
        return [
            (0, express_validator_1.body)("productCardProperties").optional().isArray({ min: 1 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCardProperties are not valid!",
                clientMessage: "ویژگی های کارت معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "productProperties") {
        return [
            (0, express_validator_1.body)("productProperties").optional().isArray({ min: 1 }).withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productProperties are not valid!",
                clientMessage: "ویژگی های کارت معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "productAccessLevels") {
        return [
            (0, express_validator_1.body)("productAccessLevels").optional().notEmpty().withMessage({
                clientCode: 15,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productAccessLevels are not valid!",
                clientMessage: "سطوح دسترسی معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "commercialhName") {
        return [
            (0, express_validator_1.body)("commercialhName").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CommercialhName is required!",
                clientMessage: "نام تجاری مورد نیاز است!",
            }),
            (0, express_validator_1.body)("commercialhName").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CommercialhName is not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "searchItems") {
        return [
            (0, express_validator_1.body)("searchItems").optional().isArray({ min: 1, max: 7 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "searchItems is not valid!",
                clientMessage: "آیتم های جستجو معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "categorySearchItems") {
        return [
            (0, express_validator_1.body)("categorySearchItems")
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
    }
    else if (type === "body" && input === "_id") {
        return [
            (0, express_validator_1.body)("_id").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "_id is required!",
                clientMessage: "شناسه  مورد نیاز است!",
            }),
            (0, express_validator_1.body)("_id").isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "_id is not valid!",
                clientMessage: "شناسه  معتبر نیست!",
            }),
            (0, express_validator_1.body)("_id").isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "_id is not valid!",
                clientMessage: "شناسه  معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "managerName") {
        return [
            (0, express_validator_1.body)("managerName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
            (0, express_validator_1.body)("managerName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "managerLastName") {
        return [
            (0, express_validator_1.body)("managerLastName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerLastName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
            (0, express_validator_1.body)("managerLastName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerLastName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "managerEmail") {
        return [
            (0, express_validator_1.body)("managerEmail").optional().isEmail().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerEmail is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "managerIsActive") {
        return [
            (0, express_validator_1.body)("managerIsActive").optional().isBoolean().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "managerIsActive is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "managerRole") {
        return [
            (0, express_validator_1.body)("managerRole")
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
    }
    else if (type === "body" && input === "supporterName") {
        return [
            (0, express_validator_1.body)("supporterName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
            (0, express_validator_1.body)("supporterName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "supporterLastName") {
        return [
            (0, express_validator_1.body)("supporterLastName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterLastName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
            (0, express_validator_1.body)("supporterLastName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterLastName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "supporterEmail") {
        return [
            (0, express_validator_1.body)("supporterEmail").optional().isEmail().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterEmail is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "supporterIsActive") {
        return [
            (0, express_validator_1.body)("supporterIsActive").optional().isBoolean().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "supporterIsActive is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "supporterRole") {
        return [
            (0, express_validator_1.body)("supporterRole")
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
    }
    else if (type === "body" && input === "deliverymanName") {
        return [
            (0, express_validator_1.body)("deliverymanName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
            (0, express_validator_1.body)("deliverymanName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanName is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "deliverymanLastName") {
        return [
            (0, express_validator_1.body)("deliverymanLastName").optional().isString().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanLastName is not valid!",
                clientMessage: "نام خانوادگی معتبر نیست!",
            }),
            (0, express_validator_1.body)("deliverymanLastName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanLastName is not valid!",
                clientMessage: "نام خانوادگی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "deliverymanEmail") {
        return [
            (0, express_validator_1.body)("deliverymanEmail").optional().isEmail().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanEmail is not valid!",
                clientMessage: "نام کاربری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "deliverymanIsActive") {
        return [
            (0, express_validator_1.body)("deliverymanIsActive").optional().isBoolean().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliverymanIsActive is not valid!",
                clientMessage: "مجوز فعالیت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "deliverymanRole") {
        return [
            (0, express_validator_1.body)("deliverymanRole")
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
    }
    else if (type === "body" && input === "userIsActive") {
        return [
            (0, express_validator_1.body)("userIsActive").optional().isBoolean().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "userIsActive is not valid!",
                clientMessage: "نام معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "userUserType") {
        return [
            (0, express_validator_1.body)("userUserType").optional().isIn([1, 2, 3, 4, 5]).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "userUserType is not valid!",
                clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "isActive") {
        return [
            (0, express_validator_1.body)("isActive").exists().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "IsActive is not valid!",
                clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
            }),
            (0, express_validator_1.body)("isActive").isBoolean().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "IsActive is not valid!",
                clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "role") {
        return [
            (0, express_validator_1.body)("role").exists().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Role is not valid!",
                clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
            }),
            (0, express_validator_1.body)("role").isIn(["Supporter", "Manager"]).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Role is not valid!",
                clientMessage: "ورودی های ویرایش محصول معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "quantity") {
        return [
            (0, express_validator_1.body)("quantity").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Quantity is required!",
                clientMessage: "تعداد مورد نیاز است!",
            }),
            (0, express_validator_1.body)("quantity").isInt({ min: 0 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Quantity are not valid!",
                clientMessage: "تعداد معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "regionNum") {
        return [
            (0, express_validator_1.body)("regionNum").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "RegionNum is required!",
                clientMessage: "شماره منطقه مورد نیاز است!",
            }),
            (0, express_validator_1.body)("regionNum").isInt({ min: 0, max: 22 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "RegionNum are not valid!",
                clientMessage: "شماره منطقه معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "shippingPrice") {
        return [
            (0, express_validator_1.body)("shippingPrice").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ShippingPrice is required!",
                clientMessage: "قیمت ارسال مورد نیاز است!",
            }),
            (0, express_validator_1.body)("shippingPrice").isInt({ min: 0 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ShippingPrice are not valid!",
                clientMessage: "قیمت ارسال معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "userId") {
        return [
            (0, express_validator_1.body)("userId").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "UserId is required!",
                clientMessage: "شناسه  مورد نیاز است!",
            }),
        ];
    }
    else if (type === "body" && input === "id") {
        return [
            (0, express_validator_1.body)("id").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("id").isUUID().withMessage({
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
            (0, express_validator_1.body)("verificationCode").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("verificationCode")
                .isString()
                .isLength({ min: 4, max: 4 })
                .withMessage({
                clientCode: 5,
                statusCode: 422,
                messageEnglish: "Verification Code is not valid!",
                clientMessage: "کد راستی آزمایی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "answer") {
        return [
            (0, express_validator_1.body)("answer").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("answer").isString().isLength({ min: 1, max: 200 }).withMessage({
                clientCode: 5,
                statusCode: 422,
                messageEnglish: "Verification Code is not valid!",
                clientMessage: "کد راستی آزمایی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "questionId") {
        return [
            (0, express_validator_1.body)("questionId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.body)("questionId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                messageEnglish: "Verification Code is not valid!",
                clientMessage: "کد راستی آزمایی معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "username") {
        return [
            (0, express_validator_1.body)("username").exists().withMessage({
                clientCode: 11,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Username address is required!",
                clientMessage: "نام کاربری مورد نیاز است!",
            }),
            (0, express_validator_1.body)("username")
                .custom(function (v) {
                return isEmailValid(v) || (0, exports.isValidMobilePhone)(v);
            })
                .withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Username address is not valid!",
                clientMessage: "نام کاربری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "queries") {
        return [
            (0, express_validator_1.body)("queries").exists().withMessage({
                clientCode: 38,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Queries are required!",
                clientMessage: "جستجوها مورد نیاز است!",
            }),
            (0, express_validator_1.body)("queries").isArray({ min: 1 }).withMessage({
                clientCode: 38,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Queries are not valid!",
                clientMessage: "جستجوها معتبر نیستند!",
            }),
        ];
    }
    else if (type === "body" && input === "commercialName") {
        return [
            (0, express_validator_1.body)("commercialName").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "commercialName required!",
                clientMessage: "نام تجاری مورد نیاز است!",
            }),
            (0, express_validator_1.body)("commercialName").isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "commercialName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryName") {
        return [
            (0, express_validator_1.body)("categoryName").optional().isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "productName") {
        return [
            (0, express_validator_1.body)("productName").optional().isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
            (0, express_validator_1.body)("productName").optional().isLength({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "categoryCommercialName") {
        return [
            (0, express_validator_1.body)("categoryCommercialName").optional().isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCommercialName are not valid!",
                clientMessage: "نام تجاری معتبر نیست!",
            }),
            (0, express_validator_1.body)("categoryCommercialName")
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
    }
    else if (type === "body" && input === "code") {
        return [
            (0, express_validator_1.body)("code").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف مورد نیاز است!",
            }),
            (0, express_validator_1.body)("code").isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف معتبر نیست!",
            }),
            (0, express_validator_1.body)("code").isLength({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "type") {
        return [
            (0, express_validator_1.body)("type").exists().withMessage({
                clientCode: 52,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Type is required!",
                clientMessage: "نوع مورد نیاز است!",
            }),
            (0, express_validator_1.body)("type")
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
    }
    else if (type === "body" && input === "usernameOp") {
        return [
            (0, express_validator_1.body)("usernameOp")
                .optional()
                .custom(function (v) {
                return isEmailValid(v) || (0, exports.isValidMobilePhone)(v);
            })
                .withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "UsernameOp is not valid!",
                clientMessage: "آدرس ایمیل معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "minPrice") {
        return [
            (0, express_validator_1.body)("minPrice").optional().isInt({ min: 1 }).withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "minPrice is not valid!",
                clientMessage: "حداقل میزان خرید معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "maxOff") {
        return [
            (0, express_validator_1.body)("maxOff").optional().isInt({ min: 1 }).withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "maxOff is not valid!",
                clientMessage: "حداکثر تخفیف روی یک آیتم معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "maxTotalOff") {
        return [
            (0, express_validator_1.body)("maxTotalOff").optional().isInt({ min: 1 }).withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "maxTotalOff is not valid!",
                clientMessage: "حداکثر تخفیف در یک خرید معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "offPercent") {
        return [
            (0, express_validator_1.body)("offPercent").exists().withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "offPercent is not valid!",
                clientMessage: "درصد تخفیف مورد نیاز است!",
            }),
            (0, express_validator_1.body)("offPercent").isInt({ min: 1 }).withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "offPercent is not valid!",
                clientMessage: "درصد تخفیف معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "quantityOp") {
        return [
            (0, express_validator_1.body)("quantityOp").optional().isInt({ min: 1 }).withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "quantity is not valid!",
                clientMessage: "تعداد مجاز استفاده از کد تخفیف معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "expiredDate") {
        return [
            (0, express_validator_1.body)("expiredDate").exists().withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "expiredDate is not valid!",
                clientMessage: "تاریخ انقضا مورد نیاز است!",
            }),
            (0, express_validator_1.body)("expiredDate")
                .custom(function (v) {
                var date = new Date(v).getTime();
                console.log("date is ", date, "and the diffrence is ", new Date().getTime() - date);
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
    }
    else if (type === "body" && input === "codeOp") {
        return [
            (0, express_validator_1.body)("codeOp").optional().isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف معتبر نیست!",
            }),
            (0, express_validator_1.body)("codeOP").optional().isLength({ min: 1 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "date") {
        return [
            (0, express_validator_1.body)("date")
                .optional()
                .custom(function (v) {
                return ((v.from && v.from === v.from.getTime()) ||
                    (v.to && v.to === v.from.getTime()));
            })
                .withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Date is not valid!",
                clientMessage: "تاریخ انقضا معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "isValid") {
        return [
            (0, express_validator_1.body)("isValid").optional().isBoolean().withMessage({
                clientCode: 12,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "isValid is not valid!",
                clientMessage: "پرچم نمایش تمام کدها معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "orderId") {
        return [
            (0, express_validator_1.body)("orderId").exists().isFloat().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not present!",
                clientMessage: "شناسه ورودی سفارش موجود نیست!",
            }),
            (0, express_validator_1.body)("orderId")
                .custom(function (v) {
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
    }
    else if (type === "body" && input === "paymentMethodOp") {
        return [
            (0, express_validator_1.body)("paymentMethodOp").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PaymentMethod Code is not valid!",
                clientMessage: "نحوه پرداخت معتبر نیست!",
            }),
            (0, express_validator_1.body)("paymentMethodOp").optional().isIn(["Cash", "Online"]).withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "PaymentMethod Code is not valid!",
                clientMessage: "نحوه پرداخت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "deliveryStatusOp") {
        return [
            (0, express_validator_1.body)("deliveryStatusOp").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliver status is not valid!",
                clientMessage: "وضعیت ارسال معتبر نیست",
            }),
            (0, express_validator_1.body)("deliveryStatusOp")
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
    }
    else if (type === "body" && input === "deliveryStatus") {
        return [
            (0, express_validator_1.body)("deliveryStatus").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliver status is not valid!",
                clientMessage: "وضعیت ارسال معتبر نیست",
            }),
            (0, express_validator_1.body)("deliveryStatus")
                .isIn(["Sent", "Received", "Failed", "Unknown"])
                .withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "deliver status is not valid!",
                clientMessage: "وضعیت ارسال معتبر نیست",
            }),
        ];
    }
    else if (type === "body" && input === "usernameOp") {
        return [
            (0, express_validator_1.body)("usernameOp").optional().isEmail().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "username is not valid!",
                clientMessage: "وضعیت یوزرنیم ارسالی معتبر نیست",
            }),
        ];
    }
    else if (type === "body" && input === "orderStatusOp") {
        return [
            (0, express_validator_1.body)("orderStatusOp").optional().isString().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "order status is not valid!",
                clientMessage: "وضعیت سفارش معتبر نیست",
            }),
            (0, express_validator_1.body)("orderStatusOp")
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
    }
    else if (type === "body" && input === "dateOp") {
        return [
            // body('dateOp').optional()
            // .custom((v) => {
            //   return Object.keys(v).length ===2})
            // .withMessage({ clientCode: 4, statusCode: 422, title: 'خطا رخ داد', messageEnglish: 'date object is not valid!', clientMessage: 'وضعیت تاریخ های ورودی معتبر نیست' }),
            (0, express_validator_1.body)("dateOp")
                .optional()
                .custom(function (v) {
                var from = new Date(v.from).getTime();
                var to = new Date(v.to).getTime();
                if (to > from) {
                    return true;
                }
                else
                    return false;
            })
                .withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "date object is not valid!",
                clientMessage: "وضعیت تاریخ های ورودی معتبر نیست",
            }),
        ];
    }
    else if (type === "body" && input === "priceOp") {
        return [
            (0, express_validator_1.body)("priceOp")
                .optional()
                .custom(function (v) {
                return Object.keys(v).every(function (i) {
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
            (0, express_validator_1.body)("priceOp")
                .optional()
                .custom(function (v) {
                if (v["to"] > v["from"]) {
                    return true;
                }
                else
                    return false;
            })
                .withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "price object is not valid!",
                clientMessage: "وضعیت قیمت های ورودی معتبر نیست",
            }),
        ];
    }
    else if (type === "body" && input === "orderIdOp") {
        return [
            (0, express_validator_1.body)("orderIdOp").optional().isFloat().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not valid!",
                clientMessage: "شناسه ورودی سفارش معتبر نیست!",
            }),
            (0, express_validator_1.body)("orderIdOp")
                .optional()
                .custom(function (v) {
                return (v.toString().indexOf(".1") > -1 || v.toString().indexOf(".2") > -1);
            })
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not valid!",
                clientMessage: "شناسه ورودی سفارش معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "isExcel") {
        return [
            (0, express_validator_1.body)("isExcel").optional().isBoolean().withMessage({
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
            (0, express_validator_1.body)("ticketSubject").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "subject is required!",
                clientMessage: "متن موضوع مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketSubject")
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
    }
    else if (type === "body" && input === "ticketType") {
        return [
            (0, express_validator_1.body)("ticketType").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticketType is required!",
                clientMessage: "نوع تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketType")
                .isString()
                .custom(function (k) {
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
    }
    else if (type === "body" && input === "ticketIssue") {
        return [
            (0, express_validator_1.body)("ticketIssue").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticketIssue is required!",
                clientMessage: "متن مشکل مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketIssue")
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
    }
    else if (type === "body" && input === "ticketId") {
        return [
            (0, express_validator_1.body)("ticketId").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is required!",
                clientMessage: "کد تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketId").isMongoId().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is not valid!",
                clientMessage: "کد تیکت معتبر نیست!",
            }),
        ];
    }
    else if (type === "body" && input === "ticketIdArray") {
        return [
            (0, express_validator_1.body)("ticketIdArray").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is required!",
                clientMessage: "کد تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketIdArray").isArray().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is required!",
                clientMessage: "کد تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketIdArray")
                .custom(function (r) {
                return r.every(function (i) {
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
    }
    else if (type === "body" && input === "ticketComment") {
        return [
            (0, express_validator_1.body)("ticketComment").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticketComment is required!",
                clientMessage: "متن تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketComment")
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
    }
    else if (type === "body" && input === "ticketPriority") {
        return [
            (0, express_validator_1.body)("ticketPriority").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticketPriority is required!",
                clientMessage: "متن الویت مورد نیاز است!",
            }),
            (0, express_validator_1.body)("ticketPriority")
                .isString()
                .custom(function (k) {
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
            (0, express_validator_1.query)("ticketId").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is required!",
                clientMessage: "کد تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.query)("ticketId").isMongoId().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket id is not valid!",
                clientMessage: "کد تیکت معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "ticketStatus") {
        return [
            (0, express_validator_1.query)("ticketStatus").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ticket status is required!",
                clientMessage: "کد تیکت مورد نیاز است!",
            }),
            (0, express_validator_1.query)("ticketStatus")
                .isString()
                .custom(function (k) {
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
            (0, express_validator_1.query)("categoryCode").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCode is required!",
                clientMessage: "کد دسته بندی مورد نیاز است!",
            }),
            (0, express_validator_1.query)("categoryCode").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "categoryCode is not valid!",
                clientMessage: "کد دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "productCode") {
        return [
            (0, express_validator_1.query)("productCode").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCode is required!",
                clientMessage: "کد محصول مورد نیاز است!",
            }),
            (0, express_validator_1.query)("productCode").isString().isLength({ min: 1 }).withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "productCode is not valid!",
                clientMessage: "کد محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "code") {
        return [
            (0, express_validator_1.query)("code").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف مورد نیاز است!",
            }),
            (0, express_validator_1.query)("code").isString().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Code are not valid!",
                clientMessage: "نام کد تخفیف معتبر نیست!",
            }),
            (0, express_validator_1.query)("code").isLength({ min: 1 }).withMessage({
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
            (0, express_validator_1.query)("productId").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is required!",
                clientMessage: "شناسه محصول مورد نیاز است!",
            }),
            (0, express_validator_1.query)("productId").isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
            (0, express_validator_1.query)("productId").isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "categoryId") {
        return [
            (0, express_validator_1.query)("categoryId").optional().isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CategoryId is not valid!",
                clientMessage: "شناسه دسته بندی معتبر نیست!",
            }),
            (0, express_validator_1.query)("categoryId").optional().isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "CategoryId is not valid!",
                clientMessage: "شناسه دسته بندی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "sortBy") {
        return [
            (0, express_validator_1.query)("sortBy").optional().isIn(["1", "2", "3", "4", "5"]).withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "SortBy is not valid!",
                clientMessage: "شناسه مرتب سازی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "id") {
        return [
            (0, express_validator_1.query)("id").exists().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Transaction Id is required!",
                clientMessage: "شناسه تراکنش مورد نیاز است!",
            }),
            (0, express_validator_1.query)("id").isHexadecimal().withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Transaction Id is not valid!",
                clientMessage: "شناسه تراکنش معتبر نیست!",
            }),
            (0, express_validator_1.query)("id").isString().isLength({ min: 128, max: 128 }).withMessage({
                clientCode: 10,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Transaction Id is not valid!",
                clientMessage: "شناسه تراکنش معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "username") {
        return [
            (0, express_validator_1.query)("username").exists().withMessage({
                clientCode: 70,
                statusCode: 422,
                clientMessage: "Username is required!",
            }),
            (0, express_validator_1.query)("username")
                .custom(function (v) {
                return isEmailValid(v) || (0, exports.isValidMobilePhone)(v);
            })
                .withMessage({
                clientCode: 71,
                statusCode: 422,
                clientMessage: "Username is not valid!",
            }),
        ];
    }
    else if (type === "query" && input === "string") {
        return [
            (0, express_validator_1.query)("string").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.query)("string").isUUID().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Verification Code is not valid!",
                clientMessage: "کد راستی آزمایی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "page") {
        return [
            (0, express_validator_1.query)("page").exists().withMessage({
                clientCode: 33,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Page is required!",
                clientMessage: "عدد صفحه مورد نیاز است!",
            }),
            (0, express_validator_1.query)("page").isInt().isLength({ min: 1, max: 2 }).withMessage({
                clientCode: 34,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Page is not valid!",
                clientMessage: "عدد صفحه معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "location") {
        return [
            (0, express_validator_1.query)("location").exists().withMessage({
                clientCode: 35,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Location is required!",
                clientMessage: "مبدا درخواست نشانه لوکیشن را ندارد!",
            }),
            (0, express_validator_1.query)("location")
                .isIn(["none", "home", "dashboard", "wallet", "offers", "all"])
                .withMessage({
                clientCode: 36,
                statusCode: 422,
                messageEnglish: "Location is not valid!",
                clientMessage: "نشانه لوکیشن معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "reviewId") {
        return [
            (0, express_validator_1.query)("reviewId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ReviewId Code is required!",
                clientMessage: "شناسه نظر مورد نیاز است!",
            }),
            (0, express_validator_1.query)("reviewId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ReviewId Code is not valid!",
                clientMessage: "شناسه نظر معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "addressId") {
        return [
            (0, express_validator_1.query)("addressId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "AddressId Code is required!",
                clientMessage: "شناسه آدرس مورد نیاز است!",
            }),
            (0, express_validator_1.query)("addressId").isMongoId().withMessage({
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
            (0, express_validator_1.query)("etheriumAccountAddress")
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
            (0, express_validator_1.query)("pageNumber")
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
    }
    else if (type === "query" && input === "interval") {
        return [
            (0, express_validator_1.query)("interval")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "interval is required!",
                clientMessage: "  بازه مورد نیاز است!",
            })
                .isString()
                .custom(function (i) {
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
    }
    else if (type === "query" && input === "kind") {
        return [
            (0, express_validator_1.query)("kind")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "kind is required!",
                clientMessage: "  نوع سفارش پذیرفته شده مورد نیاز است!",
            })
                .isString()
                .custom(function (k) {
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
    }
    else if (type === "query" && input === "type") {
        return [
            (0, express_validator_1.query)("type")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "type is required!",
                clientMessage: "نوع سفارش مورد نیاز است!",
            })
                .isString()
                .custom(function (k) {
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
    }
    else if (type === "query" && input === "status") {
        return [
            (0, express_validator_1.query)("status")
                .exists()
                .withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "status is required!",
                clientMessage: " حالت مورد نیز است.!",
            })
                .isString()
                .custom(function (s) {
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
    }
    else if (type === "query" && input === "RialId") {
        return [
            (0, express_validator_1.query)("RialId").optional().isMongoId().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "rial id is not valid!",
                clientMessage: "شناسه ریال معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "pid") {
        return [
            (0, express_validator_1.query)("pid").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "pid is required!",
                clientMessage: "کد پیگیری سفارش مورد نیاز است!",
            }),
            (0, express_validator_1.query)("pid").isNumeric().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "pid is not valid!",
                clientMessage: "کد پیگیری سفارش معتبر نیست!",
            }),
            (0, express_validator_1.query)("pid")
                .custom(function (v) {
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
    }
    else if (type === "query" && input === "Status") {
        return [
            (0, express_validator_1.query)("Status").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Status is required!",
                clientMessage: "کد وضعیت  مورد نیاز است!",
            }),
            (0, express_validator_1.query)("Status").isString().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Status is not valid!",
                clientMessage: "کد وضعیت معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "Amount") {
        return [
            (0, express_validator_1.query)("Amount").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Amount is required!",
                clientMessage: "مقدار خرید مورد نیاز است!",
            }),
            (0, express_validator_1.query)("Amount").isNumeric().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Amount is not valid!",
                clientMessage: "مقدار خرید معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "Authority") {
        return [
            (0, express_validator_1.query)("Authority").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Authority is required!",
                clientMessage: "شناسه مخصوص زرین پال مورد نیاز است!",
            }),
            (0, express_validator_1.query)("Authority").isNumeric().withMessage({
                clientCode: 79,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Authority is not valid!",
                clientMessage: "شناسه مخصوص زرین پال معتبر نیست!",
            }),
            (0, express_validator_1.query)("Authority")
                .custom(function (v) {
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
    }
    else if (type === "query" && input === "questionId") {
        return [
            (0, express_validator_1.query)("questionId").exists().withMessage({
                clientCode: 4,
                statusCode: 422,
                messageEnglish: "Verification Code is required!",
                clientMessage: "کد راستی آزمایی مورد نیاز است!",
            }),
            (0, express_validator_1.query)("questionId").isMongoId().withMessage({
                clientCode: 5,
                statusCode: 422,
                messageEnglish: "Verification Code is not valid!",
                clientMessage: "کد راستی آزمایی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "orderMongoId") {
        return [
            (0, express_validator_1.query)("orderMongoId").exists().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "order id fields are not valid!",
                clientMessage: " شناسه سفارش ورودی موجود نیست !",
            }),
            (0, express_validator_1.query)("orderMongoId").isMongoId().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "order id fields are not valid!",
                clientMessage: "شناسه  سفارش ورودی معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "orderId") {
        return [
            (0, express_validator_1.query)("orderId").exists().isFloat().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not present!",
                clientMessage: "شناسه ورودی سفارش موجود نیست!",
            }),
            (0, express_validator_1.query)("orderId")
                .custom(function (v) {
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
    }
    else if (type === "query" && input === "orderIdOp") {
        return [
            (0, express_validator_1.query)("orderIdOp").optional().isFloat().withMessage({
                clientCode: 77,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "orderOrderId's fields are not present!",
                clientMessage: "شناسه ورودی سفارش موجود نیست!",
            }),
            (0, express_validator_1.query)("orderIdOp")
                .optional()
                .custom(function (v) {
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
    }
    else if (type === "query" && input === "productId") {
        return [
            (0, express_validator_1.query)("productId").exists().withMessage({
                clientCode: 27,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is required!",
                clientMessage: "شناسه محصول مورد نیاز است!",
            }),
            (0, express_validator_1.query)("productId").isHexadecimal().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
            (0, express_validator_1.query)("productId").isMongoId().withMessage({
                clientCode: 28,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "ProductId is not valid!",
                clientMessage: "شناسه محصول معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "phoneNumber") {
        return [
            (0, express_validator_1.query)("phoneNumber").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "phoneNumber's is not valid!",
                clientMessage: "شماره موبایل معتبر نیست!",
            }),
            (0, express_validator_1.query)("phoneNumber")
                .custom(function (v) {
                return (v.length === 11 &&
                    (v[0] == "0" || v[0] == "۰") &&
                    (v[1] == "9" || v[1] == "۹") &&
                    (/^\d+$/.test(v) || /^\d+$/.test(numbersFormatter(v, "en"))));
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
    }
    else if (type === "query" && input === "tags") {
        return [
            (0, express_validator_1.query)("tags").exists().withMessage({
                clientCode: 78,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "Tags is required!",
                clientMessage: "تگ مورد نیاز است!",
            }),
            (0, express_validator_1.query)("tags").isString().withMessage({
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
            (0, express_validator_1.query)("searchType").exists().withMessage({
                clientCode: 35,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "searchType is required!",
                clientMessage: "شناسه جستجو مورد نیاز است!",
            }),
            (0, express_validator_1.query)("searchType").isIn(["users", "orders", "products"]).withMessage({
                clientCode: 36,
                statusCode: 422,
                messageEnglish: "searchType is not valid!",
                clientMessage: "شناسه جستجو معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "fromDate") {
        return [
            (0, express_validator_1.query)("fromDate")
                .optional()
                .custom(function (v) {
                var date = new Date(v).getTime();
                return date < new Date().getTime();
            })
                .withMessage({
                clientCode: 36,
                statusCode: 422,
                messageEnglish: "fromDate is not valid!",
                clientMessage: "شناسه جستجو معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "toDate") {
        return [
            (0, express_validator_1.query)("toDate")
                .optional()
                .custom(function (v) {
                var date = new Date(v).getTime();
                return !isNaN(date);
            })
                .withMessage({
                clientCode: 36,
                statusCode: 422,
                messageEnglish: "toDate is not valid!",
                clientMessage: "شناسه جستجو معتبر نیست!",
            }),
        ];
    }
    else if (type === "query" && input === "codeId") {
        return [
            (0, express_validator_1.query)("codeId").exists().withMessage({
                clientCode: 36,
                statusCode: 422,
                messageEnglish: "toDate is not valid!",
                clientMessage: "شناسه کد موجود نیست!",
            }),
            (0, express_validator_1.query)("codeId").isMongoId().withMessage({
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
            (0, express_validator_1.param)("imageName").exists().withMessage({
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
            (0, express_validator_1.cookie)("sessionId").exists().withMessage({
                clientCode: 41,
                statusCode: 422,
                title: "خطا رخ داد",
                messageEnglish: "sessionId is required!",
                clientMessage: "مشکلی پیش آمده است!",
            }),
        ];
    }
};
exports.userValidationRules = userValidationRules;
var validate = function (req, res, next) {
    var Result = (0, express_validator_1.validationResult)(req);
    if (!Result["errors"] || Result["errors"].length === 0) {
        next();
    }
    else {
        console.log(Result["errors"]);
        var error = new myError_1.default(Result["errors"][0].msg.messageEnglish, Result["errors"][0].msg.statusCode, Result["errors"][0].msg.clientCode, Result["errors"][0].msg.clientMessage, Result["errors"][0].msg.title);
        next(error);
    }
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map