import * as mongoose from 'mongoose'

const matchSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
)

// Keep pairs unique regardless of order
matchSchema.pre('validate', function (next) {
  const doc: any = this
  if (doc.userA && doc.userB) {
    const a = String(doc.userA)
    const b = String(doc.userB)
    if (a > b) {
      const tmp = doc.userA
      doc.userA = doc.userB
      doc.userB = tmp
    }
  }
  next()
})

matchSchema.index({ userA: 1, userB: 1 }, { unique: true })

export const Match = mongoose.model('Match', matchSchema)


