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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerStream = exports.logger = void 0;
var winston = __importStar(require("winston"));
var _a = winston.format, combine = _a.combine, timestamp = _a.timestamp, label = _a.label, prettyPrint = _a.prettyPrint, colorize = _a.colorize, json = _a.json, splat = _a.splat;
/// /////////////////////////////////////////////////////////////////////////////
/// ///////////////////////Winston Logger///////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////
exports.logger = winston.createLogger({
    exitOnError: false,
    format: combine(timestamp(), prettyPrint(), colorize(), splat()),
    level: 'info',
    // format: winston.format.json(),
    // defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'exceptions.log' })
    ]
});
// if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
exports.logger.add(new winston.transports.Console({
    format: winston.format.simple()
}));
// }
// logger.stream = {
//   write: function (message: string, encoding: any) {
//     logger.info(message)
//   }
// }
var LoggerStream = /** @class */ (function () {
    function LoggerStream() {
    }
    LoggerStream.prototype.write = function (message) {
        exports.logger.info(message);
    };
    return LoggerStream;
}());
exports.LoggerStream = LoggerStream;
//module.exports = logger
//# sourceMappingURL=logger.js.map