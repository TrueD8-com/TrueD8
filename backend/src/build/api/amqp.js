'use strict';
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishQueueConnection = void 0;
// This script fetches queued messages from RabbitMQ and delivers these to SMTP
var nodemailer = __importStar(require("nodemailer"));
var amqp = __importStar(require("amqp"));
var queueHost = process.env.AMQP_URL;
var queueName = 'outgoing';
var smtpHost = {
    host: process.env.NODEMAILER_HOST,
    port: process.env.NODEMAILER_PORT,
    // NB! Must be pooled connection, otherwise 'idle' is never fired and nothing gets sent
    pool: true,
    auth: {
        user: "subscription@najmatalrraad.com",
        pass: "PiehC49cunif"
    },
    tls: {
        // testserver uses self signed certificate, so we need to lax a bit
        rejectUnauthorized: false
    },
    logger: false
};
// array of prefetched messages waiting for delivery
var waiting = [];
// Create a SMTP transporter object
var transporter = nodemailer.createTransport(smtpHost, {
    // default message fields
    from: process.env.SENDER_ADDRESS
});
// Create connection to RabbitMQ
var queueConnection = amqp.createConnection({
    url: queueHost
});
queueConnection.on('error', function (e) {
    console.log('Error from amqp: ', e);
});
queueConnection.on('ready', function (err) {
    console.log('AMPQ server is running on port 5672.');
    queueConnection.queue(queueName, { durable: true }, function (q) {
        q.bind('#');
        q.subscribe({
            ack: true, // do not fetch next messages until previous are acked
            prefetchCount: 10 // prefetch 10 messages
        }, function (message, headers, deliveryInfo, ack) {
            // check if the message object is even valid
            if (!message || !message.to) {
                console.log('Invalid message, skipping');
                // reject, do not requeue
                return ack.reject();
            }
            // push to cache
            waiting.push({
                message: message,
                deliveryTag: deliveryInfo.deliveryTag.toString('hex'),
                ack: ack
            });
            // try to flush cached messages by sending these to SMTP
            flushWaitingMessages();
        });
    });
});
// Whenever transporter gets into idling, try to send some mail
transporter.on('idle', flushWaitingMessages);
// Flushes cached messages to nodemailer for delivery
function flushWaitingMessages() {
    // actual send function
    var send = function (data) {
        // sendMail does not immediatelly send, instead it tries to allocate a free connection to SMTP server
        // and if fails, then pushes the message into internal queue. As we only prefetch 10 messages
        // then the internal queue can never grow into something too large. At most there will be 5 messages
        // idling in the queue (another 5 are being currently sent by the default number of 5 connections)
        transporter.sendMail(data.message, function (err, info) {
            if (err) {
                //    console.log('Message failed (%s): %s', data.deliveryTag, err.message)
                // reject and requeue on error (wait 1 sec. before requeueing)
                // NB! If the failure is permanent then this approach results in an
                // infinite loop since failing message is never removed from the queue
                setTimeout(function () {
                    data.ack.reject(true);
                }, 1000);
                return;
            }
            console.log('Message delivered (%s): %s', data.deliveryTag, info.response);
            data.ack.acknowledge();
        });
    };
    // send cached messages if transporter is idling
    while (transporter.isIdle() && waiting.length) {
        send(waiting.shift());
    }
}
var publishQueueConnection = function (mailOptions) {
    console.log('publishQueueConnection');
    queueConnection.publish(queueName, mailOptions, function (err) {
        if (err) {
            console.log(err);
        }
    });
};
exports.publishQueueConnection = publishQueueConnection;
//# sourceMappingURL=amqp.js.map