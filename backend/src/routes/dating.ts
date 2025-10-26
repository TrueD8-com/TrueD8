import * as express from 'express'
import * as mongoose from 'mongoose'

import successRes from "../middlewares/response";
import { isAuthorized } from '../middlewares/auth'
import tryCatch from '../middlewares/tryCatch'

import { User } from '../db/user'
import { Like } from '../db/like'
import { Match } from '../db/match'
import { Conversation } from '../db/conversation'
import { Message } from '../db/message'
import { Favorite } from '../db/favorite'
import { getIo } from '../api/socket'
import * as _ from 'lodash'
import axios from 'axios';
export const datingRoutes = express.Router()
const ASI_API_KEY = process.env.ASI_ONE_API_KEY
const ASI_API_URL = 'https://api.asi1.ai/v1/chat/completions'
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


async function getCandidatePool(
  currentUserId: string,
  discoveryPreferences: any,
  showMePreferences: string[],
  userCoordinates?: number[]
) {
  // 1. Get IDs of users to EXCLUDE
  const [previouslyInteractedLikes, currentUserDoc] = await Promise.all([
    Like.find({ liker: currentUserId }).select('likee -_id').lean(),
    User.findById(currentUserId).select('blockedUsers -_id').lean()
  ])

  const excludedIds = [
    currentUserId,
    ...(currentUserDoc?.blockedUsers || []).map(id => id.toString()),
    ...previouslyInteractedLikes.map(i => i.likee.toString()),
  ]
  
  const blockedMeDocs = await User.find({ blockedUsers: currentUserId }).select('_id').lean()
  excludedIds.push(...blockedMeDocs.map(u => u._id.toString()))

  // 2. Define the MongoDB Query Filter
  const today = new Date()
  const minBirthYear = today.getFullYear() - discoveryPreferences.ageMax
  const maxBirthYear = today.getFullYear() - discoveryPreferences.ageMin

  const hardFilters: mongoose.FilterQuery<any> = {
    _id: { $nin: excludedIds },
    'discovery.visible': true,
    gender: { $in: showMePreferences.length > 0 ? showMePreferences : ['male', 'female', 'nonbinary', 'other'] },
    'birthdate.year': { $gte: String(minBirthYear), $lte: String(maxBirthYear) }
  }

  // 3. Add Geospatial Filter
  if (userCoordinates && userCoordinates.length === 2 && discoveryPreferences.distanceKm > 0) {
    const maxDistanceMeters = discoveryPreferences.distanceKm * 1000
    hardFilters.location = {
      $near: {
        $geometry: { type: "Point", coordinates: userCoordinates }, // [lng, lat]
        $maxDistance: maxDistanceMeters
      }
    }
  }

  // 4. Execute Query
  const candidatePool = await User.find(hardFilters)
    .select('_id username gender bio interests metrics location wallet') // Select only necessary data for AI
    .limit(50) // Limit to a large-enough pool for the AI
    .lean()
    
  return candidatePool
}// AI matchmaking prompt - crafts a prompt payload from user profile + interactions
datingRoutes.post('/ai/discover/custom',
  isAuthorized,
  tryCatch(async (req, res) => {
    const { customPrompt } = req.body // Expect: { "customPrompt": "Looking for someone who loves hiking and is passionate about decentralization." }
    if (!customPrompt || typeof customPrompt !== 'string' || customPrompt.length > 500) {
      return successRes(res, 'Invalid custom prompt provided.', {})
    }

    const userId = req.session.userId
    const user = await User.findById(userId)
    if (!user) return successRes(res, 'not found', {})

    // 1. Aggregate Data (same as the standard AI discover)
    const userCoordinates = user.location?.coordinates
    const [likesSent, likesReceived, favorites, candidatePool] = await Promise.all([
      Like.find({ liker: userId }).select('likee isSuperLike createdAt').lean(),
      Like.find({ likee: userId }).select('liker isSuperLike createdAt').lean(),
      Favorite.find({ user: userId }).select('target createdAt').lean(),
      getCandidatePool(userId, user.discovery, user.showMe, userCoordinates)
    ])

    if (!candidatePool || candidatePool.length === 0) {
      return successRes(res, 'no new candidates found', [])
    }
    
    // 2. Construct the AI Prompt, now including the user's custom text
    const userContextPayload = {
      profile: _.pick(user, ['username', 'gender', 'showMe', 'bio', 'interests', 'discovery']),
      // ... (interactions and metrics remain the same)
    }

    const aiPrompt = {
      user_context: userContextPayload,
      candidate_profiles: candidatePool.map(c => ({
          userId: c._id.toString(),
          ..._.pick(c, ['gender', 'bio', 'interests', 'metrics'])
      }))
    }

    // 3. Call the external ASI API with the modified prompt
    let matchRecommendations = []
    try {
      const promptString = JSON.stringify(aiPrompt, null, 2)
      const messages = [
        {
          role: "system",
          content: "You are an AI matchmaker for a Web3 dating app. Your only task is to return a valid JSON object with a single key 'recommendations'. You MUST prioritize the user's custom text prompt when ranking candidates. Analyze the user's context and rank candidates based on this primary custom request."
        },
        {
          role: "user",
          content: `CONTEXT:\n\n**USER'S CUSTOM PROMPT (Prioritize this heavily):**\n"${customPrompt}"\n\nGOAL: Rank the top 10 candidates from 'candidate_profiles' who best match the user's custom prompt and general profile.\n\nREQUIRED JSON SCHEMA:\n{\n  "recommendations": [\n    {\n      "id": "string",\n      "score": "integer (0-100)",\n      "rationaleTag": "string (e.g., Matches-Hiking-Interest)"\n    }\n  ]\n}\n\nFULL USER DATA AND CANDIDATE POOL:\n${promptString}`
        }
      ]
      console.log("messages", messages);
      const response = await axios.post(ASI_API_URL, {
        model: "asi1-extended",
        temperature: 0.3, // Slightly higher temperature for more creative matching on the custom prompt
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: messages,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ASI_API_KEY}`,
        }
      })
      
      const result = JSON.parse(response.data.choices[0].message.content)
      matchRecommendations = result.recommendations || []
      console.log("matchRecommendations", matchRecommendations);
    } catch (error: any) {
      // Type narrowed to 'any' for access; fallbacks for non-axios errors
      const apiErrData = (error && error.response && error.response.data) ? error.response.data : undefined;
      const apiErrMsg = (error && error.message) ? error.message : String(error);
      console.error("ASI API Error (Custom Prompt):", apiErrData ?? apiErrMsg);
      return successRes(res, 'AI service failed to process custom prompt.', []);
    }
    
    // 4. Fetch and return ranked profiles (same as before)
    if (matchRecommendations.length === 0) {
        return successRes(res, 'No recommendations from AI for your custom prompt', [])
    }
    
    const rankedIds = matchRecommendations.map((rec: any) => rec.id)
    const fieldsToSelect = '_id name lastName username gender bio interests photos location birthdate verification';

// Fetch only the specified fields for the recommended users.
const rankedUserDocs = await User.find({ _id: { $in: rankedIds } })
  .select(fieldsToSelect) // Replaced the empty comment with the fields string
  .lean();
    const userMap = new Map(rankedUserDocs.map(doc => [doc._id.toString(), doc]))
    const finalRankedProfiles = rankedIds.map((id: string) => userMap.get(id)).filter(Boolean)

    return successRes(res, 'Custom match recommendations generated', finalRankedProfiles)
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


