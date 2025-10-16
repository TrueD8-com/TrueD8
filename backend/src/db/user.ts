import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'

const { Schema } = mongoose;
export interface IUser extends mongoose.Document {
  password: string;


  //,apiKey: string
}

export const verificationCodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
      unique: true,
    },
    code: {
      type: String,
    },
    email: {
      type: String,
    },
    createdAt: { type: Date, expires: 60 * 5, default: Date.now },
  },
  { timestamps: true },
);

export const verificationPhoneCodeSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      min: 11,
      max: 11,
      unique: true,
    },
    validated: {
      type: Boolean,
      required: true,
      default: false,
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    sessionId: {
      type: String,
    },
    createdAt: { type: Date, expires: 60 * 2, default: Date.now },
  },
  { timestamps: true },
);

const userSchema = new mongoose.Schema({
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
    address :{
      type: String,
      // required: true,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: { 'email.address': {$type: "string" } }
      } 
    },    
    validated: {
      type: Boolean,
      default: false,
      required: true,
    }
  },
  phoneNumber: {
    number: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { 'phoneNumber.number': {$type: "string" } }
      }, 
      min: 11,
      max: 11
    },
    validated: {
      type: Boolean,
      default: false,
      required: true,
    }
  },
  tempPhoneNumber: {
    type:  Schema.Types.ObjectId
  },
  birthdate: {
    year: {
      type: String
    },
    month: {
      type: String
    },
    day: {
      type: String
    }
  },
  gender: {
    type: String,
    enum: ['male','female','nonbinary','other'],
  },
  showMe: [
    {
      type: String,
      enum: ['male','female','nonbinary','other']
    }
  ],
  bio: {
    type: String,
    maxlength: 500
  },
  interests: [
    {
      type: String,
      trim: true
    }
  ],
  photos: [
    {
      url: { type: String, required: true },
      isPrimary: { type: Boolean, default: false, required: true },
      uploadedAt: { type: Date, default: () => new Date() }
    }
  ],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      index: '2dsphere'
    },
    updatedAt: { type: Date }
  },
  discovery: {
    distanceKm: { type: Number, default: 50, min: 1, max: 200 },
    ageMin: { type: Number, default: 18, min: 18, max: 100 },
    ageMax: { type: Number, default: 35, min: 18, max: 100 },
    visible: { type: Boolean, default: true, required: true },
    global: { type: Boolean, default: false, required: true }
  },
  emailVerificationString: {
    type:  Schema.Types.ObjectId
  },
  resetPasswordVerificationString: {
    type:  Schema.Types.ObjectId
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
  label: {
    type: Array,
    required: true
  },
  hasTicketAccount : {
    type : Boolean ,
    required : true,
    default : false
  },
  wallet: {
    provider: { type: String },
    address: { type: String },
    connectedAt: { type: Date }
  },
  notificationSettings: {
    pushLikes: { type: Boolean, default: true, required: true },
    pushMatches: { type: Boolean, default: true, required: true },
    pushMessages: { type: Boolean, default: true, required: true }
  },
  premium: {
    isPlus: { type: Boolean, default: false, required: true },
    isGold: { type: Boolean, default: false, required: true },
    expiresAt: { type: Date }
  },
  verification: {
    photoVerified: { type: Boolean, default: false, required: true },
    verifiedAt: { type: Date }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
    required: true
  },
  blockedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  metrics: {
    likesSent: { type: Number, default: 0, required: true },
    likesReceived: { type: Number, default: 0, required: true },
    matchesCount: { type: Number, default: 0, required: true },
    favoritesCount: { type: Number, default: 0, required: true }
  },
  userActivities: [
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
  address: {
    city: {
      type: String,
      // required: true
    },
    district: {
      type: String
    },
    province: {
      type: String,
      // required: true
    },
    postalCode: {
      type: String,
      // required: true,
      min: [10, 'Postal Code is 10 Digits'],
      max: [10, 'Postal Code is 10 Digits']
    },
    address: {
      type: String,
      // required: true,
      max: [130, 'Maximmum allowed string length is 130 ']
    },
     phone: {
       type: String
     }
  },
  userType: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    required: true,
    default: 1
  }
})

// This functions will execute if the password field is modified.
userSchema.pre('save', function (next) {
  var user = this
  if (user.isModified('password')) {
  bcrypt.genSalt(Number(process.env.SALT_I))
  .then((salt) => {
    bcrypt.hash(user.password, salt)
    .then((hash) => {
      user.password = hash
      next()
    })
    .catch((err) => {
      next(err)
    })
  })
  .catch((err) => {
    next(err)
  })
} else {
  next()
}
})

// This method compares the password which is stored in database and
// the password which the user entered. It is used in Login.
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

userSchema.methods.comparePasswordPromise = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password)
    .then(function(isMatch) {
      resolve(isMatch)
    })
    .catch((err) => {
      reject(err)
    })
  })
}

export const User = mongoose.model('User', userSchema);
export const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);
export const VerificationPhoneCode = mongoose.model('VerificationPhoneCode', verificationPhoneCodeSchema);
