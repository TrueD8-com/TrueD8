import * as express from 'express'
import * as mongoose from 'mongoose'

import successRes from '../middlewares/response'
import { isAuthorized } from '../middlewares/auth'
import tryCatch from '../middlewares/tryCatch'

import { User } from '../db/user'
import { Like } from '../db/like'
import { Match } from '../db/match'
import { Conversation } from '../db/conversation'
import { Message } from '../db/message'
import { Favorite } from '../db/favorite'
import { getIo } from '../api/socket'
import * as _ from 'lodash-es'

export const datingRoutes = express.Router()

// Like a user (mutual like => create match + conversation)
datingRoutes.post('/like/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return successRes(res, 'invalid target', {})
    }
    if (String(userId) === String(targetId)) {
      return successRes(res, 'cannot like self', {})
    }

    const [user, target] = await Promise.all([
      User.findById(userId),
      User.findById(targetId)
    ])
    if (!user || !target) {
      return successRes(res, 'user not found', {})
    }
    if (user.blockedUsers && user.blockedUsers.includes(target._id)) {
      return successRes(res, 'target blocked', {})
    }

    await Like.updateOne(
      { liker: user._id, likee: target._id },
      { $setOnInsert: { isSuperLike: false } },
      { upsert: true }
    )

    // Check for mutual like
    const reverse = await Like.findOne({ liker: target._id, likee: user._id })
    if (reverse) {
      // Create match (unordered pair uniqueness enforced in schema)
      const match = await Match.findOneAndUpdate(
        { $or: [ { userA: user._id, userB: target._id }, { userA: target._id, userB: user._id } ] },
        { $setOnInsert: { userA: user._id, userB: target._id, isActive: true } }, // ⬅️ Added userA and userB here
        { new: true, upsert: true }
      )
      // Create conversation if missing
      await Conversation.findOneAndUpdate(
        { match: match._id },
        { $setOnInsert: { participants: [user._id, target._id] } },
        { new: true, upsert: true }
      )
      await User.updateMany(
        { _id: { $in: [user._id, target._id] } },
        { $inc: { 'metrics.matchesCount': 1 } }
      )
      // notify both users
      getIo()?.to(`user:${user._id}`).to(`user:${target._id}`).emit('match:new', { matchId: match._id })
      return successRes(res, 'matched', { matchId: match._id })
    }

    await User.updateOne({ _id: user._id }, { $inc: { 'metrics.likesSent': 1 } })
    await User.updateOne({ _id: target._id }, { $inc: { 'metrics.likesReceived': 1 } })
    getIo()?.to(`user:${target._id}`).emit('like:received', { from: user._id })
    return successRes(res, 'liked', {})
  })
)

// Discover users (feed)
datingRoutes.get('/discover',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const limit = Math.min(Number(req.query.limit) || 30, 100)
    const skip = Math.max(Number(req.query.skip) || 0, 0)

    const me = await User.findById(userId)
    if (!me) return successRes(res, '', [])
    if (me.discovery && me.discovery.visible === false) return successRes(res, '', [])

    const exclusions: any[] = [me._id]
    if (Array.isArray(me.blockedUsers) && me.blockedUsers.length) {
      exclusions.push(...me.blockedUsers)
    }
    const likesSent = await Like.find({ liker: me._id }).select('likee')
    const matches = await Match.find({ $or: [ { userA: me._id }, { userB: me._id } ], isActive: true }).select('userA userB')
    const likedIds = likesSent.map((d: any) => d.likee)
    const matchedIds = matches.map((m: any) => String(m.userA) === String(me._id) ? m.userB : m.userA)
    exclusions.push(...likedIds, ...matchedIds)

    const query: any = { _id: { $nin: exclusions } }
    if (Array.isArray(me.showMe) && me.showMe.length) {
      query.gender = { $in: me.showMe }
    }

    // Geo filter if we have location and discovery distance
    if (me.location && Array.isArray((me.location as any).coordinates) && me.discovery && me.discovery.distanceKm) {
      const coords = (me.location as any).coordinates
      const maxMeters = Math.max(1, Number(me.discovery.distanceKm)) * 1000
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: coords },
          $maxDistance: maxMeters
        }
      }
    }

    const fields = 'name lastName username gender bio interests photos location discovery premium verification metrics'
    const docs = await User.find(query).select(fields).skip(skip).limit(limit)
    return successRes(res, '', docs)
  })
)

// AI matchmaking prompt - crafts a prompt payload from user profile + interactions
datingRoutes.get('/ai/prompt',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const user = await User.findById(userId)
    if (!user) return successRes(res, 'not found', {})

    const [likesSent, likesReceived, favorites] = await Promise.all([
      Like.find({ liker: userId }).select('likee isSuperLike createdAt'),
      Like.find({ likee: userId }).select('liker isSuperLike createdAt'),
      Favorite.find({ user: userId }).select('target createdAt')
    ])

    const payload = {
      profile: {
        username: user.username,
        gender: user.gender,
        showMe: user.showMe,
        bio: user.bio,
        interests: user.interests,
        discovery: user.discovery,
        location: user.location && user.location.coordinates ? { lat: user.location.coordinates[1], lng: user.location.coordinates[0] } : undefined
      },
      interactions: {
        likesSent: likesSent.map((d) => ({ targetId: d.likee, super: d.isSuperLike, at: d.createdAt })),
        likesReceived: likesReceived.map((d) => ({ fromId: d.liker, super: d.isSuperLike, at: d.createdAt })),
        favorites: favorites.map((f) => ({ targetId: f.target, at: f.createdAt }))
      },
      metrics: user.metrics
    }

    // This is the prompt structure that a separate AI service can consume
    const prompt = {
      system: 'You are an AI matchmaker optimizing for mutual compatibility and engagement.',
      user_context: payload,
      goal: 'Recommend top 10 candidate userIds to show next and key rationale tags.',
      constraints: [
        'Respect user showMe genders and discovery distance/age preferences',
        'Dedupe already disliked or unmatched users',
        'Prefer mutual or near-mutual engagement (likes received, common interests)'
      ]
    }

    return successRes(res, '', prompt)
  })
)

// Superlike
datingRoutes.post('/superlike/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return successRes(res, 'invalid target', {})
    }
    if (String(userId) === String(targetId)) {
      return successRes(res, 'cannot like self', {})
    }
    await Like.updateOne(
      { liker: userId, likee: targetId },
      { $set: { isSuperLike: true } },
      { upsert: true }
    )
    getIo()?.to(`user:${targetId}`).emit('like:received', { from: userId, super: true })
    return successRes(res, 'superliked', {})
  })
)

// Undo like (only removes like, not match)
datingRoutes.delete('/like/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId
    await Like.deleteOne({ liker: userId, likee: targetId })
    return successRes(res, 'unliked', {})
  })
)

// Get matches list
datingRoutes.get('/matches',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const matches = await Match.find({ $or: [ { userA: userId }, { userB: userId } ], isActive: true })
      .sort({ createdAt: -1 })
    return successRes(res, '', matches)
  })
)

// Unmatch
datingRoutes.post('/unmatch/:matchId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const matchId = req.params.matchId
    const match = await Match.findById(matchId)
    if (!match) return successRes(res, 'not found', {})
    if (String(match.userA) !== String(userId) && String(match.userB) !== String(userId)) {
      return successRes(res, 'forbidden', {})
    }
    match.isActive = false
    match.unmatchedBy = userId
    match.unmatchedAt = new Date()
    await match.save()
    await Conversation.updateMany({ match: match._id }, { $set: { isArchived: true } })
    getIo()?.to(`user:${match.userA}`).to(`user:${match.userB}`).emit('match:ended', { matchId })
    return successRes(res, 'unmatched', {})
  })
)

// Favorites
datingRoutes.post('/favorites/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId
    await Favorite.updateOne(
      { user: userId, target: targetId },
      { $setOnInsert: { user: userId, target: targetId } },
      { upsert: true }
    )
    await User.updateOne({ _id: userId }, { $inc: { 'metrics.favoritesCount': 1 } })
    getIo()?.to(`user:${targetId}`).emit('favorite:received', { from: userId })
    return successRes(res, 'favorited', {})
  })
)

datingRoutes.delete('/favorites/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId
    // Check delete result before decrementing the counter
    const result = await Favorite.deleteOne({ user: userId, target: targetId })
    
    if (result.deletedCount > 0) { // ⬅️ CONDITIONALLY decrement
      await User.updateOne({ _id: userId }, { $inc: { 'metrics.favoritesCount': -1 } })
    }

    return successRes(res, 'unfavorited', {})
  })
)

datingRoutes.get('/favorites',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const docs = await Favorite.find({ user: userId }).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

// Likes analytics & lists
datingRoutes.get('/likes/sent',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const docs = await Like.find({ liker: userId }).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

datingRoutes.get('/likes/received',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const docs = await Like.find({ likee: userId }).sort({ createdAt: -1 })
    return successRes(res, '', docs)
  })
)

datingRoutes.get('/analytics/likes',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const [sent, received] = await Promise.all([
      Like.countDocuments({ liker: userId }),
      Like.countDocuments({ likee: userId })
    ])
    return successRes(res, '', { sent, received })
  })
)

// Get conversations
datingRoutes.get('/conversations',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const convos = await Conversation.find({ participants: userId, isArchived: { $ne: true } })
      .sort({ lastMessageAt: -1 })
    return successRes(res, '', convos)
  })
)

// Get messages
datingRoutes.get('/conversations/:conversationId/messages',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const conversationId = req.params.conversationId
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const before = req.query.before ? new Date(String(req.query.before)) : undefined

    const convo = await Conversation.findOne({ _id: conversationId, participants: userId })
    if (!convo) return successRes(res, 'not found', [])

    const query: any = { conversation: convo._id }
    if (before) query.sentAt = { $lt: before }
    const messages = await Message.find(query).sort({ sentAt: -1 }).limit(limit)
    return successRes(res, '', messages)
  })
)

// Send message
datingRoutes.post('/conversations/:conversationId/messages',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const conversationId = req.params.conversationId
    const { text, mediaUrl, type } = req.body || {}

    const convo = await Conversation.findOne({ _id: conversationId, participants: userId })
    if (!convo) return successRes(res, 'not found', {})

    // Infer recipient as the other participant
    const recipient = convo.participants.find((p: any) => String(p) !== String(userId))
    const message = await Message.create({
      conversation: convo._id,
      sender: userId,
      recipient,
      type: type || (mediaUrl ? 'image' : 'text'),
      text,
      mediaUrl,
      isRead: false,
      sentAt: new Date()
    })
    await Conversation.updateOne({ _id: convo._id }, { $set: { lastMessageAt: message.sentAt } })
    // notify participants
    getIo()?.to(`conv:${convo._id}`).emit('message:new', { message })
    return successRes(res, 'sent', message)
  })
)

// Block user
datingRoutes.post('/block/:targetId',
  isAuthorized,
  tryCatch(async (req, res) => {
    const userId = req.session.userId
    const targetId = req.params.targetId
    const user = await User.findById(userId)
    if (!user) return successRes(res, 'not found', {})

    // 1. Add to blocked list
    await User.updateOne({ _id: user._id }, { $addToSet: { blockedUsers: targetId } })

    // 2. Comprehensive cleanup: likes, matches, and conversations
    await Promise.all([
      // Delete mutual likes
      Like.deleteMany({ $or: [ { liker: userId, likee: targetId }, { liker: targetId, likee: userId } ] }),
      
      // Deactivate matches and record who blocked whom
      Match.updateMany(
        { $or: [ { userA: userId, userB: targetId }, { userA: targetId, userB: userId } ] },
        { $set: { isActive: false, unmatchedBy: userId, unmatchedAt: new Date() } } // ⬅️ ADDED unmatchedBy/At
      ),
      
      // Archive conversations related to the block
      Conversation.updateMany( // ⬅️ ADDED CONVERSATION CLEANUP
        { participants: { $all: [userId, targetId] }, isArchived: { $ne: true } },
        { $set: { isArchived: true } }
      )
    ])
    
    // Note: You may also want to emit a socket event for the block/unmatch
    getIo()?.to(`user:${targetId}`).emit('user:blocked', { by: userId })

    return successRes(res, 'blocked', {})
  })
)


