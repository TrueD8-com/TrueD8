import express, { Express, Request, Response, Application, Router } from 'express';
import session from 'express-session';
import morgan, { StreamOptions } from 'morgan';
import MongoStore from 'connect-mongo';
import * as bodyParser from 'body-parser';
import cookieParser, * as cookiePareser from 'cookie-parser';
import helmet from 'helmet';
import mongoose, { ConnectOptions } from 'mongoose';
import * as useragent from 'express-useragent';
import 'dotenv/config';
import * as queryFile from './api/query';
import errorHandler from './middlewares/errorHandler';

import { logger, LoggerStream } from './api/logger';
import csurf from 'csurf';
import cors from 'cors';




// import { serviceRoutes } from './routes/service'
// import { userRoutes } from './routes/user'
import { authRoutes } from './routes/auth'
import { datingRoutes } from './routes/dating'
import { userRoutes as userDatingRoutes } from './routes/user.dating'
import { adminDatingRoutes } from './routes/admin.dating'


mongoose.Promise = global.Promise;
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGO_DATABASE, {
    maxPoolSize: 5000,
    wtimeoutMS: 2500000,
    socketTimeoutMS: 36000000,
    connectTimeoutMS: 36000000,
  })
  .catch((err) => {
    logger.error(err);
  });
const mongooseDB = mongoose.connection;


const app = express();
const port = process.env.PORT || 9001;


app.use(
  morgan(
    ':remote-addr ":method :url HTTP/:http-version" :status :res[content-length] :response-time ":referrer" ":user-agent" ',
    { stream: new LoggerStream() },
  ),
);
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors({ credentials: true, origin: [
  ] }))
app.use(useragent.express())
app.use(helmet())
app.set('trust proxy', true)
var sess = {
  secret: 'no body is perfect, i am nobody',
  resave: false,
  proxy: true,
  saveUninitialized: true,
  rolling: true,
 // SameSite: true,
  name: 'sessionId',
  cookie: {
    // secure: true,
    httpOnly: true,
    // domain:,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_DATABASE, dbName: process.env.MONGO_DATABASE_NAME }),
}
var sess2 = {
  secret: process.env.SESSION_SECRET2,
  resave: false,
  proxy: true,
  saveUninitialized: true,
  rolling: true,
  //  SameSite: true,
  name: 'sessionId',
  cookie: {
    // secure: true,
    httpOnly: true,
    // domain:,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_DATABASE, dbName: process.env.MONGO_DATABASE_NAME }),
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  //sess.cookie.secure = true // serve secure cookies
}
import { createServer } from 'http';
const server = createServer(app);
import { startIo } from './api/socket'

var sharedsession = require('express-socket.io-session');
var sessionMiddleware = session(sess);

app.use(sessionMiddleware);




app.use('/api/auth', authRoutes)
app.use('/api/dating', datingRoutes)
app.use('/api/user', userDatingRoutes)
app.use('/api/admin', adminDatingRoutes)

app.use(csurf());
app.use(errorHandler);



let myServer;
const start = async () => {
  try {
    myServer = server.listen(port, () => {
      console.log(`Server is connected to redis and is listening on port ${port}`);
    });
    startIo(server, sessionMiddleware)
  } catch (error) {
    console.log(error);
  }
};
start();

export default myServer;