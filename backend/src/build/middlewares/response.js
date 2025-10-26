"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = successRes;
function successRes(res, message, data, metaData, statusCode) {
    if (statusCode === void 0) { statusCode = 200; }
    return res.status(statusCode).json({ success: true, message: message, data: data, metaData: metaData });
}
//# sourceMappingURL=response.js.map