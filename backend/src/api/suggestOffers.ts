const moment = require('moment-timezone')
const math = require('mathjs');
import * as _ from 'lodash'

import { Active_Offers } from '../db/activeOffers';
import { roundToSix } from '../api/getFee'
import { roundTo8 } from '../api/getFee'

function normalizing(arr, asc) {

    let mArr = math.matrix(arr)
    const min = math.min(mArr).valueOf()
    const max = math.max(mArr).valueOf()
    let nArr = mArr
    let i
    if (max == min) {
        for (i = 0; i < math.size(mArr).get([0]); i++) {
            nArr = math.subset(nArr, math.index(i), max)
        }
        return nArr.valueOf()
    }
    if (asc) {
        for (i = 0; i < math.size(mArr).get([0]); i++) {
            nArr = math.subset(nArr, math.index(i), (((mArr.get([i]) - min) / (max - min)) + 1))
        }
        return nArr.valueOf()
    } else {
        for (i = 0; i < math.size(mArr).get([0]); i++) {
            nArr = math.subset(nArr, math.index(i), 2 - (((mArr.get([i]) - min) / (max - min))))
        }
        return nArr.valueOf()
    }
}

export const knapsackComputation = ({ offers, capacity, type, form }) => {
    let userIds = []
    let modifiedOffers = []
    const distUsersOffersMap = offers.map((e) => {
        if (!userIds.includes(e.userId.toString())) {
            modifiedOffers.push(e)
            userIds.push(e.userId.toString())
        }
    })
    return Promise.all(distUsersOffersMap)
        .then(() => {
            let offerIds = []
            let offerFeatures = []
            let prices = []
            let values = []
            let expDate = []
            modifiedOffers.forEach(off => {
                offerIds.push(off._id.toString())
                if (type === 'buy') {
                    prices.push(off.curTakenVal)
                    values.push(off.curGivenVal)
                } else if (type = 'sell') {
                    prices.push(off.curGivenVal)
                    values.push(off.curTakenVal)
                }
                expDate.push(Math.round((moment(off.expDate) - moment()) / 60000))
            })
            if (type === 'buy') {
                prices = normalizing(prices, false)
            } else if (type === 'sell') {
                prices = normalizing(prices, true)
            }
            expDate = normalizing(expDate, false)
            let weights = values

            offerFeatures = math.concat(math.concat(math.reshape(math.matrix(prices), [prices.length, 1]),
                math.reshape(math.matrix(values), [values.length, 1]), 1),
                math.reshape(math.matrix(expDate), [expDate.length, 1]), 1).valueOf()
            let coefs = [[0.3], [0.2], [0.5]]
            let data = prepForKS(offerIds, offerFeatures, weights, coefs)
            let sugOffers
            if (form === '0-1') {
                sugOffers = knapsack(data, capacity)
            } else if (form === 'fractional') {
                sugOffers = fractionalKnapsack(data, capacity)
            }
            return sugOffers
        })
        .catch((err) => {
            throw err
        })
}

export function suggestOffers({ userId, price, capacity, offerType, currencyId, rialId }) {
    let query = []
    if (offerType == 'buy') {
        let maxPrice = price + 0.05 * price
        query = [
            { userId: { $ne: userId } },
            { expDate: { $gt: Date.now() } },
            { curTakenId: rialId },
            { curGivenId: currencyId },
            { curTakenVal: { $lt: Number(maxPrice) } },
            //{ curGivenVal: { $gte: Number(capacity) } }
        ]
    } else if (offerType == 'sell') {
        let maxPrice = price + 0.1 * price
        query = [
            { userId: { $ne: userId } },
            { expDate: { $gt: Date.now() } },
            { curGivenId: rialId },
            { curTakenId: currencyId },
            { curGivenVal: { $lt: Number(maxPrice) } },
            //{ curTakenVal: { $gte: Number(capacity) } }
        ]
    }
    return Active_Offers.find({ $and: query })
        .then((offers) => {
            if (offers && Array.isArray(offers) && offers.length > 0) {
                if (offerType == 'buy') {
                    return knapsackComputation({ offers, capacity, type: 'buy', form: 'fractional' })
                        .then((sugOffers) => {
                            return sugOffers
                        })
                        .catch((err) => {
                            throw err
                        })
                } else if (offerType == 'sell') {
                    return knapsackComputation({ offers, capacity, type: 'sell', form: 'fractional' })
                        .then((sugOffers) => {
                            return sugOffers
                        })
                        .catch((err) => {
                            throw err
                        })
                }
            } else {
                console.log("There is no offer to suggest")
                throw("There is no offer to suggest")
            }
        })
        .catch((err) => {
            console.log("Error in middlewares/suggestOffers.ts : ", err)
        })
}

var countDecimals = function (value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split(".")[1].length || 0;
}
function knapsack(items, capacity) {
    console.log('items: ', items)
    // This implementation uses dynamic programming.
    // Variable 'memo' is a grid(2-dimentional array) to store optimal solution for sub-problems,
    // which will be later used as the code execution goes on.
    // This is called memoization in programming.
    // The cell will store best solution objects for different capacities and selectable items.
    var memo = [];
    let maxdigits: number = 0;
    items.forEach(element => {
        let f = (Number(countDecimals(element.w)))
        if (f > maxdigits) {
            maxdigits = Number(f)
        }
    });
    let step = Math.pow(10, maxdigits)
    // Filling the sub-problem solutions grid.
    for (var i = 0; i < items.length; i++) {
        // Variable 'cap' is the capacity for sub-problems. In this example, 'cap' ranges from 1 to 6.
        var row = [];
        for (var cap = 1; cap <= capacity * step; cap = cap + 1) {
            row.push(getSolution(i, cap));
        }
        memo.push(row);
    }

    // The right-bottom-corner cell of the grid contains the final solution for the whole problem.
    return (getLast());

    function getLast() {
        var lastRow = memo[memo.length - 1];
        return lastRow[lastRow.length - 1];
    }

    function getSolution(row, cap) {
        const NO_SOLUTION = { maxValue: 0, subset: [] };
        // the column number starts from zero.
        var col = cap - 1;
        var lastItem = items[row];
        // The remaining capacity for the sub-problem to solve.
        var remaining = cap - lastItem.w * step;

        // Refer to the last solution for this capacity,
        // which is in the cell of the previous row with the same column
        var lastSolution = row > 0 ? memo[row - 1][col] || NO_SOLUTION : NO_SOLUTION;
        // Refer to the last solution for the remaining capacity,
        // which is in the cell of the previous row with the corresponding column
        var lastSubSolution = row > 0 ? memo[row - 1][remaining - 1] || NO_SOLUTION : NO_SOLUTION;

        // If any one of the items weights greater than the 'cap', return the last solution
        if (remaining < 0) {
            return lastSolution;
        }

        // Compare the current best solution for the sub-problem with a specific capacity
        // to a new solution trial with the lastItem(new item) added
        var lastValue = lastSolution.maxValue;
        var lastSubValue = lastSubSolution.maxValue;

        var newValue = lastSubValue + lastItem.v;
        if (newValue >= lastValue) {
            // copy the subset of the last sub-problem solution
            var _lastSubSet = lastSubSolution.subset.slice();
            _lastSubSet.push(lastItem);
            return { maxValue: newValue, subset: _lastSubSet };
        } else {
            return lastSolution;
        }
    }
}

function prepForKS(offerIds, offerFeatures, weights, coefs) {

    let values = math.multiply(math.matrix(offerFeatures), math.matrix(coefs))
    let data = math.concat(math.concat(math.reshape(math.matrix(offerIds), [offerIds.length, 1]), values, 1),
        math.reshape(math.matrix(weights), [weights.length, 1]), 1).valueOf()
    let dataObj = Object.values(data.reduce((c, [n, v, w]) => {
        c[n] = c[n] || { id: n, v, w };
        c[n].v = v
        c[n].w = w
        return c;
    }, {}));
    return dataObj
}


// JavaScript program to solve fractional Knapsack Problem 



// Main greedy function to solve problem 
function fractionalKnapsack(items, capacity) {
    items = _.orderBy(items, ['v'], 'desc')
    let sugOfferIds = []
    for( let i = 0; i <= items.length - 1; i++) {
        const curWt = items[i].w
        if (capacity - curWt >= 0) {
            capacity -= curWt
            sugOfferIds.push({
                id: items[i].id,
                w: curWt,
                v: items[i].v
            })
        } else {
            const fraction = capacity / curWt
            capacity = capacity - (curWt * fraction)
            sugOfferIds.push({
                id: items[i].id,
                w:  roundToSix(curWt * fraction),
                v: items[i].v
            })
            break
        }
    }
    return sugOfferIds
}

export function bestUtxo(items, capacity) {
    
    items = _.orderBy(items, ['amount'], 'asc')
    let suggUtxoObj = {
        suggUtxo: [],
        remainedVal: 0,
        changeAddress : undefined

    }
    for( let i = 0; i <= items.length - 1; i++) {
        const curWt = items[i].amount
        if (capacity - curWt >= 0) {
            capacity -= curWt
            suggUtxoObj.suggUtxo.push({
                txid: items[i].txid,
                vout: items[i].vout
            })
        } else {
            suggUtxoObj.suggUtxo.push({
                txid: items[i].txid,
                vout: items[i].vout,
            })
            suggUtxoObj.remainedVal = roundTo8(curWt - capacity)
            suggUtxoObj.changeAddress = items[i].address
            break
        }
    }
    return suggUtxoObj
}

export function offlineBestUtxo(items, capacity) {
    
    items = _.orderBy(items, ['amount'], 'asc')
    let suggUtxoObj = {
        suggUtxo: [],
        utxoDetail : [],
        remainedVal: 0,
        changeAddress : undefined

    }
    for( let i = 0; i <= items.length - 1; i++) {
        const curWt = items[i].amount
        if (capacity - curWt >= 0) {
            capacity -= curWt
            suggUtxoObj.suggUtxo.push({
                txid: items[i].txid,
                vout: items[i].vout,
            })
            suggUtxoObj.utxoDetail.push({
                txid: items[i].txid,
                vout: items[i].vout,
                scriptPubKey:items[i].scriptPubKey,
                amount: items[i].amount
            })

        } else {
            suggUtxoObj.suggUtxo.push({
                txid: items[i].txid,
                vout: items[i].vout,
            })
            suggUtxoObj.utxoDetail.push({
                txid: items[i].txid,
                vout: items[i].vout,
                scriptPubKey:items[i].scriptPubKey,
                amount: items[i].amount
            })
            suggUtxoObj.remainedVal = roundTo8(curWt - capacity)
            suggUtxoObj.changeAddress = items[i].address
            break
        }
    }
    return suggUtxoObj
}

