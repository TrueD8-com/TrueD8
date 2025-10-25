import { createClient } from "redis";
import myError from "./myError";
import { getonlineLoginUsers } from "../api/socket";
const onlineLoginUsers = getonlineLoginUsers();

export const globalRedisClient = createClient(
  { url: process.env.REDIS_HOST }

  // enable_offline_queue: false
);

// globalRedisClient.auth(process.env.REDIS_PASS, (err) =>  {
//   if (err) console.log(err);
// })
// globalRedisClient.flushall(function (err, succeeded) {
//   if (err) {
//     console.log('error in flushall:', err)
//   }
//   console.log('will be true if successfull: ', succeeded); // will be true if successfull
// });

globalRedisClient.on("connect", function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Redis-server is connected");
  }
});

globalRedisClient.on("error", function (err) {
  console.log("Error " + err);
});

export const hashget = (tag) => {
  // It is corresponded to hashset
  try {
    return new Promise((resolve, reject) => {
      //@ts-ignore

      globalRedisClient.get(tag, (err, reply) => {
        if (err) {
          reject(err);
        } else {
          resolve(reply);
        }
      });
    });
  } catch (err) {
    throw err;
  }
};

export const hashset = (tag, val) => {
  // value could be only a string
  return new Promise((resolve, reject) => {
    //@ts-ignore

    globalRedisClient.set(tag, val, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

export const hashGetAll = (tag) => {
  // It is corresponded to hashHMset
  return new Promise((resolve, reject) => {
    globalRedisClient.hgetall(tag, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

export const hashHMset = (tag, val) => {
  // value could be object!
  return new Promise((resolve, reject) => {
    globalRedisClient.hmset(tag, val, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

export const hashSetMembers = (tag) => {
  return new Promise((resolve, reject) => {
    globalRedisClient.smembers(tag, (err, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

export function getCurrentPrice(currency) {
  return hashGetAll(currency.toString())
    .then((currencyInfo: any) => {
      return hashGetAll(currencyInfo.ab_name + "-g")
        .then((currencyInstantPrice: any) => {
          return hashget("dollarPrice").then((rialprice) => {
            if (currencyInstantPrice) {
              return Number(currencyInstantPrice.current) * Number(rialprice);
            } else {
              const error = new myError(
                "It is not possible to get price currently!",
                400,
                11,
                "امکان قیمت گیری در حال حاضر وجود ندارد!",
                "خطا رخ داد"
              );
              throw error;
            }
          });
        })
        .catch((err) => {
          throw err;
        });
    })
    .catch((err) => {
      throw err;
    });
}

export const setCurrentPrice = ({
  curGivenId,
  curGivenVal,
  curTakenId,
  curTakenVal,
}) => {
  let curGivenObj;
  let curTakenObj;
  let ab_name;
  let current;
  let currentPricesArr = [];

  const findCurGivenObj = () => {
    return hashGetAll(curGivenId.toString())
      .then((res) => {
        curGivenObj = res;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const findCurTakenObj = () => {
    return hashGetAll(curTakenId.toString())
      .then((res) => {
        curTakenObj = res;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return Promise.all([findCurGivenObj(), findCurTakenObj()])
    .then(() => {
      if (curTakenObj) {
        if (curGivenObj && curGivenObj.ab_name === "IRR") {
          ab_name = curTakenObj.ab_name;
          current = curGivenVal;
        } else if (curGivenObj && curGivenObj.ab_name !== "IRR") {
          ab_name = curGivenObj.ab_name;
          current = curTakenVal;
        }

        let min: number = 0;
        let max: number = 0;
        return hashGetAll(ab_name + "-g")
          .then((redisGetObj) => {
            if (redisGetObj) {
              if (current < redisGetObj["min"]) {
                min = current;
              } else {
                min = redisGetObj["min"];
              }
              if (current > redisGetObj["max"]) {
                max = current;
              } else {
                max = redisGetObj["max"];
              }
              currentPricesArr = [
                {
                  shortName: ab_name,
                  current: current,
                  min: min,
                  max: max,
                },
              ];
              getonlineLoginUsers().emit(`new_current_price`, currentPricesArr);

              return hashHMset("L_" + ab_name, {
                current: current,
                min: min,
                max: max,
              }).catch((err) => {
                console.log(err);
              });
            } else {
              currentPricesArr = [
                {
                  shortName: ab_name,
                  current: current,
                  min: current,
                  max: current,
                },
              ];
              getonlineLoginUsers().emit(`new_current_price`, currentPricesArr);

              return hashHMset("L_" + ab_name, {
                current: current,
                min: current,
                max: current,
              }).catch((err) => {
                console.log(err);
              });
            }
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
