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
exports.userRoutes = void 0;
var express = __importStar(require("express"));
var fs = __importStar(require("fs"));
var fs_1 = require("fs");
var response_1 = __importDefault(require("../middlewares/response"));
var auth_1 = require("../middlewares/auth");
var tryCatch_1 = __importDefault(require("../middlewares/tryCatch"));
var user_1 = require("../db/user");
var logger_1 = require("../api/logger");
var myError_1 = __importDefault(require("../api/myError"));
var upload_1 = require("../middlewares/upload");
exports.userRoutes = express.Router();
var profileEditableFields = ['name', 'lastName', 'email', 'phoneNumber', 'username', 'bio', 'gender', 'showMe', 'interests', 'discovery', 'birthdate'];
exports.userRoutes.post('/changePassword', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var password = req.body.password;
    var newPassword = req.body.newPassword;
    if (!password || !newPassword) {
        var error = new myError_1.default('Invalid payload', 400, 12, 'داده نامعتبر است', 'خطا رخ داد');
        return next(error);
    }
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (user && user._id.toString() === userId) {
            return user.comparePasswordPromise(password)
                .then(function (isMatch) {
                if (isMatch) {
                    user.password = newPassword;
                    return user.save()
                        .then(function () {
                        (0, response_1.default)(res, 'password is successfuly changed');
                    });
                }
                else {
                    var error = new myError_1.default('Wrong password', 400, 13, 'رمز عبور اشتباه است', 'خطا رخ داد');
                    next(error);
                }
            });
        }
        else {
            var error = new myError_1.default('The user does not exist!', 400, 25, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد');
            next(error);
        }
    })
        .catch(function (err) { return next(err); });
}));
exports.userRoutes.get('/getUserProfileInfo', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (user && user._id.toString() === userId) {
            var body = {
                name: user.name,
                lastName: user.lastName,
                username: user.username,
                userType: user.userType,
                email: user.email && user.email.validated ? user.email.address : undefined,
                phoneNumber: user.phoneNumber && user.phoneNumber.validated ? user.phoneNumber.number : undefined,
                address: user.address,
                birthdate: user.birthdate,
                gender: user.gender,
                showMe: user.showMe,
                bio: user.bio,
                interests: user.interests,
                photos: user.photos,
                discovery: user.discovery,
                location: user.location,
                premium: user.premium,
                verification: user.verification,
                onboardingCompleted: user.onboardingCompleted,
                metrics: user.metrics
            };
            (0, response_1.default)(res, '', body);
        }
        else {
            logger_1.logger.warn('The user does not exist!');
            var error = new myError_1.default('The user does not exist!', 400, 25, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد');
            next(error);
        }
    })
        .catch(function (err) { return next(err); });
}));
exports.userRoutes.post('/editProfile', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var body = {
        name: req.body.profileName,
        lastName: req.body.profileLastName,
        username: req.body.profileUsername,
        birthdate: req.body.profileBirthdate,
        phoneNumber: req.body.profilePhoneNumber,
        bio: req.body.profileBio,
        gender: req.body.profileGender,
        showMe: req.body.profileShowMe,
        interests: req.body.profileInterests,
        discovery: {
            distanceKm: req.body.discoveryDistanceKm,
            ageMin: req.body.discoveryAgeMin,
            ageMax: req.body.discoveryAgeMax,
            visible: req.body.discoveryVisible,
            global: req.body.discoveryGlobal
        }
    };
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (user && user._id.toString() === userId) {
            Object.keys(body).forEach(function (element) {
                if (body["".concat(element)]) {
                    if (profileEditableFields.includes(element)) {
                        if (element === 'phoneNumber') {
                            user.phoneNumber['number'] = body["".concat(element)];
                        }
                        else if (element === 'discovery') {
                            var d_1 = body["".concat(element)];
                            Object.keys(d_1).forEach(function (k) {
                                if (d_1[k] !== undefined && d_1[k] !== null) {
                                    user.discovery[k] = d_1[k];
                                }
                            });
                        }
                        else {
                            user["".concat(element)] = body["".concat(element)];
                        }
                    }
                    else {
                        logger_1.logger.warn('Some fields are not existed or valid.');
                        var error = new myError_1.default('Some fields are not existed or valid.', 400, 1, 'خطا رخ داد', 'خطا رخ داد');
                        next(error);
                    }
                }
            });
            return user.save()
                .then(function () {
                var result = {
                    name: user.name,
                    lastName: user.lastName,
                    mobilePhobne: user.mobilePhobne
                };
                (0, response_1.default)(res, 'The data is chenged successfully!', result);
            })
                .catch(function (err) {
                var message = err.message ? err.message : err;
                logger_1.logger.error(message);
                next(err);
            });
        }
        else {
            logger_1.logger.warn('The user does not exist!');
            var error = new myError_1.default('The user does not exist!', 400, 1, 'چنین مدیری در سامانه ثبت نشده است!', 'خطا رخ داد');
            next(error);
        }
    })
        .catch(function (err) { return next(err); });
}));
exports.userRoutes.post('/setNewAddress', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var province = req.body.provinceOp;
    var city = req.body.cityOp;
    var postalCode = req.body.postalCodeOp;
    var address = req.body.addressOp;
    var district = req.body.districtOp;
    var phone = req.body.phoneOp;
    var coordinates = req.body.coordinates;
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (user && user._id.toString() === userId) {
            if (user.address) {
                var theAddress = {
                    province: province ? province : user.address.province,
                    city: city ? city : user.address.city,
                    postalCode: postalCode ? postalCode : user.address.postalCode,
                    address: address ? address : user.address.address,
                    district: district ? district : user.address.district,
                    phone: phone ? phone : user.address.phone,
                };
                user.address = theAddress;
                if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
                    user.location = {
                        type: 'Point',
                        coordinates: coordinates,
                        updatedAt: new Date()
                    };
                }
                return user.save()
                    .then(function () {
                    (0, response_1.default)(res, '', user.address);
                })
                    .catch(function (err) { return next(err); });
            }
            else {
                if (province && city && postalCode && address) {
                    var theAddress = {
                        province: province,
                        city: city,
                        postalCode: postalCode,
                        address: address,
                        district: district,
                        phone: phone,
                    };
                    user.address = theAddress;
                    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
                        user.location = {
                            type: 'Point',
                            coordinates: coordinates,
                            updatedAt: new Date()
                        };
                    }
                    return user.save()
                        .then(function () {
                        (0, response_1.default)(res, '', user.address);
                    })
                        .catch(function (err) { return next(err); });
                }
                else {
                    var error = new myError_1.default('Invalid address data', 400, 1, 'خطا رخ داد', 'خطا رخ داد');
                    next(error);
                }
            }
        }
        else {
            var error = new myError_1.default('The user does not exist!', 400, 1, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد');
            next(error);
        }
    })
        .catch(function (err) { return next(err); });
}));
// Photos upload (temp)
exports.userRoutes.post('/photos/upload', auth_1.isAuthorized, upload_1.uploadTemp, (0, tryCatch_1.default)(function (req, res, next) {
    if (!req.file) {
        var error = new myError_1.default('There is no image!', 400, 11, 'هیچ عکسی بارگذاری نشده است!', 'خطا رخ داد');
        return next(error);
    }
    var imagePath = req.file.filename.split('.')[0];
    var imageExt = req.file.filename.split('.')[1];
    return (0, response_1.default)(res, '', { imagePath: imagePath, imageExt: imageExt });
}));
// Commit temp photo to user profile
exports.userRoutes.post('/photos/add', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, imageName, isPrimary, error, tempPath, error, userDir, finalPath, file;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                _a = req.body || {}, imageName = _a.imageName, isPrimary = _a.isPrimary;
                if (!imageName) {
                    error = new myError_1.default('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد');
                    return [2 /*return*/, next(error)];
                }
                tempPath = "./images/temp/".concat(imageName);
                if (!fs.existsSync(tempPath)) {
                    error = new myError_1.default('Temp image not found', 400, 11, 'تصویر یافت نشد', 'خطا رخ داد');
                    return [2 /*return*/, next(error)];
                }
                userDir = "./images/users/".concat(userId);
                if (!fs.existsSync(userDir)) {
                    fs.mkdirSync(userDir, { recursive: true });
                }
                finalPath = "".concat(userDir, "/").concat(imageName);
                return [4 /*yield*/, fs_1.promises.readFile(tempPath)];
            case 1:
                file = _b.sent();
                return [4 /*yield*/, fs_1.promises.writeFile(finalPath, file)];
            case 2:
                _b.sent();
                fs.unlink(tempPath, function () { });
                return [2 /*return*/, user_1.User.findOne({ _id: userId })
                        .then(function (user) {
                        if (!user) {
                            var error = new myError_1.default('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد');
                            return next(error);
                        }
                        var url = "/users/".concat(userId, "/").concat(imageName);
                        var photoDoc = { url: url, isPrimary: !!isPrimary, uploadedAt: new Date() };
                        if (isPrimary) {
                            if (Array.isArray(user.photos)) {
                                user.photos = user.photos.map(function (p) { return (__assign(__assign({}, p), { isPrimary: false })); });
                            }
                        }
                        if (!Array.isArray(user.photos))
                            user.photos = [];
                        user.photos.push(photoDoc);
                        return user.save()
                            .then(function () { return (0, response_1.default)(res, 'photo added', photoDoc); });
                    })
                        .catch(function (err) { return next(err); })];
        }
    });
}); }));
exports.userRoutes.post('/photos/setPrimary', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var url = (req.body || {}).url;
    if (!url) {
        var error = new myError_1.default('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد');
        return next(error);
    }
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (!user) {
            var error = new myError_1.default('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد');
            return next(error);
        }
        if (!Array.isArray(user.photos))
            user.photos = [];
        user.photos = user.photos.map(function (p) { return (__assign(__assign({}, p), { isPrimary: p.url === url })); });
        return user.save().then(function () { return (0, response_1.default)(res, 'primary set'); });
    })
        .catch(function (err) { return next(err); });
}));
exports.userRoutes.post('/photos/remove', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, url, error, filename, filePath;
    return __generator(this, function (_a) {
        userId = req.session.userId;
        url = (req.body || {}).url;
        if (!url) {
            error = new myError_1.default('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد');
            return [2 /*return*/, next(error)];
        }
        filename = url.split('/').pop();
        filePath = "./images/users/".concat(userId, "/").concat(filename);
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, function () { });
        }
        return [2 /*return*/, user_1.User.findOne({ _id: userId })
                .then(function (user) {
                if (!user) {
                    var error = new myError_1.default('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد');
                    return next(error);
                }
                if (!Array.isArray(user.photos))
                    user.photos = [];
                user.photos = user.photos.filter(function (p) { return p.url !== url; });
                return user.save().then(function () { return (0, response_1.default)(res, 'photo removed'); });
            })
                .catch(function (err) { return next(err); })];
    });
}); }));
// Wallet connect/disconnect
exports.userRoutes.post('/wallet/connect', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    var _a = req.body || {}, provider = _a.provider, address = _a.address;
    if (!address) {
        var error = new myError_1.default('Invalid wallet', 400, 1, 'کیف پول نامعتبر است', 'خطا رخ داد');
        return next(error);
    }
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (!user) {
            var error = new myError_1.default('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد');
            return next(error);
        }
        user.wallet = { provider: provider, address: address, connectedAt: new Date() };
        return user.save().then(function () { return (0, response_1.default)(res, 'wallet connected', user.wallet); });
    })
        .catch(function (err) { return next(err); });
}));
exports.userRoutes.post('/wallet/disconnect', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res, next) {
    var userId = req.session.userId;
    return user_1.User.findOne({ _id: userId })
        .then(function (user) {
        if (!user) {
            var error = new myError_1.default('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد');
            return next(error);
        }
        user.wallet = undefined;
        return user.save().then(function () { return (0, response_1.default)(res, 'wallet disconnected'); });
    })
        .catch(function (err) { return next(err); });
}));
//# sourceMappingURL=user.dating.js.map