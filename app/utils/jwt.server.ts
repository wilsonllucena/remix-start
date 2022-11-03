import {sign} from "jsonwebtoken"
const secret = "testesecrte";

export const signToken = payload => sign(payload, secret)