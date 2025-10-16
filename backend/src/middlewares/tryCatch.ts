export default function tryCatch (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
      // next()
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
}

