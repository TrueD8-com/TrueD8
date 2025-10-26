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
exports.isAuthorized = isAuthorized;
exports.isAdmin = isAdmin;
exports.isAllowed = isAllowed;
var _ = __importStar(require("lodash-es"));
var myError_1 = __importDefault(require("../api/myError"));
var accessLevels_1 = require("../db/accessLevels");
var admin_1 = require("../db/admin");
function isAuthorized(req, res, next) {
    if (!req.session.userId) {
        var error = new myError_1.default('unauthorized cookie', 401, 1, 'خطا رخ داد!', 'لطفا برای ادامه لاگین کنید!');
        next(error);
    }
    else {
        next();
    }
}
function isAdmin(req, res, next) {
    if (!req.session.adminId) {
        var error = new myError_1.default('unauthorized', 401, 3, 'خطا رخ داد!', 'شما اجازه دسترسی ندارید!');
        next(error);
    }
    else {
        next();
    }
}
function isAllowed(req, res, next) {
    var adminId = req.session.adminId;
    admin_1.Admin.findOne({ _id: adminId })
        .then(function (person) {
        if (person && person._id.toString() === adminId) {
            var theRole_1 = person.role;
            accessLevels_1.AccessLevels.findOne({ role: theRole_1 })
                .then(function (ac) {
                if (ac && ac.role === theRole_1) {
                    var originalUrl_1 = req.originalUrl;
                    var theIndex = _.findIndex(ac.methods, function (v) { return v.name === originalUrl_1; });
                    if (theIndex !== -1) {
                        next();
                    }
                    else {
                        var error = new myError_1.default('unauthorized', 401, 3, 'خطا رخ داد!', 'شما اجازه دسترسی ندارید!');
                        next(error);
                    }
                }
                else {
                    var error = new myError_1.default('unauthorized', 401, 3, 'خطا رخ داد!', 'شما اجازه دسترسی ندارید!');
                    next(error);
                }
            })
                .catch(function (err) {
                next(err);
            });
        }
        else {
            var error = new myError_1.default('unauthorized', 401, 3, 'خطا رخ داد!', 'شما اجازه دسترسی ندارید!');
            next(error);
        }
    })
        .catch(function (err) {
        next(err);
    });
}
//# sourceMappingURL=auth.js.map