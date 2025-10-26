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
exports.adminDatingRoutes = void 0;
var express = __importStar(require("express"));
var mongoose = __importStar(require("mongoose"));
var response_1 = __importDefault(require("../middlewares/response"));
var tryCatch_1 = __importDefault(require("../middlewares/tryCatch"));
var auth_1 = require("../middlewares/auth");
var myError_1 = __importDefault(require("../api/myError"));
var user_1 = require("../db/user");
var like_1 = require("../db/like");
var favorite_1 = require("../db/favorite");
var match_1 = require("../db/match");
var conversation_1 = require("../db/conversation");
var message_1 = require("../db/message");
exports.adminDatingRoutes = express.Router();
// Users list
exports.adminDatingRoutes.get('/users', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, q, limit, skip, query, docs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, q = _a.q, limit = _a.limit, skip = _a.skip;
                query = {};
                if (q) {
                    query.$or = [
                        { username: new RegExp(q, 'i') },
                        { name: new RegExp(q, 'i') },
                        { lastName: new RegExp(q, 'i') },
                        { 'email.address': new RegExp(q, 'i') }
                    ];
                }
                return [4 /*yield*/, user_1.User.find(query).limit(Math.min(Number(limit) || 50, 200)).skip(Number(skip) || 0).sort({ createdAt: -1 })];
            case 1:
                docs = _b.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
// Ban / Unban
exports.adminDatingRoutes.post('/users/:userId/ban', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                if (!mongoose.Types.ObjectId.isValid(userId))
                    return [2 /*return*/, (0, response_1.default)(res, 'invalid user', {})];
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, next(new myError_1.default('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))];
                user.isActive = false;
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'banned')];
        }
    });
}); }));
exports.adminDatingRoutes.post('/users/:userId/unban', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                if (!mongoose.Types.ObjectId.isValid(userId))
                    return [2 /*return*/, (0, response_1.default)(res, 'invalid user', {})];
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, next(new myError_1.default('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))];
                user.isActive = true;
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'unbanned')];
        }
    });
}); }));
// Verify photo
exports.adminDatingRoutes.post('/users/:userId/verifyPhoto', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                if (!mongoose.Types.ObjectId.isValid(userId))
                    return [2 /*return*/, (0, response_1.default)(res, 'invalid user', {})];
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, next(new myError_1.default('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))];
                user.verification = user.verification || {};
                user.verification.photoVerified = true;
                user.verification.verifiedAt = new Date();
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'photo verified')];
        }
    });
}); }));
// Analytics overview
exports.adminDatingRoutes.get('/analytics/overview', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, users, likes, matches, messages, favorites;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    user_1.User.countDocuments({}),
                    like_1.Like.countDocuments({}),
                    match_1.Match.countDocuments({ isActive: true }),
                    message_1.Message.countDocuments({}),
                    favorite_1.Favorite.countDocuments({})
                ])];
            case 1:
                _a = _b.sent(), users = _a[0], likes = _a[1], matches = _a[2], messages = _a[3], favorites = _a[4];
                return [2 /*return*/, (0, response_1.default)(res, '', { users: users, likes: likes, matches: matches, messages: messages, favorites: favorites })];
        }
    });
}); }));
// Matches of a user
exports.adminDatingRoutes.get('/matches', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, filter, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.query.userId;
                filter = { isActive: true };
                if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                    filter.$or = [{ userA: userId }, { userB: userId }];
                }
                return [4 /*yield*/, match_1.Match.find(filter).sort({ createdAt: -1 })];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
// Archive conversation
exports.adminDatingRoutes.post('/conversations/:conversationId/archive', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var conversationId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                conversationId = req.params.conversationId;
                return [4 /*yield*/, conversation_1.Conversation.updateOne({ _id: conversationId }, { $set: { isArchived: true } })];
            case 1:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'archived')];
        }
    });
}); }));
// Delete a message
exports.adminDatingRoutes.delete('/messages/:messageId', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var messageId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                messageId = req.params.messageId;
                return [4 /*yield*/, message_1.Message.deleteOne({ _id: messageId })];
            case 1:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'deleted')];
        }
    });
}); }));
// Likes and favorites lists for a user
exports.adminDatingRoutes.get('/likes', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, type, filter, docs;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.query, userId = _a.userId, type = _a.type;
                filter = {};
                if (userId && mongoose.Types.ObjectId.isValid(userId)) {
                    if (type === 'sent')
                        filter.liker = userId;
                    else if (type === 'received')
                        filter.likee = userId;
                    else
                        filter.$or = [{ liker: userId }, { likee: userId }];
                }
                return [4 /*yield*/, like_1.Like.find(filter).sort({ createdAt: -1 })];
            case 1:
                docs = _b.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
exports.adminDatingRoutes.get('/favorites', auth_1.isAdmin, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, filter, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.query.userId;
                filter = {};
                if (userId && mongoose.Types.ObjectId.isValid(userId))
                    filter.user = userId;
                return [4 /*yield*/, favorite_1.Favorite.find(filter).sort({ createdAt: -1 })];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
//# sourceMappingURL=admin.dating.js.map