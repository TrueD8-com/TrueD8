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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getonlineLoginUsers = exports.getIo = exports.startIo = void 0;
var socket_io_1 = require("socket.io");
var mongoose = __importStar(require("mongoose"));
var conversation_1 = require("../db/conversation");
var message_1 = require("../db/message");
var logger_1 = require("./logger");
var io;
var startIo = function (server, sessionMiddleware) {
    var sharedsession = require("express-socket.io-session");
    io = new socket_io_1.Server(server, {
        serveClient: false,
        cors: {
            origin: "*",
            credentials: true,
        },
    });
    io.use(sharedsession(sessionMiddleware, { autoSave: true }));
    io.on("connection", function (socket) {
        try {
            var sess = socket.handshake.session;
            var userId_1 = sess && sess.userId;
            if (!userId_1) {
                socket.disconnect(true);
                return;
            }
            socket.join("user:".concat(userId_1));
            logger_1.logger.info("socket connected ".concat(socket.id, " for user ").concat(userId_1));
            socket.on("join:conversation", function () {
                var args_1 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args_1[_i] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (payload) {
                    var conversationId, convo, err_1;
                    if (payload === void 0) { payload = {}; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                conversationId = payload.conversationId;
                                if (!mongoose.Types.ObjectId.isValid(conversationId))
                                    return [2 /*return*/];
                                return [4 /*yield*/, conversation_1.Conversation.findOne({
                                        _id: conversationId,
                                        participants: userId_1,
                                    })];
                            case 1:
                                convo = _a.sent();
                                if (!convo)
                                    return [2 /*return*/];
                                socket.join("conv:".concat(convo._id));
                                socket.emit("join:conversation:ok", {
                                    conversationId: String(convo._id),
                                });
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _a.sent();
                                logger_1.logger.warn(err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            });
            socket.on("message:send", function () {
                var args_1 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args_1[_i] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (payload) {
                    var conversationId, text, mediaUrl, type, convo, recipient, message, err_2;
                    if (payload === void 0) { payload = {}; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 4, , 5]);
                                conversationId = payload.conversationId, text = payload.text, mediaUrl = payload.mediaUrl, type = payload.type;
                                if (!mongoose.Types.ObjectId.isValid(conversationId))
                                    return [2 /*return*/];
                                return [4 /*yield*/, conversation_1.Conversation.findOne({
                                        _id: conversationId,
                                        participants: userId_1,
                                    })];
                            case 1:
                                convo = _a.sent();
                                if (!convo)
                                    return [2 /*return*/];
                                recipient = convo.participants.find(function (p) { return String(p) !== String(userId_1); });
                                return [4 /*yield*/, message_1.Message.create({
                                        conversation: convo._id,
                                        sender: userId_1,
                                        recipient: recipient,
                                        type: type || (mediaUrl ? "image" : "text"),
                                        text: text,
                                        mediaUrl: mediaUrl,
                                        isRead: false,
                                        sentAt: new Date(),
                                    })];
                            case 2:
                                message = _a.sent();
                                return [4 /*yield*/, conversation_1.Conversation.updateOne({ _id: convo._id }, { $set: { lastMessageAt: message.sentAt } })];
                            case 3:
                                _a.sent();
                                io.to("conv:".concat(convo._id)).emit("message:new", { message: message });
                                return [3 /*break*/, 5];
                            case 4:
                                err_2 = _a.sent();
                                logger_1.logger.warn(err_2);
                                return [3 /*break*/, 5];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            });
            socket.on("message:read", function () {
                var args_1 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args_1[_i] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (payload) {
                    var conversationId, messageIds, convo, now, err_3;
                    if (payload === void 0) { payload = {}; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                conversationId = payload.conversationId, messageIds = payload.messageIds;
                                if (!mongoose.Types.ObjectId.isValid(conversationId) ||
                                    !Array.isArray(messageIds))
                                    return [2 /*return*/];
                                return [4 /*yield*/, conversation_1.Conversation.findOne({
                                        _id: conversationId,
                                        participants: userId_1,
                                    })];
                            case 1:
                                convo = _a.sent();
                                if (!convo)
                                    return [2 /*return*/];
                                now = new Date();
                                return [4 /*yield*/, message_1.Message.updateMany({
                                        _id: { $in: messageIds },
                                        conversation: convo._id,
                                        recipient: userId_1,
                                        isRead: { $ne: true },
                                    }, { $set: { isRead: true, readAt: now } })];
                            case 2:
                                _a.sent();
                                io.to("conv:".concat(convo._id)).emit("message:read", {
                                    conversationId: conversationId,
                                    messageIds: messageIds,
                                    readAt: now,
                                });
                                return [3 /*break*/, 4];
                            case 3:
                                err_3 = _a.sent();
                                logger_1.logger.warn(err_3);
                                return [3 /*break*/, 4];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            });
            socket.on("typing", function () {
                var args_1 = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args_1[_i] = arguments[_i];
                }
                return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (payload) {
                    var conversationId, isTyping, convo, err_4;
                    if (payload === void 0) { payload = {}; }
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                conversationId = payload.conversationId, isTyping = payload.isTyping;
                                if (!mongoose.Types.ObjectId.isValid(conversationId))
                                    return [2 /*return*/];
                                return [4 /*yield*/, conversation_1.Conversation.findOne({
                                        _id: conversationId,
                                        participants: userId_1,
                                    })];
                            case 1:
                                convo = _a.sent();
                                if (!convo)
                                    return [2 /*return*/];
                                socket
                                    .to("conv:".concat(convo._id))
                                    .emit("typing", { conversationId: conversationId, userId: userId_1, isTyping: !!isTyping });
                                return [3 /*break*/, 3];
                            case 2:
                                err_4 = _a.sent();
                                logger_1.logger.warn(err_4);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            });
            socket.on("disconnect", function () {
                logger_1.logger.info("socket disconnected ".concat(socket.id, " for user ").concat(userId_1));
            });
        }
        catch (err) {
            logger_1.logger.warn(err);
        }
    });
    return io;
};
exports.startIo = startIo;
var getIo = function () { return io; };
exports.getIo = getIo;
// // import * as scocketIo from 'socket.io'
// const io = require('socket.io');
// import { createClient } from 'redis';
// const redisIoAdapter = require('socket.io-redis');
// var client = createClient({ url: process.env.REDIS_HOST });
// import { logger } from './logger';
var onlineLoginUsers = null;
// let onlineAdmins = null;
// let onlineNotLoginUsers = null;
// export const startIo = (server) => {
//   const sio = io(server, {
//     serveClient: false,
//     withCredentials: true,
//     cors: {
//       origin: '*',
//     },
//   });
//   sio.adapter(redisIoAdapter({ host: 'localhost', port: 6379 }));
//   onlineLoginUsers = sio.of('/onlineLoginUsers');
//   onlineAdmins = sio.of('/onlineAdmins');
//   onlineNotLoginUsers = sio.of('/onlineNotLoginUsers');
//   onlineAdmins.on('connection', function (socket) {
//     try {
//       if (socket.handshake.session.adminId) {
//         client.sadd(socket.handshake.session.adminId, socket.id, (err, reply) => {
//           if (err) logger.warn(err);
//         });
//         socket.on('disconnect', () => {
//           client.srem(socket.handshake.session.adminId, socket.id, (err, reply) => {
//             if (err) logger.warn(err);
//           });
//         });
//       }
//       console.log(
//         `Client connected in onlineAdmins [id=${socket.id},socket.handshake.session.userId =${socket.handshake.session.adminId} ]`,
//       );
//       logger.info(
//         `Client connected in onlineAdmins [id=${socket.id},socket.handshake.session.userId =${socket.handshake.session.adminId} ]`,
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   });
//   onlineLoginUsers.on('connection', function (socket) {
//     try {
//       if (socket.handshake.session.userId) {
//         console.log("adddddddddddddddddddddddding",socket.handshake.session.userId)
//         client.sadd(socket.id ,socket.handshake.session.userId , (err, reply) => {
//          // console.log("the err was",err, "the reply was",reply)
//           if (err) logger.warn(err);
//         });
//         socket.on('disconnect', () => {
//           client.srem(socket.id, socket.handshake.session.userId,  (err, reply) => {
//             if (err) logger.warn(err);
//           });
//         });
//       }
//       console.log(
//         `Client connected in onlineLoginUsers [id=${socket.id},socket.handshake.session.userId =${socket.handshake.session.userId} ]`,
//       );
//       logger.info(
//         `Client connected in onlineLoginUsers [id=${socket.id},socket.handshake.session.userId =${socket.handshake.session.userId} ]`,
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   });
//   onlineNotLoginUsers.on('connection', function (socket) {
//     try {
//       logger.info(
//         `Client connected in onlineNotLoginUsers [id=${socket.id},`,
//       );
//     } catch (err) {
//       console.log(err);
//     }
//   });
// };
var getonlineLoginUsers = function () {
    return onlineLoginUsers;
};
exports.getonlineLoginUsers = getonlineLoginUsers;
// export const getonlineNotLoginUsers = () => {
//   return onlineNotLoginUsers;
// };
// export const getonlineAdmins = () => {
//   return onlineAdmins;
// };
// export const getAllOnlineSocketIds = () => {
//   return new Promise((resolve, reject) => {
//     onlineLoginUsers.adapter.clients((err, clients) => {
//       if (err) {
//         reject(err);
//       } else {
//         // console.log("clientsssss",clients)
//         // console.log("firstone",clients[0])
//         resolve(clients);
//       }
//     });
//   });
// };
// export const getAllAdminSocketIds = () => {
//   return new Promise((resolve, reject) => {
//     onlineAdmins.adapter.clients((err, clients) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(clients);
//       }
//     });
//   });
// };
//# sourceMappingURL=socket.js.map