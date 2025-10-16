import * as express from 'express'
import * as mongoose from 'mongoose'
import successRes from '../middlewares/response'
import tryCatch from '../middlewares/tryCatch'
import { isAdmin } from '../middlewares/auth'
import myError from '../api/myError'
import { User } from '../db/user'
import { Like } from '../db/like'
import { Favorite } from '../db/favorite'
import { Match } from '../db/match'
import { Conversation } from '../db/conversation'
import { Message } from '../db/message'

export const adminDatingRoutes = express.Router()

// Users list
adminDatingRoutes.get('/users',
  isAdmin,
  tryCatch(async (req, res) => {
    const { q, limit, skip } = req.query as any
    const query: any = {}
    if (q) {
      query.$or = [
        { username: new RegExp(q, 'i') },
        { name: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { 'email.address': new RegExp(q, 'i') }
      ]
    }
    const docs = await User.find(query).limit(Math.min(Number(limit) || 50, 200)).skip(Number(skip) || 0).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

// Ban / Unban
adminDatingRoutes.post('/users/:userId/ban',
  isAdmin,
  tryCatch(async (req, res, next) => {
    const userId = req.params.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) return successRes(res, 'invalid user', {})
    const user = await User.findById(userId)
    if (!user) return next(new myError('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))
    user.isActive = false
    await user.save()
    return successRes(res, 'banned')
  })
)

adminDatingRoutes.post('/users/:userId/unban',
  isAdmin,
  tryCatch(async (req, res, next) => {
    const userId = req.params.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) return successRes(res, 'invalid user', {})
    const user = await User.findById(userId)
    if (!user) return next(new myError('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))
    user.isActive = true
    await user.save()
    return successRes(res, 'unbanned')
  })
)

// Verify photo
adminDatingRoutes.post('/users/:userId/verifyPhoto',
  isAdmin,
  tryCatch(async (req, res, next) => {
    const userId = req.params.userId
    if (!mongoose.Types.ObjectId.isValid(userId)) return successRes(res, 'invalid user', {})
    const user = await User.findById(userId)
    if (!user) return next(new myError('User not found', 404, 1, 'کاربر یافت نشد', 'خطا رخ داد'))
    user.verification = user.verification || {} as any
    ;(user.verification as any).photoVerified = true
    ;(user.verification as any).verifiedAt = new Date()
    await user.save()
    return successRes(res, 'photo verified')
  })
)

// Analytics overview
adminDatingRoutes.get('/analytics/overview',
  isAdmin,
  tryCatch(async (req, res) => {
    const [users, likes, matches, messages, favorites] = await Promise.all([
      User.countDocuments({}),
      Like.countDocuments({}),
      Match.countDocuments({ isActive: true }),
      Message.countDocuments({}),
      Favorite.countDocuments({})
    ])
    return successRes(res, '', { users, likes, matches, messages, favorites })
  })
)

// Matches of a user
adminDatingRoutes.get('/matches',
  isAdmin,
  tryCatch(async (req, res) => {
    const { userId } = req.query as any
    const filter: any = { isActive: true }
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.$or = [ { userA: userId }, { userB: userId } ]
    }
    const docs = await Match.find(filter).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

// Archive conversation
adminDatingRoutes.post('/conversations/:conversationId/archive',
  isAdmin,
  tryCatch(async (req, res) => {
    const { conversationId } = req.params
    await Conversation.updateOne({ _id: conversationId }, { $set: { isArchived: true } })
    return successRes(res, 'archived')
  })
)

// Delete a message
adminDatingRoutes.delete('/messages/:messageId',
  isAdmin,
  tryCatch(async (req, res) => {
    const { messageId } = req.params
    await Message.deleteOne({ _id: messageId })
    return successRes(res, 'deleted')
  })
)

// Likes and favorites lists for a user
adminDatingRoutes.get('/likes',
  isAdmin,
  tryCatch(async (req, res) => {
    const { userId, type } = req.query as any
    const filter: any = {}
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      if (type === 'sent') filter.liker = userId
      else if (type === 'received') filter.likee = userId
      else filter.$or = [ { liker: userId }, { likee: userId } ]
    }
    const docs = await Like.find(filter).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

adminDatingRoutes.get('/favorites',
  isAdmin,
  tryCatch(async (req, res) => {
    const { userId } = req.query as any
    const filter: any = {}
    if (userId && mongoose.Types.ObjectId.isValid(userId)) filter.user = userId
    const docs = await Favorite.find(filter).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)


