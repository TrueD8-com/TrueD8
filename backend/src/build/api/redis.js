"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentPrice = exports.hashSetMembers = exports.hashHMset = exports.hashGetAll = exports.hashset = exports.hashget = exports.globalRedisClient = void 0;
exports.getCurrentPrice = getCurrentPrice;
var redis_1 = require("redis");
var myError_1 = __importDefault(require("./myError"));
var socket_1 = require("../api/socket");
var onlineLoginUsers = (0, socket_1.getonlineLoginUsers)();
exports.globalRedisClient = (0, redis_1.createClient)({ url: process.env.REDIS_HOST }
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
exports.globalRedisClient.on("connect", function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Redis-server is connected");
    }
});
exports.globalRedisClient.on("error", function (err) {
    console.log("Error " + err);
});
var hashget = function (tag) {
    // It is corresponded to hashset
    try {
        return new Promise(function (resolve, reject) {
            //@ts-ignore
            exports.globalRedisClient.get(tag, function (err, reply) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(reply);
                }
            });
        });
    }
    catch (err) {
        throw err;
    }
};
exports.hashget = hashget;
var hashset = function (tag, val) {
    // value could be only a string
    return new Promise(function (resolve, reject) {
        //@ts-ignore
        exports.globalRedisClient.set(tag, val, function (err, reply) {
            if (err) {
                reject(err);
            }
            else {
                resolve(reply);
            }
        });
    });
};
exports.hashset = hashset;
var hashGetAll = function (tag) {
    // It is corresponded to hashHMset
    return new Promise(function (resolve, reject) {
        exports.globalRedisClient.hgetall(tag, function (err, reply) {
            if (err) {
                reject(err);
            }
            else {
                resolve(reply);
            }
        });
    });
};
exports.hashGetAll = hashGetAll;
var hashHMset = function (tag, val) {
    // value could be object!
    return new Promise(function (resolve, reject) {
        exports.globalRedisClient.hmset(tag, val, function (err, reply) {
            if (err) {
                reject(err);
            }
            else {
                resolve(reply);
            }
        });
    });
};
exports.hashHMset = hashHMset;
var hashSetMembers = function (tag) {
    return new Promise(function (resolve, reject) {
        exports.globalRedisClient.smembers(tag, function (err, reply) {
            if (err) {
                reject(err);
            }
            else {
                resolve(reply);
            }
        });
    });
};
exports.hashSetMembers = hashSetMembers;
function getCurrentPrice(currency) {
    return (0, exports.hashGetAll)(currency.toString())
        .then(function (currencyInfo) {
        return (0, exports.hashGetAll)(currencyInfo.ab_name + "-g")
            .then(function (currencyInstantPrice) {
            return (0, exports.hashget)("dollarPrice").then(function (rialprice) {
                if (currencyInstantPrice) {
                    return Number(currencyInstantPrice.current) * Number(rialprice);
                }
                else {
                    var error = new myError_1.default("It is not possible to get price currently!", 400, 11, "امکان قیمت گیری در حال حاضر وجود ندارد!", "خطا رخ داد");
                    throw error;
                }
            });
        })
            .catch(function (err) {
            throw err;
        });
    })
        .catch(function (err) {
        throw err;
    });
}
var setCurrentPrice = function (_a) {
    var curGivenId = _a.curGivenId, curGivenVal = _a.curGivenVal, curTakenId = _a.curTakenId, curTakenVal = _a.curTakenVal;
    var curGivenObj;
    var curTakenObj;
    var ab_name;
    var current;
    var currentPricesArr = [];
    var findCurGivenObj = function () {
        return (0, exports.hashGetAll)(curGivenId.toString())
            .then(function (res) {
            curGivenObj = res;
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    var findCurTakenObj = function () {
        return (0, exports.hashGetAll)(curTakenId.toString())
            .then(function (res) {
            curTakenObj = res;
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    return Promise.all([findCurGivenObj(), findCurTakenObj()])
        .then(function () {
        if (curTakenObj) {
            if (curGivenObj && curGivenObj.ab_name === "IRR") {
                ab_name = curTakenObj.ab_name;
                current = curGivenVal;
            }
            else if (curGivenObj && curGivenObj.ab_name !== "IRR") {
                ab_name = curGivenObj.ab_name;
                current = curTakenVal;
            }
            var min_1 = 0;
            var max_1 = 0;
            return (0, exports.hashGetAll)(ab_name + "-g")
                .then(function (redisGetObj) {
                if (redisGetObj) {
                    if (current < redisGetObj["min"]) {
                        min_1 = current;
                    }
                    else {
                        min_1 = redisGetObj["min"];
                    }
                    if (current > redisGetObj["max"]) {
                        max_1 = current;
                    }
                    else {
                        max_1 = redisGetObj["max"];
                    }
                    currentPricesArr = [
                        {
                            shortName: ab_name,
                            current: current,
                            min: min_1,
                            max: max_1,
                        },
                    ];
                    (0, socket_1.getonlineLoginUsers)().emit("new_current_price", currentPricesArr);
                    return (0, exports.hashHMset)("L_" + ab_name, {
                        current: current,
                        min: min_1,
                        max: max_1,
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
                else {
                    currentPricesArr = [
                        {
                            shortName: ab_name,
                            current: current,
                            min: current,
                            max: current,
                        },
                    ];
                    (0, socket_1.getonlineLoginUsers)().emit("new_current_price", currentPricesArr);
                    return (0, exports.hashHMset)("L_" + ab_name, {
                        current: current,
                        min: current,
                        max: current,
                    }).catch(function (err) {
                        console.log(err);
                    });
                }
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
exports.setCurrentPrice = setCurrentPrice;
//# sourceMappingURL=redis.js.map