import { logger } from '../api/logger'
export default (err, req, res, next) => {
    if(err.statusCode) {
      logger.warn(err.statusCode + ' - ' + err.messageEnglish)
    } else {
      logger.warn(err)
    }
    if (!err.statusCode) {
      logger.error(err.stack)
      res.status(500).json({
        actionName: 'Intrnal Error',
        metaData: {
          title: 'خطا در سرور',
          message: 'لطفا لحظاتی بعد دوباره اقدام کنید.',
          messageEnglish: 'something bad happened!'
        }
      })
    } else {
      res.status(err.statusCode).send({
        actionName: 'Error',
        metaData: {
          title: err.title,
          clientErrorCode: err.clientCode,
          message: err.clientMessage,
          messageEnglish: err.messageEnglish
        }
      })
    }
  }