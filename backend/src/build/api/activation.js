"use strict";
//@ts-ignore
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isActive = void 0;
var restrictions_1 = require("../db/restrictions");
var myError_1 = __importDefault(require("./myError"));
var isActive = function (_a) {
    var curIds = _a.curIds, action = _a.action;
    return restrictions_1.Restrictions.findOne({ action: action })
        .then(function (doc) {
        if (doc && doc.action === action) {
            var status = doc.status;
            if (status === "Active") {
                return {
                    isActive: true,
                    certainIndex: doc.certainIndex,
                };
            }
            else if (status === "DeActive") {
                var error = new myError_1.default("The action is blocked temporarily, please do it later!", 400, 11, "امکان انجام این فعالیت به طور موقت متوقف شده است. لطفا بعدا اقدام فرمایید", "خطا رخ داد");
                throw error;
            }
            else {
                var curIdsMap = curIds.map(function (e) {
                    if (!doc.currencyIds.includes(e)) {
                        return;
                    }
                    else {
                        var error = new myError_1.default("The action is blocked temporarily, please do it later!", 400, 11, "امکان انجام این فعالیت به طور موقت متوقف شده است. لطفا بعدا اقدام فرمایید", "خطا رخ داد");
                        throw error;
                    }
                });
                return Promise.all(curIdsMap)
                    .then(function () {
                    return {
                        isActive: true,
                        certainIndex: doc.certainIndex,
                    };
                })
                    .catch(function (err) {
                    throw err;
                });
            }
        }
        else {
            return {
                isActive: true,
                certainIndex: 1,
            };
        }
    })
        .catch(function (err) {
        throw err;
    });
};
exports.isActive = isActive;
//# sourceMappingURL=activation.js.map