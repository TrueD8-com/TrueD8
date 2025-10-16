import { Restrictions } from "../db/restrictions"
import myError from "./myError"

export const isActive = ({ curIds, action }) => {
    return Restrictions.findOne({ action: action })
    .then((doc) => {
        if (doc && doc.action === action) {
            const status = doc.status
            if (status === 'Active') {
                return {
                    isActive: true,
                    certainIndex: doc.certainIndex
                }
            } else if (status === 'DeActive') {
                const error = new myError(
                    'The action is blocked temporarily, please do it later!',
                    400,
                    11,
                    'امکان انجام این فعالیت به طور موقت متوقف شده است. لطفا بعدا اقدام فرمایید',
                    'خطا رخ داد'
                )
                throw error    
            } else {
                const curIdsMap = curIds.map((e) => {
                    if (!doc.currencyIds.includes(e)) {
                        return
                    } else {
                        const error = new myError(
                            'The action is blocked temporarily, please do it later!',
                            400,
                            11,
                            'امکان انجام این فعالیت به طور موقت متوقف شده است. لطفا بعدا اقدام فرمایید',
                            'خطا رخ داد'
                        )
                        throw error    
                    }
                })
                return Promise.all(curIdsMap)
                .then(() => {
                    return {
                        isActive: true,
                        certainIndex: doc.certainIndex
                    }
                })
                .catch((err) => {
                    throw err
                })
            }
        } else {
            return {
                isActive: true,
                certainIndex: 1
            }
        }
    })
    .catch((err) => {
        throw err
    })
}