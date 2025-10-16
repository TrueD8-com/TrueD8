export default function successRes (res, message?: string, data?, metaData?, statusCode = 200)  {
  return res.status(statusCode).json({ success: true, message: message, data: data, metaData: metaData })
}


