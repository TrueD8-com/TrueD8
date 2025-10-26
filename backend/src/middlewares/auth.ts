import * as _ from 'lodash-es'
import myError from '../api/myError'
import { AccessLevels } from '../db/accessLevels'
import { Admin } from '../db/admin'

export function isAuthorized(req, res, next) {
  if (!req.session.userId) {
    const error = new myError(
      'unauthorized cookie',
      401,
      1,
      'خطا رخ داد!',
      'لطفا برای ادامه لاگین کنید!'
    )
    next(error)
  } else {
    next()
  }
}

export function isAdmin(req, res, next) {
  if (!req.session.adminId) {
    const error = new myError(
      'unauthorized',
      401,
      3,
      'خطا رخ داد!',
      'شما اجازه دسترسی ندارید!'
    )
    next(error)
  } else {
    next()
  }
}

export function isAllowed(req, res, next) {
  const adminId = req.session.adminId
  Admin.findOne({ _id: adminId })
    .then((person) => {
      if (person && person._id.toString() === adminId) {
        const theRole = person.role
        AccessLevels.findOne({ role: theRole })
          .then((ac) => {
            if (ac && ac.role === theRole) {
              const originalUrl = req.originalUrl
              const theIndex = _.findIndex(ac.methods, (v: any) => v.name === originalUrl)
              if (theIndex !== -1) {
                next()
              } else {
                const error = new myError(
                  'unauthorized',
                  401,
                  3,
                  'خطا رخ داد!',
                  'شما اجازه دسترسی ندارید!'
                )
                next(error)
              }
            } else {
              const error = new myError(
                'unauthorized',
                401,
                3,
                'خطا رخ داد!',
                'شما اجازه دسترسی ندارید!'
              )
              next(error)
            }
          })
          .catch((err) => {
            next(err)
          })
      } else {
        const error = new myError(
          'unauthorized',
          401,
          3,
          'خطا رخ داد!',
          'شما اجازه دسترسی ندارید!'
        )
        next(error)
      }
    })
    .catch((err) => {
      next(err)
    })
}
