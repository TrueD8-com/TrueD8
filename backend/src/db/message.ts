import * as mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'system'],
      required: true,
      default: 'text'
    },
    text: {
      type: String
    },
    mediaUrl: {
      type: String
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false
    },
    readAt: {
      type: Date
    },
    sentAt: {
      type: Date,
      default: () => new Date()
    }
  },
  { timestamps: true }
)

messageSchema.index({ conversation: 1, sentAt: 1 })

export const Message = mongoose.model('Message', messageSchema)


