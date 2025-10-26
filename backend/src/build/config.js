"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trudeskApi = exports.client = void 0;
var redis_1 = require("redis");
exports.client = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
});
var dev = process.env.NODE_ENV !== 'production';
exports.trudeskApi = dev ? 'http://localhost:8119' : 'http://localhost:8119';
//# sourceMappingURL=config.js.map