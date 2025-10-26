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
exports.Admin = void 0;
var mongoose = __importStar(require("mongoose"));
var bcrypt = __importStar(require("bcrypt"));
var adminSchema = new mongoose.Schema({
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    username: {
        type: String,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { username: { $type: 'string' } }
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    lastActiveAt: {
        type: Date
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['Admin', 'Manager', 'Supporter']
    },
    permissions: [
        {
            type: String
        }
    ],
    wallet: [
        {
            currency: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
            },
            value: {
                type: Number,
                required: true,
                default: 0,
            }
        }
    ],
    adminActivities: [
        {
            action: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date
            },
            device: {
                type: String
            },
            loginDeviceId: {},
            ip: {
                type: String
            }
        }
    ],
    twoFactor: {
        enabled: { type: Boolean, default: false, required: true },
        secret: { type: String }
    }
});
// This functions will execute if the password field is modified.
adminSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password')) {
        bcrypt.genSalt(Number(process.env.SALT_I))
            .then(function (salt) {
            bcrypt.hash(user.password, salt)
                .then(function (hash) {
                user.password = hash;
                next();
            })
                .catch(function (err) {
                next(err);
            });
        })
            .catch(function (err) {
            next(err);
        });
    }
    else {
        next();
    }
});
// This method compares the password which is stored in database and
// the password which the user entered. It is used in Login.
adminSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};
adminSchema.methods.comparePasswordPromise = function (candidatePassword) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        bcrypt.compare(candidatePassword, _this.password)
            .then(function (isMatch) {
            resolve(isMatch);
        })
            .catch(function (err) {
            reject(err);
        });
    });
};
exports.Admin = mongoose.model('Admin', adminSchema);
//# sourceMappingURL=admin.js.map