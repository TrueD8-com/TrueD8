import { LocalDaily } from "../db/localDaily"
import { LocalHourly } from "../db/localHourly"
import { LocalMonthly } from "../db/localMonthly"
import { LocalWeekly } from "../db/localWeekly"
import { LocalYearly } from "../db/localYearly"

import { Accepted_Offers } from "../db/acceptedOffers"
import myError from '../api/myError'
var moment = require('moment');
import "moment-timezone"
import { Currencies } from "../db/currencies"
import * as _ from 'lodash'

export const localHourlySetPrice = async () => {

    return Currencies.find()
        .then((curs) => {
            if (curs && curs.length > 0) {
                const rialObj = _.find(curs, (i) => i.ab_name === "IRR")
                if (rialObj) {
                    const nowHour = moment().tz('Iran').startOf('hours')
                    const ago = moment(nowHour).subtract(1, 'hours')
                    return LocalHourly.findOne().sort({ name: -1 }).limit(1)
                        .then((lastDoc) => {
                            if (lastDoc) {
                                const lastSavedHour = moment(lastDoc.name).startOf('hours').valueOf()
                                const lostedHours = moment.duration(nowHour.diff(lastSavedHour)).asHours()
                                for (let i = 1; i <= lostedHours; i++) {
                                    let curArr = []
                                    let startHour = moment(lastSavedHour).add((i - 1), 'hours')
                                    let nextHour = moment(lastSavedHour).add((i), 'hours')
                                    return Accepted_Offers.find({ created_at: { $gt: startHour, $lte: nextHour } })
                                        .then((offers) => {
                                            if (offers && offers.length > 0) {
                                                let curIds = []
                                                offers.forEach((off: any) => {
                                                    if (off.curGivenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curTakenId.toString()))) {
                                                            curIds.push(off.curTakenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curTakenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curTakenVal)
                                                            curObj.price = Number(off.curGivenVal)

                                                            if (Number(off.curGivenVal) < Number(curObj.min)) {
                                                                curObj.min = Number(off.curGivenVal)
                                                            }
                                                            if (Number(off.curGivenVal) > Number(curObj.max)) {
                                                                curObj.max = Number(off.curGivenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curTakenId,
                                                                price: Number(off.curGivenVal),
                                                                volume: Number(off.curTakenVal),
                                                                min: Number(off.curGivenVal),
                                                                max: Number(off.curGivenVal)
                                                            })
                                                        }
                                                    } else if (off.curTakenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curGivenId.toString()))) {
                                                            curIds.push(off.curGivenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curGivenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curGivenVal)
                                                            curObj.price = Number(off.curTakenVal)
                                                            if (off.curTakenVal < curObj.min) {
                                                                curObj.min = Number(off.curTakenVal)
                                                            }
                                                            if (off.curTakenVal > curObj.max) {
                                                                curObj.max = Number(off.curTakenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curGivenId,
                                                                price: Number(off.curTakenVal),
                                                                volume: Number(off.curGivenVal),
                                                                min: Number(off.curTakenVal),
                                                                max: Number(off.curTakenVal)
                                                            })
                                                        }
                                                    }
                                                })
                                                if (curs.length - 1 !== curIds.length) {
                                                    curs.forEach((cur) => {
                                                        if (!(curIds.includes(cur._id.toString())) && cur._id.toString() != rialObj._id.toString()) {
                                                            curArr.push({
                                                                price: 0,
                                                                currencyId: cur._id,
                                                                volume: 0,
                                                                min: 0,
                                                                max: 0
                                                            })
                                                        }
                                                    })
                                                }
                                                const doc = {
                                                    name: nextHour,
                                                    currencies: curArr
                                                }
                                                return LocalHourly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            } else {
                                                curs.forEach((cur) => {
                                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                                        curArr.push({
                                                            currencyId: cur._id,
                                                            volume: 0,
                                                            price: 0,
                                                            min: 0,
                                                            max: 0
                                                        })
                                                    }
                                                })
                                                const doc = {
                                                    name: nextHour,
                                                    currencies: curArr
                                                }
                                                return LocalHourly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("the error is", err)
                                        })
                                }
                            } else {
                                let curArr2 = []
                                curs.forEach((cur) => {
                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                        curArr2.push({
                                            currencyId: cur._id,
                                            volume: 0,
                                            price: 0,
                                            min: 0,
                                            max: 0
                                        })
                                    }
                                })
                                const doc = {
                                    name: nowHour,
                                    currencies: curArr2
                                }
                                return LocalHourly.create([doc])
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                } else {
                    console.log("rial is not exsist on database")
                }
            } else {
                console.log("there is no currency on database")
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

export const localDailySetPrice = async () => {

    return Currencies.find()
        .then((curs) => {
            if (curs && curs.length > 0) {
                const rialObj = _.find(curs, (i) => i.ab_name === "IRR")
                if (rialObj) {
                    const nowDay = moment().tz('Iran').startOf('days')
                    const ago = moment(nowDay).subtract(1, 'days')
                    return LocalDaily.findOne().sort({ name: -1 }).limit(1)
                        .then((lastDoc) => {
                            if (lastDoc) {
                                const lastSavedDay = moment(lastDoc.name).startOf('days').valueOf()
                                const lostedDays = moment.duration(nowDay.diff(lastSavedDay)).asDays()
                                for (let i = 1; i <= lostedDays; i++) {
                                    let curArr = []
                                    let startDay = moment(lastSavedDay).add((i - 1), 'days')
                                    let nextDay = moment(lastSavedDay).add((i), 'days')
                                    return Accepted_Offers.find({ created_at: { $gt: startDay, $lte: nextDay } })
                                        .then((offers) => {
                                            if (offers && offers.length > 0) {
                                                let curIds = []
                                                offers.forEach((off: any) => {
                                                    if (off.curGivenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curTakenId.toString()))) {
                                                            curIds.push(off.curTakenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curTakenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curTakenVal)
                                                            curObj.price = Number(off.curGivenVal)

                                                            if (Number(off.curGivenVal) < Number(curObj.min)) {
                                                                curObj.min = Number(off.curGivenVal)
                                                            }
                                                            if (Number(off.curGivenVal) > Number(curObj.max)) {
                                                                curObj.max = Number(off.curGivenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curTakenId,
                                                                price: Number(off.curGivenVal),
                                                                volume: Number(off.curTakenVal),
                                                                min: Number(off.curGivenVal),
                                                                max: Number(off.curGivenVal)
                                                            })
                                                        }
                                                    } else if (off.curTakenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curGivenId.toString()))) {
                                                            curIds.push(off.curGivenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curGivenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curGivenVal)
                                                            curObj.price = Number(off.curTakenVal)
                                                            if (off.curTakenVal < curObj.min) {
                                                                curObj.min = Number(off.curTakenVal)
                                                            }
                                                            if (off.curTakenVal > curObj.max) {
                                                                curObj.max = Number(off.curTakenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curGivenId,
                                                                price: Number(off.curTakenVal),
                                                                volume: Number(off.curGivenVal),
                                                                min: Number(off.curTakenVal),
                                                                max: Number(off.curTakenVal)
                                                            })
                                                        }
                                                    }
                                                })
                                                if (curs.length - 1 !== curIds.length) {
                                                    curs.forEach((cur) => {
                                                        if (!(curIds.includes(cur._id.toString())) && cur._id.toString() != rialObj._id.toString()) {
                                                            curArr.push({
                                                                price: 0,
                                                                currencyId: cur._id,
                                                                volume: 0,
                                                                min: 0,
                                                                max: 0
                                                            })
                                                        }
                                                    })
                                                }
                                                const doc = {
                                                    name: nextDay,
                                                    currencies: curArr
                                                }
                                                return LocalDaily.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            } else {
                                                curs.forEach((cur) => {
                                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                                        curArr.push({
                                                            currencyId: cur._id,
                                                            volume: 0,
                                                            price: 0,
                                                            min: 0,
                                                            max: 0
                                                        })
                                                    }
                                                })
                                                const doc = {
                                                    name: nextDay,
                                                    currencies: curArr
                                                }
                                                return LocalDaily.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("the error is", err)
                                        })
                                }
                            } else {
                                let curArr2 = []
                                curs.forEach((cur) => {
                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                        curArr2.push({
                                            currencyId: cur._id,
                                            volume: 0,
                                            price: 0,
                                            min: 0,
                                            max: 0
                                        })
                                    }
                                })
                                const doc = {
                                    name: nowDay,
                                    currencies: curArr2
                                }
                                return LocalDaily.create([doc])
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                } else {
                    console.log("rial is not exsist on database")
                }
            } else {
                console.log("there is no currency on database")
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

export const localWeeklySetPrice = async () => {

    return Currencies.find()
        .then((curs) => {
            if (curs) {
                const rialObj = _.find(curs, (i) => i.ab_name === "IRR" )
                if (rialObj) {
                    const nowWeek = moment().tz('Iran').startOf('weeks')
                    const ago = moment(nowWeek).subtract(1, 'weeks')
                    return LocalWeekly.findOne().sort({ name: -1 }).limit(1)
                        .then((lastDoc) => {
                            if (lastDoc) {
                                const lastSavedWeek = moment(lastDoc.name).startOf('weeks').valueOf()
                                const lostedWeeks = moment.duration(nowWeek.diff(lastSavedWeek)).asWeeks()
                                for (let i = 1; i <= lostedWeeks; i++) {
                                    let curArr = []
                                    let lstSavedWeek = lastSavedWeek
                                    let startWeek = moment(lstSavedWeek).add((i - 1), 'weeks')
                                    let nextWeek = moment(lstSavedWeek).add((i), 'weeks')
                                    return Accepted_Offers.find({ created_at: { $gt: startWeek, $lte: nextWeek } })
                                        .then((offers) => {
                                            if (offers && offers.length > 0) {
                                                let curIds = []
                                                offers.forEach((off: any) => {
                                                    if (off.curGivenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curTakenId.toString()))) {
                                                            curIds.push(off.curTakenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curTakenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curTakenVal)
                                                            curObj.price = Number(off.curGivenVal)

                                                            if (Number(off.curGivenVal) < Number(curObj.min)) {
                                                                curObj.min = Number(off.curGivenVal)
                                                            }
                                                            if (Number(off.curGivenVal) > Number(curObj.max)) {
                                                                curObj.max = Number(off.curGivenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curTakenId,
                                                                price: Number(off.curGivenVal),
                                                                volume: Number(off.curTakenVal),
                                                                min: Number(off.curGivenVal),
                                                                max: Number(off.curGivenVal)
                                                            })
                                                        }
                                                    } else if (off.curTakenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curGivenId.toString()))) {
                                                            curIds.push(off.curGivenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curGivenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curGivenVal)
                                                            curObj.price = Number(off.curTakenVal)
                                                            if (off.curTakenVal < curObj.min) {
                                                                curObj.min = Number(off.curTakenVal)
                                                            }
                                                            if (off.curTakenVal > curObj.max) {
                                                                curObj.max = Number(off.curTakenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curGivenId,
                                                                price: Number(off.curTakenVal),
                                                                volume: Number(off.curGivenVal),
                                                                min: Number(off.curTakenVal),
                                                                max: Number(off.curTakenVal)
                                                            })
                                                        }
                                                    }
                                                })
                                                if (curs.length - 1 !== curIds.length) {
                                                    curs.forEach((cur) => {
                                                        if (!(curIds.includes(cur._id.toString())) && cur._id.toString() != rialObj._id.toString()) {
                                                            curArr.push({
                                                                price: 0,
                                                                currencyId: cur._id,
                                                                volume: 0,
                                                                min: 0,
                                                                max: 0
                                                            })
                                                        }
                                                    })
                                                }
                                                const doc = {
                                                    name: nextWeek,
                                                    currencies: curArr
                                                }
                                                return LocalWeekly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            } else {
                                                curs.forEach((cur) => {
                                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                                        curArr.push({
                                                            currencyId: cur._id,
                                                            volume: 0,
                                                            price: 0,
                                                            min: 0,
                                                            max: 0
                                                        })
                                                    }
                                                })
                                                const doc = {
                                                    name: nextWeek,
                                                    currencies: curArr
                                                }
                                                return LocalWeekly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("the error is", err)
                                        })
                                }
                            } else {
                                let curArr2 = []
                                curs.forEach((cur) => {
                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                        curArr2.push({
                                            currencyId: cur._id,
                                            volume: 0,
                                            price: 0,
                                            min: 0,
                                            max: 0
                                        })
                                    }
                                })
                                const doc = {
                                    name: nowWeek,
                                    currencies: curArr2
                                }
                                return LocalWeekly.create([doc])
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }

                        })
                        .catch((err) => {
                            console.log(err)
                        })
                } else {
                    console.log("rial is not exsist on database")
                }
            } else {
                console.log("there is no currency on database")
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

export const localMonthlySetPrice = async () => {

    return Currencies.find()
        .then((curs) => {
            if (curs) {
                const rialObj = _.find(curs, (i) => i.ab_name === "IRR" )
                if (rialObj) {
                    const nowMonth = moment().tz('Iran').startOf('month')
                    const ago = moment(nowMonth).subtract(1, 'month')
                    return LocalMonthly.findOne().sort({ name: -1 }).limit(1)
                        .then((lastDoc) => {
                            if (lastDoc) {
                                const lastSavedMonth = moment(lastDoc.name).startOf('month').valueOf()
                                const lostedMonths = moment.duration(nowMonth.diff(lastSavedMonth)).asMonths()
                                for (let i = 1; i <= lostedMonths; i++) {
                                    let curArr = []
                                    let startMonth = moment(lastSavedMonth).add((i - 1), 'month')
                                    let nextMonth = moment(lastSavedMonth).add((i), 'month')
                                    return Accepted_Offers.find({ created_at: { $gt: startMonth, $lte: nextMonth } })
                                        .then((offers) => {
                                            if (offers && offers.length > 0) {
                                                let curIds = []
                                                offers.forEach((off: any) => {
                                                    if (off.curGivenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curTakenId.toString()))) {
                                                            curIds.push(off.curTakenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curTakenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curTakenVal)
                                                            curObj.price = Number(off.curGivenVal)

                                                            if (Number(off.curGivenVal) < Number(curObj.min)) {
                                                                curObj.min = Number(off.curGivenVal)
                                                            }
                                                            if (Number(off.curGivenVal) > Number(curObj.max)) {
                                                                curObj.max = Number(off.curGivenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curTakenId,
                                                                price: Number(off.curGivenVal),
                                                                volume: Number(off.curTakenVal),
                                                                min: Number(off.curGivenVal),
                                                                max: Number(off.curGivenVal)
                                                            })
                                                        }
                                                    } else if (off.curTakenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curGivenId.toString()))) {
                                                            curIds.push(off.curGivenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curGivenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curGivenVal)
                                                            curObj.price = Number(off.curTakenVal)
                                                            if (off.curTakenVal < curObj.min) {
                                                                curObj.min = Number(off.curTakenVal)
                                                            }
                                                            if (off.curTakenVal > curObj.max) {
                                                                curObj.max = Number(off.curTakenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curGivenId,
                                                                price: Number(off.curTakenVal),
                                                                volume: Number(off.curGivenVal),
                                                                min: Number(off.curTakenVal),
                                                                max: Number(off.curTakenVal)
                                                            })
                                                        }
                                                    }
                                                })
                                                if (curs.length - 1 !== curIds.length) {
                                                    curs.forEach((cur) => {
                                                        if (!(curIds.includes(cur._id.toString())) && cur._id.toString() != rialObj._id.toString()) {
                                                            curArr.push({
                                                                price: 0,
                                                                currencyId: cur._id,
                                                                volume: 0,
                                                                min: 0,
                                                                max: 0
                                                            })
                                                        }
                                                    })
                                                }
                                                const doc = {
                                                    name: nextMonth,
                                                    currencies: curArr
                                                }
                                                return LocalMonthly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            } else {
                                                curs.forEach((cur) => {
                                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                                        curArr.push({
                                                            currencyId: cur._id,
                                                            volume: 0,
                                                            price: 0,
                                                            min: 0,
                                                            max: 0
                                                        })
                                                    }
                                                })
                                                const doc = {
                                                    name: nextMonth,
                                                    currencies: curArr
                                                }
                                                return LocalMonthly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("the error is", err)
                                        })
                                }
                            } else {
                                let curArr2 = []
                                curs.forEach((cur) => {
                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                        curArr2.push({
                                            currencyId: cur._id,
                                            volume: 0,
                                            price: 0,
                                            min: 0,
                                            max: 0
                                        })
                                    }
                                })
                                const doc = {
                                    name: nowMonth,
                                    currencies: curArr2
                                }
                                return LocalMonthly.create([doc])
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                } else {
                    console.log("rial is not exsist on database")
                }
            } else {
                console.log("there is no currency on database")
            }
        })
        .catch((err) => {
            console.log(err)
        })
}

export const localYearlySetPrice = async () => {

    return Currencies.find()
        .then((curs) => {
            if (curs) {
                const rialObj = _.find(curs, (i) => i.ab_name === "IRR" )
                if (rialObj) {
                    const nowYear = moment().tz('Iran').startOf('year')
                    const ago = moment(nowYear).subtract(1, 'year')
                    return LocalYearly.findOne().sort({ name: -1 }).limit(1)
                        .then((lastDoc) => {
                            if (lastDoc) {
                                const lastSavedYear = moment(lastDoc.name).startOf('year').valueOf()
                                const lostedYears = moment.duration(nowYear.diff(lastSavedYear)).asYears()
                                for (let i = 1; i <= lostedYears; i++) {
                                    let curArr = []
                                    let lstSavedYear = lastSavedYear
                                    let startYear = moment(lstSavedYear).add((i - 1), 'year')
                                    let nextYear = moment(lstSavedYear).add((i), 'year')
                                    return Accepted_Offers.find({ created_at: { $gt: startYear, $lte: nextYear } })
                                        .then((offers) => {
                                            if (offers && offers.length > 0) {
                                                let curIds = []
                                                offers.forEach((off: any) => {
                                                    if (off.curGivenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curTakenId.toString()))) {
                                                            curIds.push(off.curTakenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curTakenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curTakenVal)
                                                            curObj.price = Number(off.curGivenVal)

                                                            if (Number(off.curGivenVal) < Number(curObj.min)) {
                                                                curObj.min = Number(off.curGivenVal)
                                                            }
                                                            if (Number(off.curGivenVal) > Number(curObj.max)) {
                                                                curObj.max = Number(off.curGivenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curTakenId,
                                                                price: Number(off.curGivenVal),
                                                                volume: Number(off.curTakenVal),
                                                                min: Number(off.curGivenVal),
                                                                max: Number(off.curGivenVal)
                                                            })
                                                        }
                                                    } else if (off.curTakenId.toString() === rialObj._id.toString()) {
                                                        if (!(curIds.includes(off.curGivenId.toString()))) {
                                                            curIds.push(off.curGivenId.toString())
                                                        }
                                                        const curObj = _.find(curArr, (i) => i.currencyId.toString() === off.curGivenId.toString())
                                                        if (curObj) {
                                                            curObj.volume += Number(off.curGivenVal)
                                                            curObj.price = Number(off.curTakenVal)
                                                            if (off.curTakenVal < curObj.min) {
                                                                curObj.min = Number(off.curTakenVal)
                                                            }
                                                            if (off.curTakenVal > curObj.max) {
                                                                curObj.max = Number(off.curTakenVal)
                                                            }
                                                        } else {
                                                            curArr.push({
                                                                currencyId: off.curGivenId,
                                                                price: Number(off.curTakenVal),
                                                                volume: Number(off.curGivenVal),
                                                                min: Number(off.curTakenVal),
                                                                max: Number(off.curTakenVal)
                                                            })
                                                        }
                                                    }
                                                })
                                                if (curs.length - 1 !== curIds.length) {
                                                    curs.forEach((cur) => {
                                                        if (!(curIds.includes(cur._id.toString())) && cur._id.toString() != rialObj._id.toString()) {
                                                            curArr.push({
                                                                price: 0,
                                                                currencyId: cur._id,
                                                                volume: 0,
                                                                min: 0,
                                                                max: 0
                                                            })
                                                        }
                                                    })
                                                }
                                                const doc = {
                                                    name: nextYear,
                                                    currencies: curArr
                                                }
                                                return LocalYearly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            } else {
                                                curs.forEach((cur) => {
                                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                                        curArr.push({
                                                            currencyId: cur._id,
                                                            volume: 0,
                                                            price: 0,
                                                            min: 0,
                                                            max: 0
                                                        })
                                                    }
                                                })
                                                const doc = {
                                                    name: nextYear,
                                                    currencies: curArr
                                                }
                                                return LocalYearly.create([doc])
                                                    .catch((err) => {
                                                        console.log(err)
                                                    })
                                            }
                                        })
                                        .catch((err) => {
                                            console.log("the error is", err)
                                        })
                                }
                            } else {
                                let curArr2 = []
                                curs.forEach((cur) => {
                                    if (cur._id.toString() !== rialObj._id.toString()) {
                                        curArr2.push({
                                            currencyId: cur._id,
                                            volume: 0,
                                            price: 0,
                                            min: 0,
                                            max: 0
                                        })
                                    }
                                })
                                const doc = {
                                    name: nowYear,
                                    currencies: curArr2
                                }
                                return LocalYearly.create([doc])
                                    .catch((err) => {
                                        console.log(err)
                                    })
                            }
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                } else {
                    console.log("rial is not exsist on database")
                }
            } else {
                console.log("there is no currency on database")
            }
        })
        .catch((err) => {
            console.log(err)
        })
}