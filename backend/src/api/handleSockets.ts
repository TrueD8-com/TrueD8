//@ts-ignore

import { roundToSix } from "./getFee";
import * as redisMethods from "./redis";
import * as _ from "lodash-es";

import { getonlineLoginUsers } from "./socket";

export const handleCreateOfferSockets = ({
  rialObj,
  userWallet,
  rialInWallet,
  newActiveOffers,
  bodyOffer,
  hasNewOffer,
  status,
}) => {
  let modifiedBodyOffer;
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
  } else if (status === "buy") {
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
  const onlineLoginUsers = getonlineLoginUsers();
  //    .then((allSockets: any) => {
  newActiveOffers.map((newActiveOffer) => {
    redisMethods
      .hashSetMembers(newActiveOffer.userId.toString())
      .then((userSockets) => {
        if (
          userSockets &&
          Array.isArray(userSockets) &&
          userSockets.length > 0
        ) {
          // modifiedBodyOffer['GpersianName'] = curGivenObj ? curGivenObj.per_name : undefined
          if (newActiveOffer.curTakenId.toString() === rialObj._id.toString()) {
            redisMethods
              .hashGetAll(newActiveOffer.curGivenId.toString())
              .then((curGivenObj: any) => {
                const modifiedUserWallet1 = {
                  shortName: curGivenObj.ab_name,
                  value: roundToSix(userWallet.value),
                  commitment: roundToSix(userWallet.commitment),
                };
                const modifiedUserWallet2 = {
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
              .catch((err) => {
                console.log(err);
              });
          } else if (
            newActiveOffer.curGivenId.toString() === rialObj._id.toString()
          ) {
            redisMethods
              .hashGetAll(newActiveOffer.curTakenId.toString())
              .then((curTakenObj: any) => {
                const modifiedUserWallet1 = {
                  shortName: "IRR",
                  value: Math.ceil(rialInWallet.value),
                  commitment: Math.ceil(rialInWallet.commitment),
                };
                const modifiedUserWallet2 = {
                  shortName: curTakenObj.ab_name,
                  value: roundToSix(userWallet.value),
                  commitment: roundToSix(userWallet.commitment),
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
              .catch((err) => {
                console.log(err);
              });
          }
          // allSockets = _.filter(allSockets, (v) => !userSockets.includes(v))
          newActiveOffer["owner"] = false;
          // allSockets.map((e) => {
          //     onlineLoginUsers.to(e).emit('new_offer', newActiveOffer)
          //    onlineLoginUsers.emit('new_offer', newActiveOffer)

          //  })
        } else {
          onlineLoginUsers.emit("new_offer", newActiveOffer);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
  // })
  // .catch((err) => {
  //     console.log(err)
  // })
};

export const handleAcceptOfferSockets = ({
  offer,
  acceptorId,
  giveObjInAccWal,
  takenObjInAccWal,
  creatorId,
  givenObjInCreWal,
  takenObjInCreWal,
  rialObj,
  status,
  handleAcceptor,
}) => {
  let modifiedObj;
  let curGivenObj;
  let curTakenObj;
  const onlineLoginUsers = getonlineLoginUsers();
  if (status === "sell") {
    redisMethods
      .hashGetAll(offer.curGivenId.toString())
      .then((curGiven: any) => {
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
      .catch((err) => {
        console.log(err);
      });
  } else if (status === "buy") {
    redisMethods
      .hashGetAll(offer.curTakenId.toString())
      .then((curTaken: any) => {
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
      .catch((err) => {
        console.log(err);
      });
  }
  if (status === "sell") {
    curTakenObj = rialObj;
  } else if (status === "buy") {
    curGivenObj = rialObj;
  }
  if (handleAcceptor) {
    redisMethods
      .hashSetMembers(acceptorId)
      .then((result) => {
        if (result && Array.isArray(result) && result.length > 0) {
          const modifiedAcceptorWallet1 = {
            shortName: curGivenObj.ab_name,
            value:
              status === "buy"
                ? Math.ceil(giveObjInAccWal.value)
                : roundToSix(giveObjInAccWal.value),
          };
          const modifiedAcceptorWallet2 = {
            shortName: curTakenObj.ab_name,
            value:
              status === "buy"
                ? roundToSix(takenObjInAccWal.value)
                : Math.ceil(takenObjInAccWal.value),
          };

          result.forEach((e) => {
            onlineLoginUsers.emit(`new_wallet_values`, [
              modifiedAcceptorWallet1,
              modifiedAcceptorWallet2,
            ]);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  redisMethods
    .hashSetMembers(creatorId)
    .then((result) => {
      if (result && Array.isArray(result) && result.length > 0) {
        const modifiedcreatorWallet1 = {
          shortName: curGivenObj.ab_name,
          value:
            status === "buy"
              ? Math.ceil(givenObjInCreWal.value)
              : roundToSix(givenObjInCreWal.value),
          commitment:
            status === "buy"
              ? Math.ceil(givenObjInCreWal.commitment)
              : roundToSix(givenObjInCreWal.commitment),
        };
        const modifiedcreatorWallet2 = {
          shortName: curTakenObj.ab_name,
          value:
            status === "buy"
              ? roundToSix(takenObjInCreWal.value)
              : Math.ceil(takenObjInCreWal.value),
        };
        result.forEach((e) => {
          onlineLoginUsers.emit("new_tx_user", modifiedObj);
          onlineLoginUsers.emit(`new_wallet_values`, [
            modifiedcreatorWallet1,
            modifiedcreatorWallet2,
          ]);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

export const handleBuyandSellSockets = ({
  currencyWallet,
  rialWallet,
  userId,
  currencyId,
}) => {
  const onlineLoginUsers = getonlineLoginUsers();
  redisMethods
    .hashSetMembers(userId)
    .then((userSockets) => {
      if (userSockets && Array.isArray(userSockets) && userSockets.length > 0) {
        redisMethods
          .hashGetAll(currencyId)
          .then((currencyObj: any) => {
            const modifiedUserWallet1 = {
              shortName: "IRR",
              value: Math.ceil(rialWallet.value),
              commitment: Math.ceil(rialWallet.commitment),
            };
            const modifiedUserWallet2 = {
              shortName: currencyObj.ab_name,
              value: roundToSix(currencyWallet.value),
              commitment: roundToSix(currencyWallet.commitment),
            };
            userSockets.map((e) => {
              onlineLoginUsers.emit("new_wallet_values", [
                modifiedUserWallet1,
                modifiedUserWallet2,
              ]);
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
