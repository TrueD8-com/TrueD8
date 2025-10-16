import * as mongoose from 'mongoose'
import * as bcrypt from 'bcrypt'


const adminSchema = new mongoose.Schema({
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
        type:mongoose.ObjectId,
        required:true,
      },
      value: {
        type:Number,
        required:true,
        default:0,
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
})

// This functions will execute if the password field is modified.
adminSchema.pre('save', function (next) {
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
adminSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}

adminSchema.methods.comparePasswordPromise = function (candidatePassword) {
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

export const Admin = mongoose.model('Admin', adminSchema)
