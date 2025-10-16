import * as _ from 'lodash'
import { Fee } from "../db/fee"
import myError from "./myError"

export const getFee = ({ userType, action }) => {
    console.log("usertype",userType, "action",action)
    return Fee.findOne({ userType: userType })
    .then((doc: any) => {
        if (doc && doc.userType === Number(userType)) {
            const theItem = _.find(doc.actionValue, (v) => v.action === action)
            if (theItem && theItem.value && !Number.isNaN(Number(theItem.value))) {
                return Number(theItem.value)
            } else {
                const error = new myError(
                    'The fee document does not exist!',
                    400,
                    11,
                    'سند مربوط به کارمزد یافت نشد!',
                    'خطا رخ داد'
                )
                throw error                
            }
        } else {
            const error = new myError(
                'The fee document does not exist!',
                400,
                11,
                'سند مربوط به کارمزد یافت نشد!',
                'خطا رخ داد'
            )
            throw error
        }
    })
    .catch((err) => {
        throw err
    })
}

export const computeFee = ({ curGivenVal, curTakenVal, feeValuePercent }) => {
    return Number(curGivenVal) * Number(curTakenVal) * Number(feeValuePercent) / 100
}

export function roundToSix(num) {
    return +(Math.round(Number(num + "e+6")) + "e-6");
}
export function roundTo8(num) {
    num = num.toString()
    const arr = num.split(".")
    if (arr.length === 1) {
        return Number(num)
    } else if (arr[1].length <= 8) {
        return Number(num)

    } else {
        let floatPart = arr[1].slice(0, 8)
        for (let i = 8; i >= 0; i--) {
            if (floatPart[i] === 0) {
                floatPart = floatPart.slice(0, i)
            } else {
                break
            }
        }

        return Number(arr[0] + "." + floatPart)
    }

}

export function feeCalculator(inCount, outCount) {
    return roundTo8(((180*inCount + 34*outCount)+10) * 0.00000001);
}