import moment from 'moment-timezone';
import { logger } from "../api/logger"
import { DailyPriceStat } from "../db/dailyPriceStats"
import { GlobalHourlyPrice } from "../db/globalHourlyPrice"
import { GlobalWeeklyPrice } from "../db/globalWeeklyPrice"
import { GlobalDailyPrice } from "../db/globalDailyPrice"
import { GlobalYearlyPrice } from "../db/globalYearlyPrice"
import { GlobalMonthlyPrice } from "../db/globalMontlyPrice"
import { ContinuesPriceStat } from "../db/continuesPriceStats"
import { Currencies } from '../db/currencies'

import { getonlineLoginUsers, getonlineNotLoginUsers } from '../api/socket'
const onlineLoginUsers = getonlineLoginUsers()
const onlineNotLoginUsers = getonlineNotLoginUsers()

import * as redis from '../api/redis'
import * as mongoose from 'mongoose'

const fetch = require('node-fetch');


export const continuesStatsOfOrders = () => {
  //  console.log("hello")
    let currencyHashMap = new Map();
    const currencyFetcher = () => { 
        return  Currencies.find()
        .then((currency) => {
        if(currency&& currency.length>0) {
            return currency.map((curr) => {
                return currencyHashMap.set(curr.ab_name,curr._id)
                })
        }
      }).catch((err) => {
        console.log(err)
      })
    }
    Promise.all([currencyFetcher()])
    .then(() => {
        //console.log("after currencyFetcher")
        let currenciesString = ""
        const currencyIterator = () => { 
            Array.from( currencyHashMap.keys()).map((element,index)=>{
                currenciesString += element
                if(index+1 !=currencyHashMap.size){
                    currenciesString+=","
                }            
            })
        }
        Promise.all([currencyIterator()])
        .then(() => {
            fetch('https://api.wallex.ir/v1/currencies/stats')
            .then(res => res.json())
            .then((json : any) => {
              //  console.log("after currencyIterator")
                let currentPricesArr = []
                const jsonMap = json['result'].map(async(element) => {
                   
                    const currentPrice = element['price'];
                  //  const lastHourPrice = Number( element["price"])-Number(element["1h"]["price_change"]) 
                    const yesterDayPrice = Number( element["price"])-Number(element["price_change_24h"])
                    const lastWeekPrice = Number( element["price"])-Number(element["price_change_7d"]) 
                    const lastMonthPrice = Number( element["price"])-Number(element["price_change_30d"]) 
                    const lastYearPrice = Number( element["price"])-Number(element["price_change_1y"]) 
                 //   const lastHourVolume =  Number(element["1h"]["volume"])
                    const yesterDayVolume =  Number(element["volume_24h"])
                  //  const lastWeekVolume =  Number(element["7d"]["volume"])
                   // const lastMonthVolume =  Number(element["30d"]["volume"])
                    //const lastYearVolume =  Number(element["365d"]["volume"])
                    const elementName =  element["key"]
                    const currentTimeInGreenwich = moment().tz('Etc/Greenwich')
                    const currentTimelastHour = moment().tz('Etc/Greenwich').subtract({hour: 1})
                    const currentTimeYesterday =moment().tz('Etc/Greenwich').subtract({day: 1})
                    const currentTimeLastWeekNumber =moment().tz('Etc/Greenwich').subtract({week : 1}).week()
                    const currentTimeLastMonth =moment().tz('Etc/Greenwich').subtract({day: 30})
                    const currentTimeLastYear =moment().tz('Etc/Greenwich').subtract({day : 365})
                    const yesterDayStartTime = moment().tz('Etc/Greenwich').subtract({day: 1}).format("YYYY-MM-DD")
                    const todayStartTime = moment().tz('Etc/Greenwich').format("YYYY-MM-DD")
                    const lastWeekStartTime = moment().tz('Etc/Greenwich').subtract({week: 1}).startOf('week').format("YYYY-MM-DD")
                    const lastWeekEndTime = moment().tz('Etc/Greenwich').subtract({week: 1}).endOf('week').format("YYYY-MM-DD")
                    const lastMonthStartTime = moment().tz('Etc/Greenwich').subtract({day: 30}).startOf('month').format("YYYY-MM-DD")
                    const lastMonthEndTime = moment().tz('Etc/Greenwich').subtract({day: 30}).endOf('month').format("YYYY-MM-DD")
                    const lastYearStartTime = moment().tz('Etc/Greenwich').subtract({day: 365}).startOf('year').format("YYYY-MM-DD")
                    const lastYearEndTime = moment().tz('Etc/Greenwich').subtract({day: 365}).endOf('year').format("YYYY-MM-DD")
                    let currentTimeMinute = currentTimeInGreenwich.minute()
                    let hourlyGlobalPrice;
                    let dailyGlobalPrice;
                    let weeklyGlobalPrice;
                    let monthlyGlobalPrice;
                    let yearlyGlobalPrice;
                    const session = await mongoose.startSession()  
                    
                    const currentPrices = () => {
                        return redis.hashGetAll(elementName+'-g')
                        .then((rObject: any) => { 
                            if(rObject && rObject.current) {
                                let newMin = rObject.min
                                let newMax = rObject.max
                                if(currentPrice < newMin) {
                                    newMin = currentPrice
                                }
                                if(currentPrice > newMax) {
                                    newMax = currentPrice
                                }
                                const currentObj = {
                                    current: currentPrice ,
                                    min:newMin,
                                    max: newMax,
                                    yesterDayPrice
                                }
                                return redis.hashHMset(elementName+'-g', currentObj)
                                .then(()=>{
                              //      console.log("settttttttttttttttttttttttingsfsadfasd")
                                    return redis.hashget('dollarPrice')
                                    .then((rialPrice) => {
                                  
                                        currentPricesArr.push({
                                            shortName: elementName,
                                            current: Math.ceil(currentObj.current * Number(rialPrice)/10),
                                            min: Math.ceil(currentObj.min * Number(rialPrice)/10),
                                            max: Math.ceil(currentObj.max * Number(rialPrice)/10)
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                            } else {
                                const currentObj = {
                                    current: currentPrice ,
                                    min: currentPrice,
                                    max : currentPrice,
                                    yesterDayPrice
                                }
                                return redis.hashHMset(elementName+'-g', currentObj)
                                .then(()=>{
                                    return redis.hashget('dollarPrice')
                                    .then((rialPrice) => {
                                      //  console.log("asdfasdgasdffgasd")
                                        currentPricesArr.push({
                                            shortName: elementName,
                                            current: Math.ceil(currentObj.current * Number(rialPrice)/10),
                                            min: Math.ceil(currentObj.min * Number(rialPrice)/10),
                                            max: Math.ceil(currentObj.max * Number(rialPrice)/10)
                                        })
                                    })
                                    .catch((err) => {
                                        console.log(err)
                                    })                            
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                            }
                        })
                        .catch((err)=>{
                            console.log("in catch error",err)                        
                        })
                    }
                const dbWeekly = ()  => {                    
                    return redis.hashget(elementName+"-g"+"-w").then((thatWeek)=>{
                        if(thatWeek&&Number(thatWeek) === Number(moment().tz('Etc/Greenwich').subtract({ week : 1}).week())) {
                        
                        } else {
                            let minWeek ;
                            let maxWeek ;
                            const minCalculatorForLastWeek = ()=> {
                                return GlobalDailyPrice.find({
                                    timeStamp :   { $gte: lastWeekStartTime, $lte: lastWeekEndTime }
                                })
                                .then((sevenValues) => {
                                    return sevenValues.map((element) => {
                                        if(element.price.min<minWeek||!minWeek) {
                                            minWeek = element.price.min
                                        }
                                        if(element.price.max>maxWeek||!maxWeek) {
                                            maxWeek = element.price.max
                                        }
                                    })
                                })
                            }
                            return Promise.all([minCalculatorForLastWeek()])
                            .then(() => {
                                const weeklyDbData = {
                                    timeStamp  : moment().tz('Etc/Greenwich').subtract({week : 1}).format(),
                                    price : {price : lastWeekPrice,
                                    min :minWeek ,
                                    max : maxWeek
                                    },
                                 //   volume : lastWeekVolume,
                                    currencyId : currencyHashMap.get(elementName)
                                }
                                weeklyGlobalPrice = weeklyDbData                            
                                return weeklyGlobalPrice
                            })
                            .catch((err) => {
                                console.log(err)
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })                      
                }
                     
                const dbMonthly = () => {
                    return redis.hashget(elementName+"-g"+"-m")
                    .then((thatmonth) => {
                        if(thatmonth&&Number(thatmonth) === Number(moment().tz('Etc/Greenwich').subtract({ day : 30}).month()+1)) {

                        } else {                          
                            let minMonth ;
                            let maxMonth ;
                            const minCalculatorForLastMonth= () => { 
                                return GlobalDailyPrice.find({ timeStamp: { $gte: lastMonthStartTime, $lte: lastMonthEndTime }})
                                .then((thirtyValues) => {
                                    return thirtyValues.map((element) => {
                                        if(element.price.min<minMonth||!minMonth) {
                                            minMonth = element.price.min
                                        }
                                        if(element.price.max>maxMonth||!maxMonth) {
                                            maxMonth = element.price.max
                                        }
                                    })
                                })
                            }
                           return Promise.all([minCalculatorForLastMonth()])
                           .then(() => {
                                const monthlyDbData = {
                                    timeStamp  : moment().tz('Etc/Greenwich').subtract({day : 30}).format(),
                                    price : {price : lastMonthPrice,
                                    min :minMonth ,
                                    max : maxMonth
                                    },
                                   // volume : lastMonthVolume,
                                    currencyId : currencyHashMap.get(elementName)
                                }
                                monthlyGlobalPrice = monthlyDbData
                                return monthlyGlobalPrice
                            })
                            .catch((err)=>{
                                console.log(err)
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })            
                }
                const dbYearly = () => {
                    return redis.hashget(elementName+"-g"+"-y")
                    .then((thatYear) => {
                        if(thatYear&&Number(thatYear) === Number(moment().tz('Etc/Greenwich').subtract({ day : 365}).year())) {

                        } else {
                            let minYear ;
                            let maxYear ;
                            const minCalculatorForLastYear= () => {
                                return GlobalMonthlyPrice.find({ timeStamp: { $gte: lastYearStartTime, $lte: lastYearEndTime } })
                                .then((thirtyValues) => {
                                    return thirtyValues.map((element) => {
                                        if(element.price.min<minYear||!minYear) {
                                            minYear = element.price.min
                                        }
                                        if(element.price.max>maxYear||!maxYear) {
                                            maxYear = element.price.max
                                        }
                                    })
                                })
                            }
                            return Promise.all([minCalculatorForLastYear()])
                            .then(() => {
                                const yearlyDbData = {
                                    timeStamp  : moment().tz('Etc/Greenwich').subtract({day : 30}).format(),
                                    price : {price : lastYearPrice,
                                    min :minYear ,
                                    max : maxYear
                                    },
                                  //  volume : lastYearVolume,
                                    currencyId : currencyHashMap.get(elementName)
                                }
                                yearlyGlobalPrice = yearlyDbData
                                return yearlyGlobalPrice
                            })
                            .catch((err)=>{
                                console.log(err)
                            })
                        }
                    })
                    .catch((err)=>{
                        console.log(err)
                    })          
                }
                const dbDaily = ()  => {                    
                    return redis.hashget(elementName+"-g"+"-d")
                    .then((thatDay) => {
                        if(thatDay&&Number(thatDay) === Number(currentTimeYesterday.date())) {

                        } else {                          
                            let minDay ;
                            let maxDay ;
                            const minCalculatorForYesterDay = () => {
                                return GlobalHourlyPrice.find({ timeStamp: { $gte: yesterDayStartTime, $lt: todayStartTime } })
                                .then((twentyfourPrices) => {
                                    return twentyfourPrices.map((element) => {
                                        if(element.price.min<minDay||!minDay) {
                                            minDay = element.price.min
                                        }
                                        if(element.price.max>maxDay||!maxDay) {
                                            maxDay = element.price.max
                                        }

                                    })
                                })
                            }
                            return Promise.all([minCalculatorForYesterDay()])
                            .then(() => {
                                const dailyDbData = {
                                    timeStamp  : currentTimeYesterday.format(),
                                    price : {price : yesterDayPrice,
                                    min :minDay ,
                                    max : maxDay
                                    },
                                    volume : yesterDayVolume,
                                    currencyId : currencyHashMap.get(elementName)
                                }
                                dailyGlobalPrice = dailyDbData
                                return dailyGlobalPrice
                            })
                            .catch((err)=>{
                                console.log(err)
                            })
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })   
                }
            
                const dbHourly = ()  => {
                        return redis.hashget(elementName+"-g"+"-h")
                        .then((thatHour) => {
                            if(thatHour&&Number(thatHour) === Number(currentTimelastHour.hour())) {

                            } else {
                                return redis.hashGetAll(elementName+'-g')
                                .then((rObject: any) => {
                                    if(rObject&&rObject.current) {
                                        let hourlyMin = Number(rObject.min)
                                        let hourlyMax = Number(rObject.max)
                                        const hourlyDbData = {
                                            timeStamp  : currentTimelastHour.format(),
                                            price : {
                                        //        price: lastHourPrice,
                                                min : hourlyMin ,
                                                max : hourlyMax
                                            } ,
                                      //      volume : lastHourVolume,
                                            currencyId : currencyHashMap.get(elementName)
                                        }
                                        hourlyGlobalPrice =  hourlyDbData
                                    return hourlyGlobalPrice
                                    } else {

                                    }
                                })
                            }
                        })
                        .catch((err) => {
                                console.log(err)
                        })
                            
                    }
                return Promise.all([currentPrices(), dbHourly(), dbDaily(), dbWeekly(), dbMonthly(), dbYearly()])
                .then(() => {
                   // console.log("after all promise")
                    session.withTransaction(async () => { 
                        if(hourlyGlobalPrice) {
                            await GlobalHourlyPrice.create([hourlyGlobalPrice],{session})
                        }
                        if(weeklyGlobalPrice) {
                            await GlobalWeeklyPrice.create([weeklyGlobalPrice],{session})
                        }
                        if(dailyGlobalPrice) {
                            await GlobalDailyPrice.create([dailyGlobalPrice],{session})
                        }
                        if(monthlyGlobalPrice) {
                            await GlobalMonthlyPrice.create([monthlyGlobalPrice],{session})
                        }
                        if(yearlyGlobalPrice) {
                            await GlobalYearlyPrice.create([yearlyGlobalPrice],{session})
                        }
                    })
                    .then(()=>{
                        redis.hashset(elementName+"-g"+"-h",currentTimelastHour.hour())
                        .catch((err) => {
                            console.log(err)
                        })
                        redis.hashset(elementName+"-g"+"-d",currentTimeYesterday.date())
                        .catch((err) => {
                            console.log(err)
                        })
                        redis.hashset(elementName+"-g"+"-w",currentTimeLastWeekNumber)
                        .catch((err) => {
                            console.log(err)
                        })
                        redis.hashset(elementName+"-g"+"-m",currentTimeLastMonth.month()+1)
                        .catch((err) => {
                            console.log(err)
                        })
                        redis.hashset(elementName+"-g"+"-y",currentTimeLastYear.year())
                        .catch((err) => {
                            console.log(err)
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                })  
            })
            Promise.all(jsonMap)
            .then(() => {
                getonlineLoginUsers().emit(`new_current_price`, currentPricesArr)
            })
            .catch((err) => {
                console.log(err)
            })
        })
    })
})}

