import * as redis from '../api/redis'
import { getonlineLoginUsers } from '../api/socket';
const fetch = require('node-fetch');


export const addDollarPrice = () => {
   
     fetch('https://api.wallex.ir/v1/markets')
    .then((res) => res.json())
    .then((json: any) => {
      

        var n = json['result']["symbols"]["USDTTMN"]["stats"]["lastPrice"]
        if(n&&Number(n)&&Number(n)>1){
        redis.hashset("dollarPrice", Number(n))
        .then((added) => {
            getonlineLoginUsers().emit("dollarPrice",Number(n))
            console.log("price of dollar added to redis" ,  Number(n)
          )
        })
        .catch((err) => {
            console.log("error is ", err)
        })  
      }
    })
    .catch((err) => {
      // console.log(err);
    });




}