"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { Currencies } from '../db/currencies';
var finalObjectInserter = function (_a) {
    var object = _a.object, key = _a.key, param = _a.param, value = _a.value, traded = _a.traded, sell = _a.sell, buy = _a.buy;
    if (Object.keys(object).includes(key.toString())) {
        object["".concat(key.toString())]["".concat(param)] += Number(value);
        return object;
    }
    else {
        object["".concat(key.toString())] = {
            traded: traded && param === "traded"
                ? value
                : traded && param !== "traded"
                    ? 0
                    : undefined,
            sell: sell && param === "sell"
                ? value
                : sell && param !== "sell"
                    ? 0
                    : undefined,
            buy: buy && param === "buy" ? value : buy && param !== "buy" ? 0 : undefined,
        };
        return object;
    }
};
//# sourceMappingURL=query.js.map