"use strict";
//@ts-ignore
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBuyandSellSockets = exports.handleAcceptOfferSockets = exports.handleCreateOfferSockets = void 0;
var getFee_1 = require("./getFee");
var redisMethods = __importStar(require("./redis"));
var socket_1 = require("./socket");
var handleCreateOfferSockets = function (_a) {
    var rialObj = _a.rialObj, userWallet = _a.userWallet, rialInWallet = _a.rialInWallet, newActiveOffers = _a.newActiveOffers, bodyOffer = _a.bodyOffer, hasNewOffer = _a.hasNewOffer, status = _a.status;
    var modifiedBodyOffer;
    if (status === "sell") {
        modifiedBodyOffer = {
            userId: bodyOffer.userId,
            offerId: bodyOffer.offerId,
            curTakenId: bodyOffer.curTakenId,
            curGivenId: bodyOffer.curGivenId,
            Gvalue: bodyOffer.curGivenVal,
            Tvalue: bodyOffer.curTakenVal,
            expireDate: bodyOffer.expDate,
            createDate: Date.now(),
            txType: "sell",
            theUsersOffer: true,
        };
    }
    else if (status === "buy") {
        modifiedBodyOffer = {
            userId: bodyOffer.userId,
            offerId: bodyOffer.offerId,
            curTakenId: bodyOffer.curTakenId,
            curGivenId: bodyOffer.curGivenId,
            Tvalue: bodyOffer.curGivenVal,
            Gvalue: bodyOffer.curTakenVal,
            expireDate: bodyOffer.expDate,
            createDate: Date.now(),
            txType: "buy",
            theUsersOffer: true,
        };
    }
    if (!hasNewOffer) {
        newActiveOffers.push(modifiedBodyOffer);
    }
    var onlineLoginUsers = (0, socket_1.getonlineLoginUsers)();
    //    .then((allSockets: any) => {
    newActiveOffers.map(function (newActiveOffer) {
        redisMethods
            .hashSetMembers(newActiveOffer.userId.toString())
            .then(function (userSockets) {
            if (userSockets &&
                Array.isArray(userSockets) &&
                userSockets.length > 0) {
                // modifiedBodyOffer['GpersianName'] = curGivenObj ? curGivenObj.per_name : undefined
                if (newActiveOffer.curTakenId.toString() === rialObj._id.toString()) {
                    redisMethods
                        .hashGetAll(newActiveOffer.curGivenId.toString())
                        .then(function (curGivenObj) {
                        var modifiedUserWallet1 = {
                            shortName: curGivenObj.ab_name,
                            value: (0, getFee_1.roundToSix)(userWallet.value),
                            commitment: (0, getFee_1.roundToSix)(userWallet.commitment),
                        };
                        var modifiedUserWallet2 = {
                            shortName: "IRR",
                            value: Math.ceil(rialInWallet.value),
                            commitment: Math.ceil(rialInWallet.commitment),
                        };
                        newActiveOffer["owner"] = true;
                        // userSockets.map((e) => {
                        if (newActiveOffer.theUsersOffer) {
                            onlineLoginUsers.emit("new_wallet_values", [
                                modifiedUserWallet1,
                                modifiedUserWallet2,
                            ]);
                        }
                        onlineLoginUsers.emit("new_offer", newActiveOffer);
                        //   })
                    })
                        .catch(function (err) {
                        console.log(err);
                    });
                }
                else if (newActiveOffer.curGivenId.toString() === rialObj._id.toString()) {
                    redisMethods
                        .hashGetAll(newActiveOffer.curTakenId.toString())
                        .then(function (curTakenObj) {
                        var modifiedUserWallet1 = {
                            shortName: "IRR",
                            value: Math.ceil(rialInWallet.value),
                            commitment: Math.ceil(rialInWallet.commitment),
                        };
                        var modifiedUserWallet2 = {
                            shortName: curTakenObj.ab_name,
                            value: (0, getFee_1.roundToSix)(userWallet.value),
                            commitment: (0, getFee_1.roundToSix)(userWallet.commitment),
                        };
                        newActiveOffer["owner"] = true;
                        // userSockets.map((e) => {
                        if (newActiveOffer.theUsersOffer) {
                            onlineLoginUsers.emit("new_wallet_values", [
                                modifiedUserWallet1,
                                modifiedUserWallet2,
                            ]);
                        }
                        onlineLoginUsers.emit("new_offer", newActiveOffer);
                        //   })
                    })
                        .catch(function (err) {
                        console.log(err);
                    });
                }
                // allSockets = _.filter(allSockets, (v) => !userSockets.includes(v))
                newActiveOffer["owner"] = false;
                // allSockets.map((e) => {
                //     onlineLoginUsers.to(e).emit('new_offer', newActiveOffer)
                //    onlineLoginUsers.emit('new_offer', newActiveOffer)
                //  })
            }
            else {
                onlineLoginUsers.emit("new_offer", newActiveOffer);
            }
        })
            .catch(function (err) {
            console.log(err);
        });
    });
    // })
    // .catch((err) => {
    //     console.log(err)
    // })
};
exports.handleCreateOfferSockets = handleCreateOfferSockets;
var handleAcceptOfferSockets = function (_a) {
    var offer = _a.offer, acceptorId = _a.acceptorId, giveObjInAccWal = _a.giveObjInAccWal, takenObjInAccWal = _a.takenObjInAccWal, creatorId = _a.creatorId, givenObjInCreWal = _a.givenObjInCreWal, takenObjInCreWal = _a.takenObjInCreWal, rialObj = _a.rialObj, status = _a.status, handleAcceptor = _a.handleAcceptor;
    var modifiedObj;
    var curGivenObj;
    var curTakenObj;
    var onlineLoginUsers = (0, socket_1.getonlineLoginUsers)();
    if (status === "sell") {
        redisMethods
            .hashGetAll(offer.curGivenId.toString())
            .then(function (curGiven) {
            curGivenObj = curGiven;
            modifiedObj = {
                GcurrencyName: curGivenObj.currencyName,
                GpersianName: curGivenObj.per_name,
                GshortName: curGivenObj.ab_name,
                Gvalue: offer.curGivenVal,
                Gicon: curGivenObj.icon,
                acceptedDate: Date.now(),
                TcurrencyName: rialObj.currencyName,
                TpersianName: rialObj.per_name,
                TshortName: rialObj.ab_name,
                Tvalue: offer.curTakenVal,
                Ticon: rialObj.icon,
                txType: "sell",
            };
            onlineLoginUsers.emit("new_tx", modifiedObj);
        })
            .catch(function (err) {
            console.log(err);
        });
    }
    else if (status === "buy") {
        redisMethods
            .hashGetAll(offer.curTakenId.toString())
            .then(function (curTaken) {
            curTakenObj = curTaken;
            modifiedObj = {
                GcurrencyName: curTakenObj.currencyName,
                GpersianName: curTakenObj.per_name,
                GshortName: curTakenObj.ab_name,
                Gvalue: offer.curTakenVal,
                Gicon: curTakenObj.icon,
                acceptedDate: Date.now(),
                TcurrencyName: rialObj.currencyName,
                TpersianName: rialObj.per_name,
                TshortName: rialObj.ab_name,
                Tvalue: offer.curGivenVal,
                Ticon: rialObj.icon,
                txType: "buy",
            };
            onlineLoginUsers.emit("new_tx", modifiedObj);
        })
            .catch(function (err) {
            console.log(err);
        });
    }
    if (status === "sell") {
        curTakenObj = rialObj;
    }
    else if (status === "buy") {
        curGivenObj = rialObj;
    }
    if (handleAcceptor) {
        redisMethods
            .hashSetMembers(acceptorId)
            .then(function (result) {
            if (result && Array.isArray(result) && result.length > 0) {
                var modifiedAcceptorWallet1_1 = {
                    shortName: curGivenObj.ab_name,
                    value: status === "buy"
                        ? Math.ceil(giveObjInAccWal.value)
                        : (0, getFee_1.roundToSix)(giveObjInAccWal.value),
                };
                var modifiedAcceptorWallet2_1 = {
                    shortName: curTakenObj.ab_name,
                    value: status === "buy"
                        ? (0, getFee_1.roundToSix)(takenObjInAccWal.value)
                        : Math.ceil(takenObjInAccWal.value),
                };
                result.forEach(function (e) {
                    onlineLoginUsers.emit("new_wallet_values", [
                        modifiedAcceptorWallet1_1,
                        modifiedAcceptorWallet2_1,
                    ]);
                });
            }
        })
            .catch(function (err) {
            console.log(err);
        });
    }
    redisMethods
        .hashSetMembers(creatorId)
        .then(function (result) {
        if (result && Array.isArray(result) && result.length > 0) {
            var modifiedcreatorWallet1_1 = {
                shortName: curGivenObj.ab_name,
                value: status === "buy"
                    ? Math.ceil(givenObjInCreWal.value)
                    : (0, getFee_1.roundToSix)(givenObjInCreWal.value),
                commitment: status === "buy"
                    ? Math.ceil(givenObjInCreWal.commitment)
                    : (0, getFee_1.roundToSix)(givenObjInCreWal.commitment),
            };
            var modifiedcreatorWallet2_1 = {
                shortName: curTakenObj.ab_name,
                value: status === "buy"
                    ? (0, getFee_1.roundToSix)(takenObjInCreWal.value)
                    : Math.ceil(takenObjInCreWal.value),
            };
            result.forEach(function (e) {
                onlineLoginUsers.emit("new_tx_user", modifiedObj);
                onlineLoginUsers.emit("new_wallet_values", [
                    modifiedcreatorWallet1_1,
                    modifiedcreatorWallet2_1,
                ]);
            });
        }
    })
        .catch(function (err) {
        console.log(err);
    });
};
exports.handleAcceptOfferSockets = handleAcceptOfferSockets;
var handleBuyandSellSockets = function (_a) {
    var currencyWallet = _a.currencyWallet, rialWallet = _a.rialWallet, userId = _a.userId, currencyId = _a.currencyId;
    var onlineLoginUsers = (0, socket_1.getonlineLoginUsers)();
    redisMethods
        .hashSetMembers(userId)
        .then(function (userSockets) {
        if (userSockets && Array.isArray(userSockets) && userSockets.length > 0) {
            redisMethods
                .hashGetAll(currencyId)
                .then(function (currencyObj) {
                var modifiedUserWallet1 = {
                    shortName: "IRR",
                    value: Math.ceil(rialWallet.value),
                    commitment: Math.ceil(rialWallet.commitment),
                };
                var modifiedUserWallet2 = {
                    shortName: currencyObj.ab_name,
                    value: (0, getFee_1.roundToSix)(currencyWallet.value),
                    commitment: (0, getFee_1.roundToSix)(currencyWallet.commitment),
                };
                userSockets.map(function (e) {
                    onlineLoginUsers.emit("new_wallet_values", [
                        modifiedUserWallet1,
                        modifiedUserWallet2,
                    ]);
                });
            })
                .catch(function (err) {
                console.log(err);
            });
        }
    })
        .catch(function (err) {
        console.log(err);
    });
};
exports.handleBuyandSellSockets = handleBuyandSellSockets;
//# sourceMappingURL=handleSockets.js.map