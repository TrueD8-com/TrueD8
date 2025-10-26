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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.datingRoutes = void 0;
var express = __importStar(require("express"));
var mongoose = __importStar(require("mongoose"));
var response_1 = __importDefault(require("../middlewares/response"));
var auth_1 = require("../middlewares/auth");
var tryCatch_1 = __importDefault(require("../middlewares/tryCatch"));
var user_1 = require("../db/user");
var like_1 = require("../db/like");
var match_1 = require("../db/match");
var conversation_1 = require("../db/conversation");
var message_1 = require("../db/message");
var favorite_1 = require("../db/favorite");
var socket_1 = require("../api/socket");
exports.datingRoutes = express.Router();
// Like a user (mutual like => create match + conversation)
exports.datingRoutes.post('/like/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId, _a, user, target, reverse, match;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                if (!mongoose.Types.ObjectId.isValid(targetId)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'invalid target', {})];
                }
                if (String(userId) === String(targetId)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'cannot like self', {})];
                }
                return [4 /*yield*/, Promise.all([
                        user_1.User.findById(userId),
                        user_1.User.findById(targetId)
                    ])];
            case 1:
                _a = _d.sent(), user = _a[0], target = _a[1];
                if (!user || !target) {
                    return [2 /*return*/, (0, response_1.default)(res, 'user not found', {})];
                }
                if (user.blockedUsers && user.blockedUsers.includes(target._id)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'target blocked', {})];
                }
                return [4 /*yield*/, like_1.Like.updateOne({ liker: user._id, likee: target._id }, { $setOnInsert: { isSuperLike: false } }, { upsert: true })
                    // Check for mutual like
                ];
            case 2:
                _d.sent();
                return [4 /*yield*/, like_1.Like.findOne({ liker: target._id, likee: user._id })];
            case 3:
                reverse = _d.sent();
                if (!reverse) return [3 /*break*/, 7];
                return [4 /*yield*/, match_1.Match.findOneAndUpdate({ $or: [{ userA: user._id, userB: target._id }, { userA: target._id, userB: user._id }] }, { $setOnInsert: { userA: user._id, userB: target._id, isActive: true } }, // ⬅️ Added userA and userB here
                    { new: true, upsert: true })
                    // Create conversation if missing
                ];
            case 4:
                match = _d.sent();
                // Create conversation if missing
                return [4 /*yield*/, conversation_1.Conversation.findOneAndUpdate({ match: match._id }, { $setOnInsert: { participants: [user._id, target._id] } }, { new: true, upsert: true })];
            case 5:
                // Create conversation if missing
                _d.sent();
                return [4 /*yield*/, user_1.User.updateMany({ _id: { $in: [user._id, target._id] } }, { $inc: { 'metrics.matchesCount': 1 } })
                    // notify both users
                ];
            case 6:
                _d.sent();
                // notify both users
                (_b = (0, socket_1.getIo)()) === null || _b === void 0 ? void 0 : _b.to("user:".concat(user._id)).to("user:".concat(target._id)).emit('match:new', { matchId: match._id });
                return [2 /*return*/, (0, response_1.default)(res, 'matched', { matchId: match._id })];
            case 7: return [4 /*yield*/, user_1.User.updateOne({ _id: user._id }, { $inc: { 'metrics.likesSent': 1 } })];
            case 8:
                _d.sent();
                return [4 /*yield*/, user_1.User.updateOne({ _id: target._id }, { $inc: { 'metrics.likesReceived': 1 } })];
            case 9:
                _d.sent();
                (_c = (0, socket_1.getIo)()) === null || _c === void 0 ? void 0 : _c.to("user:".concat(target._id)).emit('like:received', { from: user._id });
                return [2 /*return*/, (0, response_1.default)(res, 'liked', {})];
        }
    });
}); }));
// Discover users (feed)
exports.datingRoutes.get('/discover', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, limit, skip, me, exclusions, likesSent, matches, likedIds, matchedIds, query, coords, maxMeters, fields, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                limit = Math.min(Number(req.query.limit) || 30, 100);
                skip = Math.max(Number(req.query.skip) || 0, 0);
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                me = _a.sent();
                if (!me)
                    return [2 /*return*/, (0, response_1.default)(res, '', [])];
                if (me.discovery && me.discovery.visible === false)
                    return [2 /*return*/, (0, response_1.default)(res, '', [])];
                exclusions = [me._id];
                if (Array.isArray(me.blockedUsers) && me.blockedUsers.length) {
                    exclusions.push.apply(exclusions, me.blockedUsers);
                }
                return [4 /*yield*/, like_1.Like.find({ liker: me._id }).select('likee')];
            case 2:
                likesSent = _a.sent();
                return [4 /*yield*/, match_1.Match.find({ $or: [{ userA: me._id }, { userB: me._id }], isActive: true }).select('userA userB')];
            case 3:
                matches = _a.sent();
                likedIds = likesSent.map(function (d) { return d.likee; });
                matchedIds = matches.map(function (m) { return String(m.userA) === String(me._id) ? m.userB : m.userA; });
                exclusions.push.apply(exclusions, __spreadArray(__spreadArray([], likedIds, false), matchedIds, false));
                query = { _id: { $nin: exclusions } };
                if (Array.isArray(me.showMe) && me.showMe.length) {
                    query.gender = { $in: me.showMe };
                }
                // Geo filter if we have location and discovery distance
                if (me.location && Array.isArray(me.location.coordinates) && me.discovery && me.discovery.distanceKm) {
                    coords = me.location.coordinates;
                    maxMeters = Math.max(1, Number(me.discovery.distanceKm)) * 1000;
                    query.location = {
                        $near: {
                            $geometry: { type: 'Point', coordinates: coords },
                            $maxDistance: maxMeters
                        }
                    };
                }
                fields = 'name lastName username gender bio interests photos location discovery premium verification metrics';
                return [4 /*yield*/, user_1.User.find(query).select(fields).skip(skip).limit(limit)];
            case 4:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
// AI matchmaking prompt - crafts a prompt payload from user profile + interactions
exports.datingRoutes.get('/ai/prompt', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, _a, likesSent, likesReceived, favorites, payload, prompt;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, (0, response_1.default)(res, 'not found', {})];
                return [4 /*yield*/, Promise.all([
                        like_1.Like.find({ liker: userId }).select('likee isSuperLike createdAt'),
                        like_1.Like.find({ likee: userId }).select('liker isSuperLike createdAt'),
                        favorite_1.Favorite.find({ user: userId }).select('target createdAt')
                    ])];
            case 2:
                _a = _b.sent(), likesSent = _a[0], likesReceived = _a[1], favorites = _a[2];
                payload = {
                    profile: {
                        username: user.username,
                        gender: user.gender,
                        showMe: user.showMe,
                        bio: user.bio,
                        interests: user.interests,
                        discovery: user.discovery,
                        location: user.location && user.location.coordinates ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] } : undefined
                    },
                    interactions: {
                        likesSent: likesSent.map(function (d) { return ({ targetId: d.likee, super: d.isSuperLike, at: d.createdAt }); }),
                        likesReceived: likesReceived.map(function (d) { return ({ fromId: d.liker, super: d.isSuperLike, at: d.createdAt }); }),
                        favorites: favorites.map(function (f) { return ({ targetId: f.target, at: f.createdAt }); })
                    },
                    metrics: user.metrics
                };
                prompt = {
                    system: 'You are an AI matchmaker optimizing for mutual compatibility and engagement.',
                    user_context: payload,
                    goal: 'Recommend top 10 candidate userIds to show next and key rationale tags.',
                    constraints: [
                        'Respect user showMe genders and discovery distance/age preferences',
                        'Dedupe already disliked or unmatched users',
                        'Prefer mutual or near-mutual engagement (likes received, common interests)'
                    ]
                };
                return [2 /*return*/, (0, response_1.default)(res, '', prompt)];
        }
    });
}); }));
// Superlike
exports.datingRoutes.post('/superlike/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                if (!mongoose.Types.ObjectId.isValid(targetId)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'invalid target', {})];
                }
                if (String(userId) === String(targetId)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'cannot like self', {})];
                }
                return [4 /*yield*/, like_1.Like.updateOne({ liker: userId, likee: targetId }, { $set: { isSuperLike: true } }, { upsert: true })];
            case 1:
                _b.sent();
                (_a = (0, socket_1.getIo)()) === null || _a === void 0 ? void 0 : _a.to("user:".concat(targetId)).emit('like:received', { from: userId, super: true });
                return [2 /*return*/, (0, response_1.default)(res, 'superliked', {})];
        }
    });
}); }));
// Undo like (only removes like, not match)
exports.datingRoutes.delete('/like/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                return [4 /*yield*/, like_1.Like.deleteOne({ liker: userId, likee: targetId })];
            case 1:
                _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, 'unliked', {})];
        }
    });
}); }));
// Get matches list
exports.datingRoutes.get('/matches', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, matches;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, match_1.Match.find({ $or: [{ userA: userId }, { userB: userId }], isActive: true })
                        .sort({ createdAt: -1 })];
            case 1:
                matches = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', matches)];
        }
    });
}); }));
// Unmatch
exports.datingRoutes.post('/unmatch/:matchId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, matchId, match;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                matchId = req.params.matchId;
                return [4 /*yield*/, match_1.Match.findById(matchId)];
            case 1:
                match = _b.sent();
                if (!match)
                    return [2 /*return*/, (0, response_1.default)(res, 'not found', {})];
                if (String(match.userA) !== String(userId) && String(match.userB) !== String(userId)) {
                    return [2 /*return*/, (0, response_1.default)(res, 'forbidden', {})];
                }
                match.isActive = false;
                match.unmatchedBy = userId;
                match.unmatchedAt = new Date();
                return [4 /*yield*/, match.save()];
            case 2:
                _b.sent();
                return [4 /*yield*/, conversation_1.Conversation.updateMany({ match: match._id }, { $set: { isArchived: true } })];
            case 3:
                _b.sent();
                (_a = (0, socket_1.getIo)()) === null || _a === void 0 ? void 0 : _a.to("user:".concat(match.userA)).to("user:".concat(match.userB)).emit('match:ended', { matchId: matchId });
                return [2 /*return*/, (0, response_1.default)(res, 'unmatched', {})];
        }
    });
}); }));
// Favorites
exports.datingRoutes.post('/favorites/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                return [4 /*yield*/, favorite_1.Favorite.updateOne({ user: userId, target: targetId }, { $setOnInsert: { user: userId, target: targetId } }, { upsert: true })];
            case 1:
                _b.sent();
                return [4 /*yield*/, user_1.User.updateOne({ _id: userId }, { $inc: { 'metrics.favoritesCount': 1 } })];
            case 2:
                _b.sent();
                (_a = (0, socket_1.getIo)()) === null || _a === void 0 ? void 0 : _a.to("user:".concat(targetId)).emit('favorite:received', { from: userId });
                return [2 /*return*/, (0, response_1.default)(res, 'favorited', {})];
        }
    });
}); }));
exports.datingRoutes.delete('/favorites/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId, result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                return [4 /*yield*/, favorite_1.Favorite.deleteOne({ user: userId, target: targetId })];
            case 1:
                result = _a.sent();
                if (!(result.deletedCount > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, user_1.User.updateOne({ _id: userId }, { $inc: { 'metrics.favoritesCount': -1 } })];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [2 /*return*/, (0, response_1.default)(res, 'unfavorited', {})];
        }
    });
}); }));
exports.datingRoutes.get('/favorites', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, favorite_1.Favorite.find({ user: userId }).sort({ createdAt: -1 })];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
// Likes analytics & lists
exports.datingRoutes.get('/likes/sent', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, like_1.Like.find({ liker: userId }).sort({ createdAt: -1 })];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
exports.datingRoutes.get('/likes/received', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, docs;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, like_1.Like.find({ likee: userId }).sort({ createdAt: -1 })];
            case 1:
                docs = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', docs)];
        }
    });
}); }));
exports.datingRoutes.get('/analytics/likes', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, sent, received;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, Promise.all([
                        like_1.Like.countDocuments({ liker: userId }),
                        like_1.Like.countDocuments({ likee: userId })
                    ])];
            case 1:
                _a = _b.sent(), sent = _a[0], received = _a[1];
                return [2 /*return*/, (0, response_1.default)(res, '', { sent: sent, received: received })];
        }
    });
}); }));
// Get conversations
exports.datingRoutes.get('/conversations', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, convos;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                return [4 /*yield*/, conversation_1.Conversation.find({ participants: userId, isArchived: { $ne: true } })
                        .sort({ lastMessageAt: -1 })];
            case 1:
                convos = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', convos)];
        }
    });
}); }));
// Get messages
exports.datingRoutes.get('/conversations/:conversationId/messages', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, conversationId, limit, before, convo, query, messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.session.userId;
                conversationId = req.params.conversationId;
                limit = Math.min(Number(req.query.limit) || 50, 200);
                before = req.query.before ? new Date(String(req.query.before)) : undefined;
                return [4 /*yield*/, conversation_1.Conversation.findOne({ _id: conversationId, participants: userId })];
            case 1:
                convo = _a.sent();
                if (!convo)
                    return [2 /*return*/, (0, response_1.default)(res, 'not found', [])];
                query = { conversation: convo._id };
                if (before)
                    query.sentAt = { $lt: before };
                return [4 /*yield*/, message_1.Message.find(query).sort({ sentAt: -1 }).limit(limit)];
            case 2:
                messages = _a.sent();
                return [2 /*return*/, (0, response_1.default)(res, '', messages)];
        }
    });
}); }));
// Send message
exports.datingRoutes.post('/conversations/:conversationId/messages', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, conversationId, _a, text, mediaUrl, type, convo, recipient, message;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                userId = req.session.userId;
                conversationId = req.params.conversationId;
                _a = req.body || {}, text = _a.text, mediaUrl = _a.mediaUrl, type = _a.type;
                return [4 /*yield*/, conversation_1.Conversation.findOne({ _id: conversationId, participants: userId })];
            case 1:
                convo = _c.sent();
                if (!convo)
                    return [2 /*return*/, (0, response_1.default)(res, 'not found', {})
                        // Infer recipient as the other participant
                    ];
                recipient = convo.participants.find(function (p) { return String(p) !== String(userId); });
                return [4 /*yield*/, message_1.Message.create({
                        conversation: convo._id,
                        sender: userId,
                        recipient: recipient,
                        type: type || (mediaUrl ? 'image' : 'text'),
                        text: text,
                        mediaUrl: mediaUrl,
                        isRead: false,
                        sentAt: new Date()
                    })];
            case 2:
                message = _c.sent();
                return [4 /*yield*/, conversation_1.Conversation.updateOne({ _id: convo._id }, { $set: { lastMessageAt: message.sentAt } })
                    // notify participants
                ];
            case 3:
                _c.sent();
                // notify participants
                (_b = (0, socket_1.getIo)()) === null || _b === void 0 ? void 0 : _b.to("conv:".concat(convo._id)).emit('message:new', { message: message });
                return [2 /*return*/, (0, response_1.default)(res, 'sent', message)];
        }
    });
}); }));
// Block user
exports.datingRoutes.post('/block/:targetId', auth_1.isAuthorized, (0, tryCatch_1.default)(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, targetId, user;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                userId = req.session.userId;
                targetId = req.params.targetId;
                return [4 /*yield*/, user_1.User.findById(userId)];
            case 1:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, (0, response_1.default)(res, 'not found', {})
                        // 1. Add to blocked list
                    ];
                // 1. Add to blocked list
                return [4 /*yield*/, user_1.User.updateOne({ _id: user._id }, { $addToSet: { blockedUsers: targetId } })
                    // 2. Comprehensive cleanup: likes, matches, and conversations
                ];
            case 2:
                // 1. Add to blocked list
                _b.sent();
                // 2. Comprehensive cleanup: likes, matches, and conversations
                return [4 /*yield*/, Promise.all([
                        // Delete mutual likes
                        like_1.Like.deleteMany({ $or: [{ liker: userId, likee: targetId }, { liker: targetId, likee: userId }] }),
                        // Deactivate matches and record who blocked whom
                        match_1.Match.updateMany({ $or: [{ userA: userId, userB: targetId }, { userA: targetId, userB: userId }] }, { $set: { isActive: false, unmatchedBy: userId, unmatchedAt: new Date() } } // ⬅️ ADDED unmatchedBy/At
                        ),
                        // Archive conversations related to the block
                        conversation_1.Conversation.updateMany(// ⬅️ ADDED CONVERSATION CLEANUP
                        { participants: { $all: [userId, targetId] }, isArchived: { $ne: true } }, { $set: { isArchived: true } })
                    ])
                    // Note: You may also want to emit a socket event for the block/unmatch
                ];
            case 3:
                // 2. Comprehensive cleanup: likes, matches, and conversations
                _b.sent();
                // Note: You may also want to emit a socket event for the block/unmatch
                (_a = (0, socket_1.getIo)()) === null || _a === void 0 ? void 0 : _a.to("user:".concat(targetId)).emit('user:blocked', { by: userId });
                return [2 /*return*/, (0, response_1.default)(res, 'blocked', {})];
        }
    });
}); }));
//# sourceMappingURL=dating.js.map