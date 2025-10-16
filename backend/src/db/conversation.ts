import * as mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessageAt: {
      type: Date
    },
    isArchived: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

// allow one conversation per match
conversationSchema.index({ match: 1 }, { unique: true })
conversationSchema.index({ participants: 1 })

export const Conversation = mongoose.model('Conversation', conversationSchema)


