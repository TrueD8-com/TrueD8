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

const configuredOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const allowedOrigins = new Set([
  'https://true-d8-theta.vercel.app',
  'https://trued8.com',
  'https://www.trued8.com',
  'http://www.trued8.com',
  'http://trued8.com',
  'https://trued8.com.ng',
  'https://www.trued8.com.ng',
  'http://www.trued8.com.ng',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredOrigins
])
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Requests without Origin are server-to-server, same-origin, or test calls.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Origin is not allowed by CORS'))
  }
}))
app.use(useragent.express())
app.use(helmet())
app.set('trust proxy', true)
const isProduction = app.get('env') === 'production'
const sessionSecret = process.env.SESSION_SECRET || process.env.SESSION_SECRET2
if (isProduction && !sessionSecret) {
  throw new Error('SESSION_SECRET or SESSION_SECRET2 is required in production')
}
const sess: session.SessionOptions = {
  secret: sessionSecret || 'development-only-session-secret',
  resave: false,
  proxy: true,
  saveUninitialized: false,
  rolling: true,
  name: 'sessionId',
  cookie: {
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    httpOnly: true,
    path: '/',
    maxAge: 1000 * 60 * 60 * 24,
  },
  store: MongoStore.create({ mongoUrl: process.env.MONGO_DATABASE, dbName: process.env.MONGO_DATABASE_NAME }),
}

if (isProduction) {
  app.set('trust proxy', 1) // trust first proxy
}
import { createServer } from 'http';
const server = createServer(app);
import { startIo } from './api/socket'

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
