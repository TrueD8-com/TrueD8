// // import * as scocketIo from 'socket.io'
// const io = require('socket.io');
// import { createClient } from 'redis';

// const redisIoAdapter = require('socket.io-redis');
// var client = createClient({ url: process.env.REDIS_HOST });
// import { logger } from './logger';

// let onlineLoginUsers = null;

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

// export const getonlineLoginUsers = () => {
//   return onlineLoginUsers;
// };

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

