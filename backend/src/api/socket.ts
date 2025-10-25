import { Server } from "socket.io";
import * as mongoose from "mongoose";
import { User } from "../db/user";
import { Conversation } from "../db/conversation";
import { Message } from "../db/message";
import { Match } from "../db/match";
import { logger } from "./logger";

let io: Server;

export const startIo = (server: any, sessionMiddleware: any) => {
  const sharedsession = require("express-socket.io-session");
  io = new Server(server, {
    serveClient: false,
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(sharedsession(sessionMiddleware, { autoSave: true }));

  io.on("connection", (socket) => {
    try {
      const sess = (socket as any).handshake.session;
      const userId = sess && sess.userId;
      if (!userId) {
        socket.disconnect(true);
        return;
      }

      socket.join(`user:${userId}`);
      logger.info(`socket connected ${socket.id} for user ${userId}`);

      socket.on("join:conversation", async (payload: any = {}) => {
        try {
          const { conversationId } = payload;
          if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
          const convo = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });
          if (!convo) return;
          socket.join(`conv:${convo._id}`);
          socket.emit("join:conversation:ok", {
            conversationId: String(convo._id),
          });
        } catch (err) {
          logger.warn(err);
        }
      });

      socket.on("message:send", async (payload: any = {}) => {
        try {
          const { conversationId, text, mediaUrl, type } = payload;
          if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
          const convo = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });
          if (!convo) return;
          const recipient = (convo.participants as any[]).find(
            (p) => String(p) !== String(userId)
          );
          const message = await Message.create({
            conversation: convo._id,
            sender: userId,
            recipient,
            type: type || (mediaUrl ? "image" : "text"),
            text,
            mediaUrl,
            isRead: false,
            sentAt: new Date(),
          });
          await Conversation.updateOne(
            { _id: convo._id },
            { $set: { lastMessageAt: message.sentAt } }
          );
          io.to(`conv:${convo._id}`).emit("message:new", { message });
        } catch (err) {
          logger.warn(err);
        }
      });

      socket.on("message:read", async (payload: any = {}) => {
        try {
          const { conversationId, messageIds } = payload;
          if (
            !mongoose.Types.ObjectId.isValid(conversationId) ||
            !Array.isArray(messageIds)
          )
            return;
          const convo = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });
          if (!convo) return;
          const now = new Date();
          await Message.updateMany(
            {
              _id: { $in: messageIds },
              conversation: convo._id,
              recipient: userId,
              isRead: { $ne: true },
            },
            { $set: { isRead: true, readAt: now } }
          );
          io.to(`conv:${convo._id}`).emit("message:read", {
            conversationId,
            messageIds,
            readAt: now,
          });
        } catch (err) {
          logger.warn(err);
        }
      });

      socket.on("typing", async (payload: any = {}) => {
        try {
          const { conversationId, isTyping } = payload;
          if (!mongoose.Types.ObjectId.isValid(conversationId)) return;
          const convo = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
          });
          if (!convo) return;
          socket
            .to(`conv:${convo._id}`)
            .emit("typing", { conversationId, userId, isTyping: !!isTyping });
        } catch (err) {
          logger.warn(err);
        }
      });

      socket.on("disconnect", () => {
        logger.info(`socket disconnected ${socket.id} for user ${userId}`);
      });
    } catch (err) {
      logger.warn(err);
    }
  });

  return io;
};

export const getIo = () => io;

// // import * as scocketIo from 'socket.io'
// const io = require('socket.io');
// import { createClient } from 'redis';

// const redisIoAdapter = require('socket.io-redis');
// var client = createClient({ url: process.env.REDIS_HOST });
// import { logger } from './logger';

let onlineLoginUsers = null;

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

export const getonlineLoginUsers = () => {
  return onlineLoginUsers;
};

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
