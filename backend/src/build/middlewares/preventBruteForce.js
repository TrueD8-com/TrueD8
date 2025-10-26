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
exports.rateLimiterMiddleware = exports.globalRedisClient = void 0;
exports.preventBruteForce = preventBruteForce;
var myError_1 = __importDefault(require("../api/myError"));
var rateLimiteFlexible = __importStar(require("rate-limiter-flexible"));
var redis_1 = require("redis");
exports.globalRedisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_HOST,
    disableOfflineQueue: true,
});
exports.globalRedisClient.on('connect', function (err) {
    console.log('Redis-server is connected');
});
exports.globalRedisClient.on('error', function (err) {
    console.log('Error ' + err);
});
var RateLimiterRedis = rateLimiteFlexible.RateLimiterRedis;
// const maxWrongAttemptsByIPperDay = 100
// const maxConsecutiveFailsByUsernameAndIP = 5
var maxWrongAttemptsByIPperDay = 99999999;
var maxConsecutiveFailsByUsernameAndIP = 99999;
var rateLimiterRedis = new RateLimiterRedis({
    storeClient: exports.globalRedisClient,
    points: maxWrongAttemptsByIPperDay, // Number of points
    duration: 1000, // Per second,
    blockDuration: 60 * 60, // Per second
});
var rateLimiterMiddleware = function (req, res, next) {
    // rateLimiterRedis
    //   .consume(req.ip)
    //   .then(() => {
    next();
    // })
    // .catch((err) => {
    //   err.statusCode = 429;
    //   err.clientCode = 11;
    //   err.clientMessage = 'درخواست بیش از حد انجام داده اید! بعد از یک ساعت دیگر دوباره اقدام بفرمایید!';
    //   err.messageEnglish = 'Too Many Requests';
    //   next(err);
    // });
};
exports.rateLimiterMiddleware = rateLimiterMiddleware;
var limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: exports.globalRedisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});
var limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
    storeClient: exports.globalRedisClient,
    keyPrefix: 'login_fail_consecutive_username_and_ip',
    points: maxConsecutiveFailsByUsernameAndIP,
    duration: 60 * 60, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
});
var getUsernameIPkey = function (username, ip) { return "".concat(username, "_").concat(ip); };
function preventBruteForce(req, res, next) {
    return __awaiter(this, void 0, void 0, function () {
        var ipAddr, usernameIPkey, _a, resUsernameAndIP, resSlowByIP, retrySecs, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ipAddr = req.ip;
                    usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);
                    return [4 /*yield*/, Promise.all([
                            limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
                            limiterSlowBruteByIP.get(ipAddr),
                        ])];
                case 1:
                    _a = _b.sent(), resUsernameAndIP = _a[0], resSlowByIP = _a[1];
                    retrySecs = 0;
                    // Check if IP or Username + IP is already blocked
                    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
                        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
                    }
                    else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
                        retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
                    }
                    if (retrySecs > 0) {
                        error = new myError_1.default("Too many requests for user ".concat(req.body.email, " with ip ").concat(ipAddr), 1, 429, 'درخواست بیش از حد انجام داده اید! بعد از یک ساعت دیگر دوباره اقدام بفرمایید!', 'خطا رخ داد');
                        next(error);
                    }
                    else {
                        limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey);
                        limiterSlowBruteByIP.consume(ipAddr);
                        next();
                    }
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=preventBruteForce.js.map