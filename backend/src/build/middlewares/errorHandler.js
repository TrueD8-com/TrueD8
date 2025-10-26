"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("../api/logger");
exports.default = (function (err, req, res, next) {
    if (err.statusCode) {
        logger_1.logger.warn(err.statusCode + ' - ' + err.messageEnglish);
    }
    else {
        logger_1.logger.warn(err);
    }
    if (!err.statusCode) {
        logger_1.logger.error(err.stack);
        res.status(500).json({
            actionName: 'Intrnal Error',
            metaData: {
                title: 'خطا در سرور',
                message: 'لطفا لحظاتی بعد دوباره اقدام کنید.',
                messageEnglish: 'something bad happened!'
            }
        });
    }
    else {
        res.status(err.statusCode).send({
            actionName: 'Error',
            metaData: {
                title: err.title,
                clientErrorCode: err.clientCode,
                message: err.clientMessage,
                messageEnglish: err.messageEnglish
            }
        });
    }
});
//# sourceMappingURL=errorHandler.js.map