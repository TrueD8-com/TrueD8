import { Provinces } from '../db/provinces'

const cities = require('./provinces.json')
export  const    provinceCreator   = ()  =>{
  
   return  Provinces.find()
        .then((result) => {
            if (result && result.length>0) {
                console.log("found province collection ")
                return
            } else {
                const provincesArray = [];
                cities.map((p)=>{
                    let citiesObjArray = []
                       p.cities.map((c) =>{ citiesObjArray.push({
                           name :  c ,
                           isAvailable : false
                       })})
                       provincesArray.push ({
                           name : p.name,
                           cities : citiesObjArray
                       })
                })
              return  Provinces.insertMany(provincesArray);             
            }
        })
}