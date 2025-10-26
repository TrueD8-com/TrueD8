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
var express_1 = __importDefault(require("express"));
var express_session_1 = __importDefault(require("express-session"));
var morgan_1 = __importDefault(require("morgan"));
var connect_mongo_1 = __importDefault(require("connect-mongo"));
var bodyParser = __importStar(require("body-parser"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var helmet_1 = __importDefault(require("helmet"));
var mongoose_1 = __importDefault(require("mongoose"));
var useragent = __importStar(require("express-useragent"));
require("dotenv/config");
var errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
var logger_1 = require("./api/logger");
var csurf_1 = __importDefault(require("csurf"));
var cors_1 = __importDefault(require("cors"));
// import { serviceRoutes } from './routes/service'
// import { userRoutes } from './routes/user'
var auth_1 = require("./routes/auth");
var dating_1 = require("./routes/dating");
var user_dating_1 = require("./routes/user.dating");
var admin_dating_1 = require("./routes/admin.dating");
mongoose_1.default.Promise = global.Promise;
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(process.env.MONGO_DATABASE, {
    maxPoolSize: 5000,
    wtimeoutMS: 2500000,
    socketTimeoutMS: 36000000,
    connectTimeoutMS: 36000000,
})
    .catch(function (err) {
    logger_1.logger.error(err);
});
var mongooseDB = mongoose_1.default.connection;
var app = (0, express_1.default)();
var port = process.env.PORT || 9001;
app.use((0, morgan_1.default)(':remote-addr ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent" ', { stream: new logger_1.LoggerStream() }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    credentials: true,
    origin: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://trued8.com",
        "https://www.trued8.com",
    ],
    // origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
}));
app.use(useragent.express());
app.use((0, helmet_1.default)());
app.set("trust proxy", true);
var sess = {
    secret: "no body is perfect, i am nobody",
    resave: false,
    proxy: true,
    saveUninitialized: true,
    rolling: true,
    // SameSite: true,
    name: "sessionId",
    cookie: {
        // secure: true,
        httpOnly: true,
        // domain:,
        path: "/",
        maxAge: 1000 * 60 * 60 * 24,
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_DATABASE,
        dbName: process.env.MONGO_DATABASE_NAME,
    }),
};
var sess2 = {
    secret: process.env.SESSION_SECRET2,
    resave: false,
    proxy: true,
    saveUninitialized: true,
    rolling: true,
    //  SameSite: true,
    name: "sessionId",
    cookie: {
        // secure: true,
        httpOnly: true,
        // domain:,
        path: "/",
        maxAge: 1000 * 60 * 60 * 24,
    },
    store: connect_mongo_1.default.create({
        mongoUrl: process.env.MONGO_DATABASE,
        dbName: process.env.MONGO_DATABASE_NAME,
    }),
};
if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    //sess.cookie.secure = true // serve secure cookies
}
var http_1 = require("http");
var server = (0, http_1.createServer)(app);
var socket_1 = require("./api/socket");
var sharedsession = require("express-socket.io-session");
var sessionMiddleware = (0, express_session_1.default)(sess);
app.use(sessionMiddleware);
// Serve static images
app.use("/api/images", express_1.default.static("images"));
app.use("/api/auth", auth_1.authRoutes);
app.use("/api/dating", dating_1.datingRoutes);
app.use("/api/user", user_dating_1.userRoutes);
app.use("/api/admin", admin_dating_1.adminDatingRoutes);
app.use((0, csurf_1.default)());
app.use(errorHandler_1.default);
var myServer;
var start = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            myServer = server.listen(port, function () {
                console.log("Server is connected to redis and is listening on port ".concat(port));
            });
            (0, socket_1.startIo)(server, sessionMiddleware);
        }
        catch (error) {
            console.log(error);
        }
        return [2 /*return*/];
    });
}); };
start();
exports.default = myServer;
//# sourceMappingURL=index.js.map