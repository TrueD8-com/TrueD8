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
exports.Match = void 0;
var mongoose = __importStar(require("mongoose"));
var matchSchema = new mongoose.Schema({
    userA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    createdByLike: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Like'
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    unmatchedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    unmatchedAt: {
        type: Date
    }
}, { timestamps: true });
// Keep pairs unique regardless of order
matchSchema.pre('validate', function (next) {
    var doc = this;
    if (doc.userA && doc.userB) {
        var a = String(doc.userA);
        var b = String(doc.userB);
        if (a > b) {
            var tmp = doc.userA;
            doc.userA = doc.userB;
            doc.userB = tmp;
        }
    }
    next();
});
matchSchema.index({ userA: 1, userB: 1 }, { unique: true });
exports.Match = mongoose.model('Match', matchSchema);
//# sourceMappingURL=match.js.map