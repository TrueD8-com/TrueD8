import * as express from 'express'
const path = require('path');
const fs = require('fs');
import { promises as fsp } from 'fs'
import successRes from '../middlewares/response'
import { isAuthorized } from '../middlewares/auth'
import tryCatch from '../middlewares/tryCatch'
import { User } from '../db/user'
import { logger } from '../api/logger'
import myError from '../api/myError'
import { uploadTemp } from '../middlewares/upload'

export const userRoutes = express.Router()

const profileEditableFields = ['name', 'lastName', 'email', 'phoneNumber', 'username', 'bio', 'gender', 'showMe', 'interests', 'discovery', 'birthdate']

userRoutes.post('/changePassword',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    const password = req.body.password
    const newPassword = req.body.newPassword
    if (!password || !newPassword) {
      const error = new myError('Invalid payload', 400, 12, 'داده نامعتبر است', 'خطا رخ داد')
      return next(error)
    }
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (user && user._id.toString() === userId) {
          return user.comparePasswordPromise(password)
            .then((isMatch: boolean) => {
              if (isMatch) {
                user.password = newPassword
                return user.save()
                  .then(() => {
                    successRes(res, 'password is successfuly changed')
                  })
              } else {
                const error = new myError('Wrong password', 400, 13, 'رمز عبور اشتباه است', 'خطا رخ داد')
                next(error)
              }
            })
        } else {
          const error = new myError('The user does not exist!', 400, 25, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد')
          next(error)
        }
      })
      .catch((err) => next(err))
  }))

userRoutes.get('/getUserProfileInfo',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (user && user._id.toString() === userId) {
          const body = {
            name: user.name,
            lastName: user.lastName,
            username: user.username,
            userType: user.userType,
            email: user.email && user.email.validated ? user.email.address : undefined,
            phoneNumber: user.phoneNumber && user.phoneNumber.validated ? user.phoneNumber.number : undefined,
            address: user.address,
            birthdate: user.birthdate,
            gender: user.gender,
            showMe: user.showMe,
            bio: user.bio,
            interests: user.interests,
            photos: user.photos,
            discovery: user.discovery,
            location: user.location,
            premium: user.premium,
            verification: user.verification,
            onboardingCompleted: user.onboardingCompleted,
            metrics: user.metrics
          }
          successRes(res, '', body)
        } else {
          logger.warn('The user does not exist!')
          const error = new myError('The user does not exist!', 400, 25, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد')
          next(error)
        }
      })
      .catch((err) => next(err))
  }))

userRoutes.post('/editProfile',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    const body = {
      name: req.body.profileName,
      lastName: req.body.profileLastName,
      username: req.body.profileUsername,
      birthdate: req.body.profileBirthdate,
      phoneNumber: req.body.profilePhoneNumber,
      bio: req.body.profileBio,
      gender: req.body.profileGender,
      showMe: req.body.profileShowMe,
      interests: req.body.profileInterests,
      discovery: {
        distanceKm: req.body.discoveryDistanceKm,
        ageMin: req.body.discoveryAgeMin,
        ageMax: req.body.discoveryAgeMax,
        visible: req.body.discoveryVisible,
        global: req.body.discoveryGlobal
      }
    }
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (user && user._id.toString() === userId) {
          Object.keys(body).forEach((element: any) => {
            if (body[`${element}`]) {
              if (profileEditableFields.includes(element)) {
                if (element === 'phoneNumber') {
                  user.phoneNumber['number'] = body[`${element}`]
                } else if (element === 'discovery') {
                  const d = body[`${element}`]
                  Object.keys(d).forEach((k: any) => {
                    if (d[k] !== undefined && d[k] !== null) {
                      user.discovery[k] = d[k]
                    }
                  })
                } else {
                  user[`${element}`] = body[`${element}`]
                }
              } else {
                logger.warn('Some fields are not existed or valid.')
                const error = new myError('Some fields are not existed or valid.', 400, 1, 'خطا رخ داد', 'خطا رخ داد')
                next(error)
              }
            }
          })
          return user.save()
            .then(() => {
              const result = {
                name: user.name,
                lastName: user.lastName,
                mobilePhobne: user.mobilePhobne
              }
              successRes(res, 'The data is chenged successfully!', result)
            })
            .catch((err) => {
              const message = err.message ? err.message : err;
              logger.error(message)
              next(err)
            })
        } else {
          logger.warn('The user does not exist!')
          const error = new myError('The user does not exist!', 400, 1, 'چنین مدیری در سامانه ثبت نشده است!', 'خطا رخ داد')
          next(error)
        }
      })
      .catch((err) => next(err))
  }))

  // Assuming serviceRoutes, tryCatch, and isAuthorized are defined elsewhere
  
  // Add the isAuthorized middleware here!
  userRoutes.get('/getImages/:imageType/:imagePath/:imageName',
    //  isAuthorized, // <-- CHECK: Is the user logged in?
      tryCatch((req, res, next) => {
          const imageType = req.params.imageType;
          const imagePath = req.params.imagePath; // Will be the userId
          const imageName = req.params.imageName;
          
          // --- Added Logic to enforce ownership (if needed) ---
          // const loggedInUserId = req.session.userId;
  
          // // If the request is for a 'users' image path, enforce that the requested userId 
          // // must match the logged-in user's ID (or another authorization check)
          // if (imageType === 'users' && imagePath !== loggedInUserId) {
          //      // Block access if a logged-in user tries to access another user's private images
          //      return res.status(403).send({ error: 'Access denied.' });
          // }
          
          // --- Path Construction Logic (from previous answer) ---
          
          const baseDir = './images';
          let imageFilePath;
  
          if (imageType === 'users') {
              const userId = imagePath;
              imageFilePath = path.join(baseDir, 'users', userId, imageName);
              
          } else {
              // Keep original logic for non-user images (e.g., 'coins')
              const validPaths = ['coins'];
              
              if (req.query.type && validPaths.includes(req.query.type)) {
                  imageFilePath = path.join(baseDir, imageName);
              } else {
                  imageFilePath = path.join(baseDir, imageType, imagePath, imageName);
              }
          }
          
          // --- File Reading and Response (rest is the same) ---
          if (!fs.existsSync(imageFilePath)) {
              console.warn(`Image file not found at: ${imageFilePath}`);
              return res.status(404).send({ error: 'Image not found.' });
          }
  
          const imageFile = fs.readFileSync(imageFilePath);
          const ext = path.extname(imageName);
          
          res.contentType(`image/${ext.substring(1)}`);
          res.send(imageFile);
      })
  );
userRoutes.post('/setNewAddress',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    const province = req.body.provinceOp
    const city = req.body.cityOp
    const postalCode = req.body.postalCodeOp
    const address = req.body.addressOp
    const district = req.body.districtOp
    const phone = req.body.phoneOp
    const coordinates = req.body.coordinates
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (user && user._id.toString() === userId) {
          if (user.address) {
            const theAddress = {
              province: province ? province : user.address.province,
              city: city ? city : user.address.city,
              postalCode: postalCode ? postalCode : user.address.postalCode,
              address: address ? address : user.address.address,
              district: district ? district : user.address.district,
              phone: phone ? phone : user.address.phone,
            }
            user.address = theAddress
            if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
              user.location = {
                type: 'Point',
                coordinates,
                updatedAt: new Date()
              }
            }
            return user.save()
              .then(() => {
                successRes(res, '', user.address)
              })
              .catch((err) => next(err))
          } else {
            if (province && city && postalCode && address) {
              const theAddress = {
                province,
                city,
                postalCode,
                address,
                district,
                phone,
              }
              user.address = theAddress
              if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
                user.location = {
                  type: 'Point',
                  coordinates,
                  updatedAt: new Date()
                }
              }
              return user.save()
                .then(() => {
                  successRes(res, '', user.address)
                })
                .catch((err) => next(err))
            } else {
              const error = new myError('Invalid address data', 400, 1, 'خطا رخ داد', 'خطا رخ داد')
              next(error)
            }
          }
        } else {
          const error = new myError('The user does not exist!', 400, 1, 'چنین کاربری ثبت نشده است!', 'خطا رخ داد')
          next(error)
        }
      })
      .catch((err) => next(err))
  }))

// Photos upload (temp)
userRoutes.post('/photos/upload',
  isAuthorized,
  uploadTemp,
  tryCatch((req, res, next) => {
    if (!req.file) {
      const error = new myError('There is no image!', 400, 11, 'هیچ عکسی بارگذاری نشده است!', 'خطا رخ داد')
      return next(error)
    }
    const imagePath = req.file.filename.split('.')[0]
    const imageExt = req.file.filename.split('.')[1]
    return successRes(res, '', { imagePath, imageExt })
  })
)

// Commit temp photo to user profile
userRoutes.post('/photos/add',
  isAuthorized,
  tryCatch(async (req, res, next) => {
    const userId = req.session.userId
    const { imageName, isPrimary } = req.body || {}
    if (!imageName) {
      const error = new myError('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد')
      return next(error)
    }
    const tempPath = `./images/temp/${imageName}`
    if (!fs.existsSync(tempPath)) {
      const error = new myError('Temp image not found', 400, 11, 'تصویر یافت نشد', 'خطا رخ داد')
      return next(error)
    }
    const userDir = `./images/users/${userId}`
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }
    const finalPath = `${userDir}/${imageName}`
    const file = await fsp.readFile(tempPath)
    await fsp.writeFile(finalPath, file)
    fs.unlink(tempPath, () => {})

    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (!user) {
          const error = new myError('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد')
          return next(error)
        }
        const url = `/users/${userId}/${imageName}`
        const photoDoc = { url, isPrimary: !!isPrimary, uploadedAt: new Date() }
        if (isPrimary) {
          if (Array.isArray(user.photos)) {
            user.photos = user.photos.map((p: any) => ({ ...p, isPrimary: false }))
          }
        }
        if (!Array.isArray(user.photos)) user.photos = []
        user.photos.push(photoDoc as any)
        return user.save()
          .then(() => successRes(res, 'photo added', photoDoc))
      })
      .catch((err) => next(err))
  })
)

userRoutes.post('/photos/setPrimary',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    const { url } = req.body || {}
    if (!url) {
      const error = new myError('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد')
      return next(error)
    }
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (!user) {
          const error = new myError('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد')
          return next(error)
        }
        if (!Array.isArray(user.photos)) user.photos = []
        user.photos = user.photos.map((p: any) => ({ ...p, isPrimary: p.url === url }))
        return user.save().then(() => successRes(res, 'primary set'))
      })
      .catch((err) => next(err))
  })
)

userRoutes.post('/photos/remove',
  isAuthorized,
  tryCatch(async (req, res, next) => {
    const userId = req.session.userId
    const { url } = req.body || {}
    if (!url) {
      const error = new myError('Invalid image', 400, 11, 'تصویر نامعتبر است', 'خطا رخ داد')
      return next(error)
    }
    const filename = url.split('/').pop()
    const filePath = `./images/users/${userId}/${filename}`
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, () => {})
    }
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (!user) {
          const error = new myError('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد')
          return next(error)
        }
        if (!Array.isArray(user.photos)) user.photos = []
        user.photos = user.photos.filter((p: any) => p.url !== url)
        return user.save().then(() => successRes(res, 'photo removed'))
      })
      .catch((err) => next(err))
  })
)

// Wallet connect/disconnect
userRoutes.post('/wallet/connect',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    const { provider, address } = req.body || {}
    if (!address) {
      const error = new myError('Invalid wallet', 400, 1, 'کیف پول نامعتبر است', 'خطا رخ داد')
      return next(error)
    }
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (!user) {
          const error = new myError('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد')
          return next(error)
        }
        user.wallet = { provider, address, connectedAt: new Date() }
        return user.save().then(() => successRes(res, 'wallet connected', user.wallet))
      })
      .catch((err) => next(err))
  })
)

userRoutes.post('/wallet/disconnect',
  isAuthorized,
  tryCatch((req, res, next) => {
    const userId = req.session.userId
    return User.findOne({ _id: userId })
      .then((user: any) => {
        if (!user) {
          const error = new myError('The user does not exist!', 400, 1, 'کاربر یافت نشد', 'خطا رخ داد')
          return next(error)
        }
        user.wallet = undefined
        return user.save().then(() => successRes(res, 'wallet disconnected'))
      })
      .catch((err) => next(err))
  })
)


