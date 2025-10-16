import * as mongoose from 'mongoose'

const likeSchema = new mongoose.Schema(
  {
    liker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    likee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isSuperLike: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  { timestamps: true }
)

// Ensure a user can like another user only once
likeSchema.index({ liker: 1, likee: 1 }, { unique: true })

export const Like = mongoose.model('Like', likeSchema)


