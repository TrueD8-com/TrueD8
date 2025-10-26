import * as mongoose from 'mongoose'
import * as _ from 'lodash-es'

import { PendingTransfers } from '../db/pendingTransfers'
import { SuccessfulTransfers } from '../db/successfulTransfers'
import { FailedTransfers } from '../db/failedTransfers'
import { User } from '../db/user'
import { Admin } from '../db/admin'

import * as redis from '../api/redis'
import * as bitcoin from '../api/walletApi/bitcoin'
import * as etherium from '../api/walletApi/etheriuem'
import * as tron from '../api/walletApi/tron'
import myError from '../api/myError'
import { roundToSix, roundTo8 } from '../api/getFee'

let checkStatus = () => {
    return null
}
const checkStatusOfTxById = () => {
    return PendingTransfers.find()
        .then((txs: any) => {
            return redis.hashGetAll("RIAL")
                .then((rialObj: any) => {
                    let userPendingTxs = []
                    return txs.map((userPending: any) => {
                        userPendingTxs = userPending.transactions
                        return userPending.transactions.map((e: any) => {
                            return redis.hashGetAll(e.currencyId.toString())
                                .then(async (curObj: any) => {
                                    if (curObj) {
                                        if (e.txId) {
                                            switch (curObj.ab_name) {
                                                case 'BTC':
                                                    checkStatus = () => {
                                                        return bitcoin.bitcoinTransferToExchangeById(e.txId)
                                                            .then(async (result) => {
                                                                return result
                                                            })
                                                            .catch(async (err) => {
                                                                throw err
                                                            })
                                                    }
                                                    break;
                                                case 'ETH':
                                                    checkStatus = () => {
                                                        return etherium.ethereumTransferToExchangeById(e.txId)
                                                            .then(async (result) => {
                                                                return result
                                                            })
                                                            .catch(async (err) => {
                                                                throw err
                                                            })
                                                    }
                                                    break;
                                                case 'TRX':
                                                    checkStatus = () => {
                                                        return tron.tronTransferToExchangeById(e.txId)
                                                            .then(async (result) => {
                                                                return result
                                                            })
                                                            .catch((err) => {
                                                                throw err
                                                            })
                                                    }
                                                    break;
                                                default:
                                                    break;
                                            }
                                            return Promise.all([checkStatus()])
                                                .then(async (info: any) => {
                                                    if (info[0].status === 'Confirmed') {
                                                        const session = await mongoose.startSession()
                                                        return session.withTransaction(async () => {
                                                            return SuccessfulTransfers.findOne({ userId: userPending.userId }).session(session)
                                                                .then(async (doc: any) => {
                                                                    if (!doc) {
                                                                        const successDoc = {
                                                                            userId: userPending.userId,
                                                                            transactions: [{
                                                                                txId: e.txId,
                                                                                txUuId: e.txUuId,
                                                                                currencyId: e.currencyId,
                                                                                currencyName: e.currencyName,
                                                                                value: e.value,
                                                                                type: e.type
                                                                            }]
                                                                        }
                                                                        await SuccessfulTransfers.create([successDoc], { session })
                                                                    } else {
                                                                        const theTxIndex = _.findIndex(doc.transactions, (v: any) => v.txId === e.txId)
                                                                        if (theTxIndex === -1) {
                                                                            doc.transactions.push({
                                                                                txId: e.txId,
                                                                                txUuId: e.txUuId,
                                                                                currencyId: e.currencyId,
                                                                                currencyName: e.currencyName,
                                                                                value: e.value,
                                                                                type: e.type
                                                                            })
                                                                            await doc.save()
                                                                        } else {
                                                                            return
                                                                        }
                                                                    }
                                                                    if (e.type === "send") {
                                                                        return Admin.findOne({ role: "Admin" }).session(session)
                                                                            .then(async (admin: any) => {
                                                                                if (admin && admin.role === 'Admin') {
                                                                                    let rialInadminWall = _.find(admin.wallet, (e) => e.currency.toString() === rialObj.id.toString())
                                                                                    if (rialInadminWall) {
                                                                                        rialInadminWall.value = Math.ceil(rialInadminWall.value + e.fee)

                                                                                    } else {
                                                                                        admin.wallet.push({
                                                                                            currency: rialObj.id,
                                                                                            value: Math.ceil(e.fee)

                                                                                        })
                                                                                    }
                                                                                    await admin.save()
                                                                                    userPendingTxs = _.filter(userPendingTxs, (v) => v.txUuId !== e.txUuId)
                                                                                    console.log(userPendingTxs)
                                                                                    if (userPendingTxs.length > 0) {
                                                                                        await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: userPendingTxs } }).session(session)
                                                                                    } else {
                                                                                        await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session)
                                                                                    }
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
                                                                    } else if (e.type === "id") {
                                                                        return User.findOne({ _id: userPending.userId }).session(session)
                                                                            .then(async (user: any) => {
                                                                                let curInUserWallet = _.find(user.wallet, (ee) => ee.currency.toString() === e.currencyId.toString())
                                                                                curInUserWallet.value = roundTo8(curInUserWallet.value + e.value)
                                                                                await user.save()
                                                                                userPendingTxs = _.filter(userPendingTxs, (v) => v.txUuId !== e.txUuId)
                                                                                console.log(userPendingTxs)
                                                                                if (userPendingTxs.length > 0) {
                                                                                    await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: userPendingTxs } }).session(session)
                                                                                } else {
                                                                                    await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session)
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
                                                            .then(() => {
                                                                return
                                                            })
                                                            .catch((err) => {
                                                                console.log(err)
                                                                return
                                                            })
                                                            .finally(() => {
                                                                session.endSession()
                                                            })
                                                    } else {
                                                        return
                                                    }
                                                })
                                                .catch(async (err) => {
                                                    if (err === "Tx not found") {
                                                        const session2 = await mongoose.startSession()
                                                        return session2.withTransaction(async () => {
                                                            return User.findOne({ _id: userPending.userId }).session(session2)
                                                                .then(async (user: any) => {
                                                                    if (e.type === "send") {
                                                                        let rialInUserwallet = _.find(user.wallet, (e) => e.currency.toString() === rialObj.id.toString())
                                                                        rialInUserwallet.value = Math.ceil(rialInUserwallet.value + e.fee)
                                                                        let curInUserWallet = _.find(user.wallet, (ee) => ee.currency.toString() === e.currencyId.toString())
                                                                        curInUserWallet.value = roundTo8(curInUserWallet.value + e.value)
                                                                        await user.save()
                                                                    }
                                                                    const newArr = _.filter(userPending.transactions, (v) => v.txUuId !== e.txUuId)
                                                                    if (newArr.length > 0) {
                                                                        await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: newArr } }).session(session2)
                                                                    } else {
                                                                        await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session2)
                                                                    }
                                                                    const newFailed = {
                                                                        userId: userPending.userId,
                                                                        currencyId: e.currencyId,
                                                                        currencyName: e.currencyName,
                                                                        value: e.value,
                                                                        type: e.type,
                                                                    }
                                                                    await FailedTransfers.create([newFailed], { session2 })
                                                                })
                                                                .catch((err) => {
                                                                    throw err
                                                                })
                                                        })
                                                            .catch(() => {
                                                                return
                                                                // throw err
                                                            })
                                                            .finally(() => {
                                                                session2.endSession()
                                                            })
                                                    } else {
                                                        // throw err
                                                        return
                                                    }
                                                })
                                        } else {
                                            console.log("no iddd")
                                            switch (curObj.ab_name) {
                                                case 'BTC':
                                                    checkStatus = () => {
                                                        // return bitcoin.bitcoinValidateByMessage(e.txUuId)
                                                        //     .then((result) => {
                                                        //         return result

                                                        //     }).catch((err) => {
                                                        //         throw err
                                                        //     })
                                                        return new Promise((resolve, reject) => {
                                                            const obj = {
                                                                found: false
                                                            }
                                                            resolve(obj)
                                                        })
                                                    }
                                                    break;
                                                case 'TRX':
                                                    checkStatus = () => {
                                                        return new Promise((resolve, reject) => {
                                                            const obj = {
                                                                found: false
                                                            }
                                                            resolve(obj)
                                                        })
                                                    }
                                                    break;
                                                case 'ETH':
                                                    checkStatus = () => {
                                                        return new Promise((resolve, reject) => {
                                                            const obj = {
                                                                found: false
                                                            }
                                                            resolve(obj)
                                                        })
                                                    }

                                                    break;
                                            }
                                            return Promise.all([checkStatus()])
                                                .then(async (info: any) => {
                                                    if (info[0].found === true) {
                                                        if (info[0].status === 'Confirmed') {
                                                            const session = await mongoose.startSession()
                                                            return session.withTransaction(async () => {
                                                                return SuccessfulTransfers.findOne({ userId: userPending.userId }).session(session)
                                                                    .then(async (doc: any) => {
                                                                        if (!doc) {
                                                                            const successDoc = {
                                                                                userId: userPending.userId,
                                                                                transactions: [{
                                                                                    txId: info[0].txId,
                                                                                    txUuId: e.txUuId,
                                                                                    currencyId: e.currencyId,
                                                                                    currencyName: e.currencyName,
                                                                                    value: info[0].txAmount,
                                                                                    type: e.type
                                                                                }]
                                                                            }
                                                                            await SuccessfulTransfers.create([successDoc], { session })
                                                                        } else {
                                                                            const theTxIndex = _.findIndex(doc.transactions, (v: any) => v.txId === info[0].txUuId)
                                                                            if (theTxIndex === -1) {
                                                                                doc.transactions.push({
                                                                                    txId: info[0].txId,
                                                                                    txUuId: e.txUuId,
                                                                                    currencyId: e.currencyId,
                                                                                    currencyName: e.currencyName,
                                                                                    value: info[0].txAmount,
                                                                                    type: e.type
                                                                                })
                                                                                await doc.save()
                                                                            } else {
                                                                                console.log('reapeted tx!')
                                                                                return
                                                                            }
                                                                        }
                                                                        if (e.type === "send") {
                                                                            return Admin.findOne({ role: "Admin" }).session(session)
                                                                                .then(async (admin: any) => {
                                                                                    if (admin) {
                                                                                        let rialInadminWall = _.find(admin.wallet, (e) => e.currency.toString() === rialObj.id.toString())
                                                                                        if (rialInadminWall) {
                                                                                            rialInadminWall.value = Math.ceil(rialInadminWall.value + e.fee)
                                                                                        } else {
                                                                                            admin.wallet.push({
                                                                                                currency: rialObj.id,
                                                                                                value: Math.ceil(e.fee)
                                                                                            })
                                                                                        }
                                                                                        await admin.save()
                                                                                        userPendingTxs = _.filter(userPendingTxs, (v) => v.txUuId !== e.txUuId)
                                                                                        if (userPendingTxs.length > 0) {
                                                                                            await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: userPendingTxs } }).session(session)
                                                                                        } else {
                                                                                            await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session)
                                                                                        }
                                                                                    } else {
                                                                                        const error = new myError(
                                                                                            'admin not found ',
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
                                                                        } else {
                                                                            userPendingTxs = _.filter(userPendingTxs, (v) => v.txUuId !== e.txUuId)
                                                                            if (userPendingTxs.length > 0) {
                                                                                await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: userPendingTxs } }).session(session)
                                                                            } else {
                                                                                await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session)
                                                                            }
                                                                        }
                                                                    })
                                                                    .catch((err) => {
                                                                        throw err
                                                                    })
                                                            })
                                                                .then(() => {
                                                                    return
                                                                })
                                                                .catch((err) => {
                                                                    console.log(err)
                                                                    return
                                                                })
                                                                .finally(() => {
                                                                    session.endSession()
                                                                })
                                                        } else {
                                                            return
                                                        }
                                                    } else {
                                                        const newFailedTx = {
                                                            txUuId: e.txUuId,
                                                            currencyId: e.currencyId,
                                                            currencyName: e.currencyName,
                                                            value: e.value,
                                                            type: e.type,
                                                            userId: userPending.userId
                                                        }
                                                        const session = await mongoose.startSession()
                                                        return session.withTransaction(async () => {
                                                            return User.findOne({ _id: userPending.userId }).session(session)
                                                                .then(async (user: any) => {
                                                                    if (["send"].includes(e.type)) {
                                                                        let rialInUserwallet = _.find(user.wallet, (e) => e.currency.toString() === rialObj.id.toString())
                                                                        rialInUserwallet.value = Math.ceil(rialInUserwallet.value + e.fee)
                                                                        let curInUserWallet = _.find(user.wallet, (ee) => ee.currency.toString() === e.currencyId.toString())
                                                                        curInUserWallet.value = roundTo8(curInUserWallet.value + e.value)
                                                                        //curInUserWallet.value = curInUserWallet.value + e.value 
                                                                        await user.save()
                                                                    }
                                                                    await FailedTransfers.create([newFailedTx], { session })
                                                                    userPendingTxs = _.filter(userPendingTxs, (v) => v.txUuId !== e.txUuId)
                                                                    if (userPendingTxs.length > 0) {
                                                                        await PendingTransfers.updateOne({ userId: userPending.userId }, { $set: { transactions: userPendingTxs } }).session(session)
                                                                    } else {
                                                                        await PendingTransfers.deleteOne({ userId: userPending.userId }).session(session)
                                                                    }
                                                                })
                                                                .catch((err) => {
                                                                    throw err
                                                                })
                                                        })
                                                            .catch((err) => {
                                                                console.log(err)
                                                                return
                                                            })
                                                            .finally(() => {
                                                                session.endSession()
                                                            })
                                                    }
                                                })
                                                .catch((err) => {
                                                    throw err
                                                })
                                        }
                                    } else {
                                        return
                                    }
                                })
                                .catch((err) => {
                                    console.log(err)
                                    return
                                })
                        })
                    })
                })
                .catch((err) => {
                    throw err
                })
        })
        .catch((err) => {
            console.log(err)
            throw err
        })
}

export default checkStatusOfTxById;