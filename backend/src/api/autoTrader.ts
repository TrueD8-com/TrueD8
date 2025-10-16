import * as mongoose from 'mongoose'
import * as _ from 'lodash'
import { v4 as uuidv4 } from 'uuid';

import { RateSellQueue } from '../db/rateSellQueue'
import { RateBuyQueue } from '../db/rateBuyQueue'
import { Active_Offers } from '../db/activeOffers'
import { Accepted_Offers } from '../db/acceptedOffers';
import { Admin } from '../db/admin'
import { User } from '../db/user';

import { knapsackComputation } from '../api/suggestOffers'
import myError from '../api/myError'
import { computeFee, roundToSix } from '../api/getFee'
import { getonlineLoginUsers } from '../api/socket'
import { handleAcceptOfferSockets } from '../api/handleSockets'
import * as redisMethods from '../api/redis'

import * as mongodb from 'mongodb';
const ObjectId = mongodb.ObjectId



export const autoTrader = async ({
    type,
    rate,
    value,
    userId,
    userType,
    expDate,
    currencyId,
    rialObj,
    oldOfferId,
    oldId,
    fee
}) => {
    const onlineLoginUsers = getonlineLoginUsers()
    const session2 = await mongoose.startSession()
    const id = new ObjectId()
    const uuid = uuidv4()
    let hasNewOffer = false
    let usedOfferIds = []
    let acceptedOfferIds = []
    let acceptedOfferObjects = []
    let remainValue: number = 0
    let creatorNewOffer
    let newActiveOffers = []
    return session2.withTransaction(async () => {
        return Active_Offers.findOne({ _id: oldId }).session(session2)
            .then((oldOffer) => {
                if (oldOffer && oldOffer._id.toString() === oldId.toString()) {
                    const oldOfferFeeValueRial = computeFee({ curGivenVal: oldOffer.curGivenVal, curTakenVal: oldOffer.curTakenVal, feeValuePercent: oldOffer.feeValuePercent })
                    if (type === "Buy") {
                        return RateSellQueue.findOne({ rate: rate }).session(session2)
                            .then((theDoc: any) => {
                                if (theDoc && theDoc.rate === Number(rate)) {
                                    if (theDoc.offerIds && theDoc.offerIds.length > 0) {
                                        return Active_Offers.find({
                                            $and: [
                                                { _id: { $in: theDoc.offerIds } },
                                                // { curGivenVal: { $lte: value } },
                                                { userId: { $ne: userId } }
                                            ]
                                        }).session(session2)
                                            .then((theOffers) => {
                                                let totalValue: number = 0
                                                let totalPrice: number = 0
                                                let totalFeeValueRial: number = 0
                                                if (theOffers && theOffers.length > 0) {
                                                    return RateBuyQueue.findOne({ rate: rate }).session(session2)
                                                        .then((rateDoc: any) => {
                                                            return knapsackComputation({ offers: theOffers, capacity: value, type: 'buy', form: 'fractional' })
                                                                .then((sugOffers) => {
                                                                    if (sugOffers && Array.isArray(sugOffers) && sugOffers.length > 0) {
                                                                        return User.findOne({ _id: userId }).session(session2)
                                                                            .then((acceptor: any) => {
                                                                                let takenObjInAccWal = _.find(acceptor.wallet, (e) => e.currency.toString() === rialObj._id.toString())
                                                                                let giveObjInAccWal = _.find(acceptor.wallet, (e) => e.currency.toString() === currencyId.toString())
                                                                                console.log('sugOfferIds-Buy: ', sugOffers)
                                                                                const sugOfferIdsMap = sugOffers.map((element) => {
                                                                                    return Active_Offers.findOne({ _id: element.id }).session(session2)
                                                                                        .then((theOffer : any) => {
                                                                                            if (theOffer && theOffer._id.toString() === element.id.toString()) {
                                                                                                const feeValueRial = computeFee({ curGivenVal: element.w, curTakenVal: theOffer.curTakenVal, feeValuePercent: theOffer.feeValuePercent })
                                                                                                return User.findOne({ _id: theOffer.userId }).session(session2)
                                                                                                    .then(async (creator: any) => {
                                                                                                        let givenObjInCreWal = _.find(creator.wallet, (e) => e.currency.toString() === currencyId.toString())
                                                                                                        let takenObjInCreWal = _.find(creator.wallet, (i) => i.currency.toString() === rialObj._id.toString())
                                                                                                        if (theOffer.curGivenVal > element.w) {
                                                                                                            const feeTempValueRial = computeFee({ curGivenVal: theOffer.curGivenVal - element.w, curTakenVal: theOffer.curTakenVal, feeValuePercent: theOffer.feeValuePercent })
                                                                                                            console.log("feeTempValueRial",feeTempValueRial)
                                                                                                            totalFeeValueRial += feeTempValueRial
                                                                                                            console.log("totalFeeValueRial",totalFeeValueRial)
                                                                                                            takenObjInCreWal.commitment = Math.ceil(takenObjInCreWal.commitment - feeTempValueRial)
                                                                                                            console.log("takenObjInCreWal.commitment ",takenObjInCreWal.commitment )
                                                                                                            const newId = new ObjectId()
                                                                                                            const newActiveOffer = {
                                                                                                                _id: newId,
                                                                                                                userId: theOffer.userId,
                                                                                                                offerId: uuid,
                                                                                                                curGivenId: theOffer.curGivenId,
                                                                                                                curGivenVal: roundToSix(theOffer.curGivenVal - element.w),
                                                                                                                curTakenId: theOffer.curTakenId,
                                                                                                                curTakenVal: theOffer.curTakenVal,
                                                                                                                feeValuePercent: theOffer.feeValuePercent,
                                                                                                                expDate: theOffer.expDate,
                                                                                                                txType: 'sell'
                                                                                                            }
                                                                                                            const modifiedBodyOffer = {
                                                                                                                _id: newId,
                                                                                                                userId: theOffer.userId,
                                                                                                                offerId: newActiveOffer.offerId,
                                                                                                                curTakenId: theOffer.curTakenId,
                                                                                                                curGivenId: theOffer.curGivenId,
                                                                                                                Tvalue: theOffer.curTakenVal,
                                                                                                                Gvalue: roundToSix(theOffer.curGivenVal - element.w),
                                                                                                                expireDate: theOffer.expDate,
                                                                                                                createDate: Date.now(),
                                                                                                                txType: 'sell',
                                                                                                            }
                                                                                                            await Active_Offers.create([newActiveOffer], { session: session2 })
                                                                                                            newActiveOffers.push(modifiedBodyOffer)
                                                                                                            theDoc.offerIds.push(newId)
                                                                                                        } else {
                                                                                                            totalFeeValueRial += feeValueRial
                                                                                                            takenObjInCreWal.commitment = Math.ceil(takenObjInCreWal.commitment - feeValueRial)
                                                                                                        }
                                                                                                        const acceptedOffer = {
                                                                                                            acceptor: userId,
                                                                                                            creator: theOffer.userId,
                                                                                                            offerId: theOffer.offerId,
                                                                                                            curGivenId: theOffer.curGivenId,
                                                                                                            curGivenVal: element.w,
                                                                                                            curTakenId: theOffer.curTakenId,
                                                                                                            curTakenVal: theOffer.curTakenVal,
                                                                                                            feeValuePercent: theOffer.feeValuePercent,
                                                                                                            offeredDate: theOffer.created_at,
                                                                                                            expiredDate: theOffer.expDate
                                                                                                        }
                                                                                                        givenObjInCreWal.commitment = roundToSix(givenObjInCreWal.commitment - element.w)
                                                                                                        console.log("    givenObjInCreWal.commitment ",    givenObjInCreWal.commitment )
                                                                                                        takenObjInCreWal.value = Math.floor(takenObjInCreWal.value + (theOffer.curTakenVal * element.w))
                                                                                                        totalPrice += theOffer.curTakenVal * element.w
                                                                                                        totalValue += element.w
                                                                                                        usedOfferIds.push(theOffer._id.toString())
                                                                                                        acceptedOfferIds.push(theOffer.offerId)
                                                                                                        const accepted2  = await Accepted_Offers.create([acceptedOffer], { session: session2 })
                                                                                                        acceptedOfferObjects.push(accepted2)
                                                                                                        await theOffer.deleteOne()
                                                                                                        await creator.save()
                                                                                                        redisMethods.setCurrentPrice({
                                                                                                            curGivenId: theOffer.curGivenId,
                                                                                                            curGivenVal: theOffer.curGivenVal,
                                                                                                            curTakenId: theOffer.curTakenId,
                                                                                                            curTakenVal: theOffer.curTakenVal
                                                                                                        })
                                                                                                            .catch((err) => {
                                                                                                                console.log(err)
                                                                                                            })
                                                                                                        handleAcceptOfferSockets({
                                                                                                            offer: theOffer,
                                                                                                            acceptorId: userId,
                                                                                                            giveObjInAccWal,
                                                                                                            takenObjInAccWal,
                                                                                                            creatorId: theOffer.userId.toString(),
                                                                                                            givenObjInCreWal,
                                                                                                            takenObjInCreWal,
                                                                                                            rialObj,
                                                                                                            status: 'sell',
                                                                                                            handleAcceptor: false
                                                                                                        })
                                                                                                    })
                                                                                                    .catch((err) => {
                                                                                                        throw err
                                                                                                    })
                                                                                            }
                                                                                        })
                                                                                        .catch((err) => {
                                                                                            throw err
                                                                                        })
                                                                                })
                                                                                return Promise.all(sugOfferIdsMap)
                                                                                    .then(() => {
                                                                                        if (totalValue > 0 && value - totalValue >= 0) {
                                                                                            const feeValueCreateOffer = fee / 5
                                                                                            const feeValueCreateOfferTrade = feeValueCreateOffer * 4
                                                                                            const feeCreateOfferTrade = (rate * (value - totalValue)) * feeValueCreateOfferTrade / 100
                                                                                            takenObjInAccWal.commitment = Math.ceil(takenObjInAccWal.commitment - (totalPrice + oldOfferFeeValueRial - feeCreateOfferTrade))
                                                                                            if (giveObjInAccWal) {
                                                                                                giveObjInAccWal.value = roundToSix(giveObjInAccWal.value + totalValue)
                                                                                            } else {
                                                                                                const currencyObj = {
                                                                                                    currency: currencyId,
                                                                                                    value: totalValue,
                                                                                                }
                                                                                                acceptor.wallet.push(currencyObj)
                                                                                            }
                                                                                            creatorNewOffer = {
                                                                                                _id: id,
                                                                                                offerId: uuid,
                                                                                                userId: userId,
                                                                                                curGivenId: rialObj._id,
                                                                                                curGivenVal: rate,
                                                                                                curTakenId: currencyId,
                                                                                                curTakenVal: roundToSix(value - totalValue),
                                                                                                feeValuePercent: feeValueCreateOfferTrade,
                                                                                                expDate: expDate,
                                                                                                rank: userType
                                                                                            }
                                                                                            const modifiedBodyOffer2 = {
                                                                                                _id: id,
                                                                                                userId: userId,
                                                                                                offerId: uuid,
                                                                                                curTakenId: creatorNewOffer.curTakenId,
                                                                                                curGivenId: creatorNewOffer.curGivenId,
                                                                                                Tvalue: rate,
                                                                                                Gvalue: roundToSix(value - totalValue),
                                                                                                expireDate: creatorNewOffer.expDate,
                                                                                                createDate: Date.now(),
                                                                                                theUsersOffer: true,
                                                                                                txType: 'buy',
                                                                                            }
                                                                                            return Admin.findOne({ role: "Admin" }).session(session2)
                                                                                                .then(async (admin: any) => {
                                                                                                    if (admin) {
                                                                                                        let rialInadminWallet = _.find(admin.wallet, (e) => e.currency.toString() === rialObj._id.toString())
                                                                                                        if (rialInadminWallet) {
                                                                                                            rialInadminWallet.value = Math.ceil(rialInadminWallet.value + totalFeeValueRial)
                                                                                                        } else {
                                                                                                            admin.wallet.push({
                                                                                                                currency: rialObj._id,
                                                                                                                value: Math.ceil(totalFeeValueRial)
                                                                                                            })
                                                                                                        }
                                                                                                        if (value - totalValue > 0) {
                                                                                                            await Active_Offers.create([creatorNewOffer], { session: session2 })
                                                                                                            newActiveOffers.push(modifiedBodyOffer2)
                                                                                                            rateDoc.offerIds.push(id.toString())
                                                                                                            hasNewOffer = true
                                                                                                            remainValue = roundToSix(value - totalValue)
                                                                                                        }
                                                                                                        theDoc.offerIds = _.filter(theDoc.offerIds, (v) => !usedOfferIds.includes(v.toString()))
                                                                                                        rateDoc.offerIds = _.filter(rateDoc.offerIds, (v) => v.toString() !== oldId.toString())
                                                                                                        if (theDoc.offerIds.length > 0) {
                                                                                                            await theDoc.save()
                                                                                                        } else {
                                                                                                            await theDoc.deleteOne()
                                                                                                        }
                                                                                                        if (rateDoc.offerIds.length > 0) {
                                                                                                            await rateDoc.save()
                                                                                                        } else {
                                                                                                            await rateDoc.deleteOne()
                                                                                                        }
                                                                                                        await oldOffer.deleteOne()
                                                                                                        await acceptor.save()
                                                                                                    } else {
                                                                                                        const error = new myError(
                                                                                                            'admin not found',
                                                                                                            400,
                                                                                                            5,
                                                                                                            'ادمین پیدا نشد',
                                                                                                            'خطا رخ داد'
                                                                                                        )
                                                                                                        throw (error)
                                                                                                    }
                                                                                                })
                                                                                                .catch((err) => {
                                                                                                    throw err
                                                                                                })
                                                                                        }
                                                                                    })
                                                                                    .catch((err) => {
                                                                                        throw err
                                                                                    })
                                                                            })
                                                                            .catch((err) => {
                                                                                throw err
                                                                            })
                                                                    }
                                                                })
                                                                .catch((err) => {
                                                                    throw err
                                                                })
                                                        })
                                                        .catch((err) => {
                                                            throw err
                                                        })
                                                }
                                            })
                                            .catch((err) => {
                                                throw err
                                            })
                                    }
                                }
                            })
                            .catch((err) => {
                                throw err
                            })
                    } else if (type === 'Sell') {
                        return RateBuyQueue.findOne({ rate: rate }).session(session2)
                            .then((theDoc: any) => {
                                if (theDoc && theDoc.rate === rate) {
                                    if (theDoc.offerIds && theDoc.offerIds.length > 0) {
                                        return Active_Offers.find({
                                            $and: [
                                                { _id: { $in: theDoc.offerIds } },
                                                // { curTakenVal: { $lte: value } },
                                                { userId: { $ne: userId } }
                                            ]
                                        }).session(session2)
                                            .then((theOffers) => {
                                                let totalValue: number = 0
                                                let totalPrice: number = 0
                                                let totalFeeValueRial: number = 0

                                                if (theOffers && theOffers.length > 0) {
                                                    return RateSellQueue.findOne({ rate: rate }).session(session2)
                                                        .then((rateDoc: any) => {
                                                            return knapsackComputation({ offers: theOffers, capacity: value, type: 'sell', form: 'fractional' })
                                                                .then((sugOffers) => {
                                                                    if (sugOffers && Array.isArray(sugOffers) && sugOffers.length > 0) {
                                                                        return User.findOne({ _id: userId }).session(session2)
                                                                            .then(async (acceptor: any) => {
                                                                                let takenObjInAccWal = _.find(acceptor.wallet, (e) => e.currency.toString() === currencyId.toString())
                                                                                let giveObjInAccWal = _.find(acceptor.wallet, (e) => e.currency.toString() === rialObj._id.toString())
                                                                                console.log('sugOfferIds-Sell: ', sugOffers)
                                                                                const sugOfferIdsMap = sugOffers.map((element) => {
                                                                                    return Active_Offers.findOne({ _id: element.id }).session(session2)
                                                                                        .then((theOffer: any) => {
                                                                                            if (theOffer && theOffer._id.toString() === element.id.toString()) {
                                                                                                const feeValueRial = computeFee({ curGivenVal: theOffer.curGivenVal, curTakenVal: element.w, feeValuePercent: theOffer.feeValuePercent })
                                                                                                return User.findOne({ _id: theOffer.userId }).session(session2)
                                                                                                    .then(async (creator: any) => {
                                                                                                        let givenObjInCreWal = _.find(creator.wallet, (e) => e.currency.toString() === rialObj._id.toString())
                                                                                                        let takenObjInCreWal = _.find(creator.wallet, (i) => i.currency.toString() === currencyId.toString())
                                                                                                        if (theOffer.curTakenVal > element.w) {
                                                                                                            const feeTempValueRial = computeFee({ curGivenVal: theOffer.curGivenVal, curTakenVal: theOffer.curTakenVal - element.w, feeValuePercent: theOffer.feeValuePercent })
                                                                                                            givenObjInCreWal.commitment = Math.ceil(givenObjInCreWal.commitment - ((theOffer.curGivenVal * element.w) + feeTempValueRial))

                                                                                                            totalFeeValueRial += feeTempValueRial
                                                                                                            const newId = new ObjectId()
                                                                                                            const newActiveOffer = {
                                                                                                                _id: newId,
                                                                                                                userId: theOffer.userId,
                                                                                                                offerId: uuid,
                                                                                                                curGivenId: theOffer.curGivenId,
                                                                                                                curGivenVal: theOffer.curGivenVal,
                                                                                                                curTakenId: theOffer.curTakenId,
                                                                                                                curTakenVal: roundToSix(theOffer.curTakenVal - element.w),
                                                                                                                feeValuePercent: theOffer.feeValuePercent,
                                                                                                                expDate: theOffer.expDate,
                                                                                                                txType: 'buy'
                                                                                                            }
                                                                                                            const modifiedBodyOffer = {
                                                                                                                _id: newId,
                                                                                                                userId: theOffer.userId,
                                                                                                                offerId: newActiveOffer.offerId,
                                                                                                                curTakenId: theOffer.curTakenId,
                                                                                                                curGivenId: theOffer.curGivenId,
                                                                                                                Tvalue: roundToSix(theOffer.curGivenVal - element.w),
                                                                                                                Gvalue: theOffer.curTakenVal,
                                                                                                                expireDate: theOffer.expDate,
                                                                                                                createDate: Date.now(),
                                                                                                                txType: 'buy',
                                                                                                            }
                                                                                                            await Active_Offers.create([newActiveOffer], { session: session2 })
                                                                                                            newActiveOffers.push(modifiedBodyOffer)
                                                                                                            theDoc.offerIds.push(newId)
                                                                                                        } else {
                                                                                                            totalFeeValueRial += feeValueRial
                                                                                                            givenObjInCreWal.commitment = Math.ceil(givenObjInCreWal.commitment - ((theOffer.curGivenVal * element.w) + feeValueRial))
                                                                                                        }
                                                                                                        if (takenObjInCreWal) {
                                                                                                            takenObjInCreWal.value = roundToSix(takenObjInCreWal.value + element.w)
                                                                                                        } else {
                                                                                                            const currencyObj = {
                                                                                                                currency: currencyId,
                                                                                                                value: element.w
                                                                                                            }
                                                                                                            creator.wallet.push(currencyObj)
                                                                                                        }
                                                                                                        const acceptedOffer = {
                                                                                                            acceptor: userId,
                                                                                                            creator: theOffer.userId,
                                                                                                            offerId: theOffer.offerId,
                                                                                                            curGivenId: theOffer.curGivenId,
                                                                                                            curGivenVal: theOffer.curGivenVal,
                                                                                                            curTakenId: theOffer.curTakenId,
                                                                                                            curTakenVal: element.w,
                                                                                                            feeValuePercent: theOffer.feeValuePercent,
                                                                                                            offeredDate: theOffer.created_at,
                                                                                                            expiredDate: theOffer.expDate
                                                                                                        }
                                                                                                        totalValue += element.w
                                                                                                        totalPrice += theOffer.curGivenVal * element.w

                                                                                                        usedOfferIds.push(theOffer._id.toString())
                                                                                                        acceptedOfferIds.push(theOffer.offerId)
                                                                                                        await creator.save()
                                                                                                        const accepted1 =  await Accepted_Offers.create([acceptedOffer], { session: session2 })
                                                                                                        acceptedOfferObjects.push (accepted1)
                                                                                                        await theOffer.deleteOne()
                                                                                                        redisMethods.setCurrentPrice({
                                                                                                            curGivenId: theOffer.curGivenId,
                                                                                                            curGivenVal: theOffer.curGivenVal,
                                                                                                            curTakenId: theOffer.curTakenId,
                                                                                                            curTakenVal: theOffer.curTakenVal
                                                                                                        })
                                                                                                            .catch((err) => {
                                                                                                                console.log(err)
                                                                                                            })
                                                                                                        handleAcceptOfferSockets({
                                                                                                            offer: theOffer,
                                                                                                            acceptorId: userId,
                                                                                                            giveObjInAccWal,
                                                                                                            takenObjInAccWal,
                                                                                                            creatorId: theOffer.userId.toString(),
                                                                                                            givenObjInCreWal,
                                                                                                            takenObjInCreWal,
                                                                                                            rialObj,
                                                                                                            status: 'buy',
                                                                                                            handleAcceptor: false
                                                                                                        })
                                                                                                    })
                                                                                                    .catch((err) => {
                                                                                                        throw err
                                                                                                    })
                                                                                            }
                                                                                        })
                                                                                        .catch((err) => {
                                                                                            throw err
                                                                                        })
                                                                                })
                                                                                return Promise.all(sugOfferIdsMap)
                                                                                    .then(async () => {
                                                                                        if (totalValue > 0 && value - totalValue >= 0) {
                                                                                            const feeValueCreateOffer = fee / 5
                                                                                            const feeValueCreateOfferTrade = feeValueCreateOffer * 4
                                                                                            const feeCreateOfferTrade = rate * (value - totalValue) * feeValueCreateOfferTrade / 100
                                                                                            takenObjInAccWal.commitment = roundToSix(takenObjInAccWal.commitment - totalValue)
                                                                                            giveObjInAccWal = _.find(acceptor.wallet, (e) => e.currency.toString() === rialObj._id.toString())

                                                                                            giveObjInAccWal.value = Math.ceil(giveObjInAccWal.value + totalPrice)
                                                                                            giveObjInAccWal.commitment = Math.ceil(giveObjInAccWal.commitment - (oldOfferFeeValueRial - feeCreateOfferTrade))

                                                                                            creatorNewOffer = {
                                                                                                _id: id,
                                                                                                offerId: uuid,
                                                                                                userId: userId,
                                                                                                curGivenId: currencyId,
                                                                                                curGivenVal: roundToSix(value - totalValue),
                                                                                                curTakenId: rialObj._id,
                                                                                                curTakenVal: rate,
                                                                                                feeValuePercent: feeValueCreateOfferTrade,
                                                                                                expDate: expDate,
                                                                                                rank: userType,
                                                                                            }
                                                                                            const modifiedBodyOffer2 = {
                                                                                                _id: id,
                                                                                                userId: userId,
                                                                                                offerId: uuid,
                                                                                                curTakenId: creatorNewOffer.curTakenId,
                                                                                                curGivenId: creatorNewOffer.curGivenId,
                                                                                                Tvalue: rate,
                                                                                                Gvalue: roundToSix(value - totalValue),
                                                                                                expireDate: creatorNewOffer.expDate,
                                                                                                createDate: Date.now(),
                                                                                                txType: 'sell',
                                                                                                theUsersOffer: true,
                                                                                            }
                                                                                            return Admin.findOne({ role: "Admin" }).session(session2)
                                                                                                .then(async (admin: any) => {
                                                                                                    if (admin) {
                                                                                                        let rialInadminWallet = _.find(admin.wallet, (e) => e.currency.toString() === rialObj._id.toString())
                                                                                                        if (rialInadminWallet) {
                                                                                                            rialInadminWallet.value = Math.ceil(rialInadminWallet.value + totalFeeValueRial)
                                                                                                        } else {
                                                                                                            admin.wallet.push({
                                                                                                                currency: rialObj._id,
                                                                                                                value: Math.ceil(totalFeeValueRial)
                                                                                                            })
                                                                                                        }
                                                                                                    }
                                                                                                    if (value - totalValue > 0) {
                                                                                                        await Active_Offers.create([creatorNewOffer], { session: session2 })
                                                                                                        newActiveOffers.push(modifiedBodyOffer2)
                                                                                                        rateDoc.offerIds.push(id.toString())
                                                                                                        hasNewOffer = true
                                                                                                        remainValue = roundToSix(value - totalValue)
                                                                                                    }
                                                                                                    theDoc.offerIds = _.filter(theDoc.offerIds, (v) => !usedOfferIds.includes(v.toString()))
                                                                                                    rateDoc.offerIds = _.filter(rateDoc.offerIds, (v) => v.toString() !== oldId.toString())
                                                                                                    if (theDoc.offerIds.length > 0) {
                                                                                                        await theDoc.save()
                                                                                                    } else {
                                                                                                        await theDoc.deleteOne()
                                                                                                    }
                                                                                                    if (rateDoc.offerIds.length > 0) {
                                                                                                        await rateDoc.save()
                                                                                                    } else {
                                                                                                        await rateDoc.deleteOne()
                                                                                                    }
                                                                                                    await oldOffer.deleteOne()
                                                                                                    await acceptor.save()
                                                                                                })
                                                                                                .catch((err) => {
                                                                                                    throw err
                                                                                                })
                                                                                        }
                                                                                    })
                                                                                    .catch((err) => {
                                                                                        throw err
                                                                                    })
                                                                            })
                                                                            .catch((err) => {
                                                                                throw err
                                                                            })
                                                                    }
                                                                })
                                                                .catch((err) => {
                                                                    throw err
                                                                })
                                                        })
                                                        .catch((err) => {
                                                            throw err
                                                        })
                                                }
                                            })
                                            .catch((err) => {
                                                throw err
                                            })
                                    }
                                }
                            })
                            .catch((err) => {
                                throw err
                            })
                    }
                } else {
                    const error = new myError(
                        'The offer is not found!',
                        400,
                        5,
                        'آفر اولیه پیدا نشد!',
                        'خطا رخ داد'
                    )
                    throw (error)
                }
            })
            .catch((err) => {
                throw err
            })
    })
        .then(() => {
            if (acceptedOfferIds.length > 0) {
                 console.log("accepted_offers",acceptedOfferIds)
                onlineLoginUsers.emit('accepted_offers', acceptedOfferIds)
            }
            if (newActiveOffers.length > 0) {
               console.log("newActiveOffers",newActiveOffers)
               getonlineLoginUsers().emit('new_offer', newActiveOffers)
           }
            if (hasNewOffer) {
                return {
                    offerId: uuid,
                    remainValue,
                    newActiveOffers
                }
            } else {
                return {
                    offerId: oldOfferId
                }
            }

        })
        .catch((err) => {
            throw err
        })
        .finally(() => {
            session2.endSession()
        })
}

