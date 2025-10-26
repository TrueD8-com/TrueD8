import * as _ from "lodash-es";

import * as redis from "../api/redis";
import { ObjectId } from "mongodb";

import { isEmailValid, isValidMobilePhone } from "../middlewares/validation";
// import { Accepted_Offers } from '../db/acceptedOffers';
// import { Active_Offers } from '../db/activeOffers';
// import { PendingTransfers } from '../db/pendingTransfers';
// import { SuccessfulTransfers } from '../db/successfulTransfers';
import { User } from "../db/user";
import myError from "./myError";
//import { Currencies } from '../db/currencies';

const finalObjectInserter = ({
  object,
  key,
  param,
  value,
  traded,
  sell,
  buy,
}) => {
  if (Object.keys(object).includes(key.toString())) {
    object[`${key.toString()}`][`${param}`] += Number(value);
    return object;
  } else {
    object[`${key.toString()}`] = {
      traded:
        traded && param === "traded"
          ? value
          : traded && param !== "traded"
            ? 0
            : undefined,
      sell:
        sell && param === "sell"
          ? value
          : sell && param !== "sell"
            ? 0
            : undefined,
      buy:
        buy && param === "buy" ? value : buy && param !== "buy" ? 0 : undefined,
    };
    return object;
  }
};
