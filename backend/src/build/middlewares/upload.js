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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEdit = exports.uploadTempMultiple = exports.uploadTemp = exports.editStorage = void 0;
var multer_1 = __importDefault(require("multer"));
var path = __importStar(require("path"));
var mongodb = __importStar(require("mongodb"));
var ObjectId = mongodb.ObjectId;
var TempStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/temp');
    },
    filename: function (req, file, cb) {
        var name = new ObjectId();
        var ext = path.extname(file.originalname);
        cb(null, name + ext);
    },
});
exports.editStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/temp');
    },
    filename: function (req, file, cb) {
        // const name = uuid4()
        // const ext = path.extname(file.originalname)
        cb(null, file.originalname);
    },
});
exports.uploadTemp = (0, multer_1.default)({
    storage: TempStorage,
    limits: {
        fileSize: 102400 * 102400,
        files: 1,
        fields: 0,
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    },
}).single('image');
exports.uploadTempMultiple = (0, multer_1.default)({
    storage: TempStorage,
    limits: {
        fileSize: 80480 * 80480,
        files: 2,
        fields: 0,
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    },
}).array('images');
exports.uploadEdit = (0, multer_1.default)({
    storage: exports.editStorage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'));
        }
        callback(null, true);
    },
    limits: {
        fileSize: 102400 * 102400,
        files: 10,
        fields: 2,
    },
}).fields([
    { name: 'images[]', maxCount: 5 },
    { name: 'image', maxCount: 1 },
]);
//# sourceMappingURL=upload.js.map