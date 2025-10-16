import myError from '../api/myError';
import * as rateLimiteFlexible from 'rate-limiter-flexible';
import { createClient } from 'redis';

export const globalRedisClient = createClient({
  url: process.env.REDIS_HOST,
  disableOfflineQueue: true,
});
globalRedisClient.on('connect', function (err) {
  console.log('Redis-server is connected');
});
globalRedisClient.on('error', function (err) {
  console.log('Error ' + err);
});

const RateLimiterRedis = rateLimiteFlexible.RateLimiterRedis;

// const maxWrongAttemptsByIPperDay = 100
// const maxConsecutiveFailsByUsernameAndIP = 5

const maxWrongAttemptsByIPperDay = 99999999;
const maxConsecutiveFailsByUsernameAndIP = 99999;
const rateLimiterRedis = new RateLimiterRedis({
  storeClient: globalRedisClient,
  points: maxWrongAttemptsByIPperDay, // Number of points
  duration: 1000, // Per second,
  blockDuration: 60 * 60, // Per second
});

export const rateLimiterMiddleware = (req, res, next) => {
  rateLimiterRedis
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch((err) => {
      err.statusCode = 429;
      err.clientCode = 11;
      err.clientMessage = 'درخواست بیش از حد انجام داده اید! بعد از یک ساعت دیگر دوباره اقدام بفرمایید!';
      err.messageEnglish = 'Too Many Requests';
      next(err);
    });
};

const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: globalRedisClient,
  keyPrefix: 'login_fail_ip_per_day',
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterRedis({
  storeClient: globalRedisClient,
  keyPrefix: 'login_fail_consecutive_username_and_ip',
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60, // Store number for 90 days since first fail
  blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

export async function preventBruteForce(req, res, next) {
  const ipAddr = req.ip;
  const usernameIPkey = getUsernameIPkey(req.body.email, ipAddr);

  const [resUsernameAndIP, resSlowByIP] = await Promise.all([
    limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
    limiterSlowBruteByIP.get(ipAddr),
  ]);
  let retrySecs = 0;

  // Check if IP or Username + IP is already blocked
  if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
    retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
  } else if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP) {
    retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
  }

  if (retrySecs > 0) {
    const error = new myError(
      `Too many requests for user ${req.body.email} with ip ${ipAddr}`,
      1,
      429,
      'درخواست بیش از حد انجام داده اید! بعد از یک ساعت دیگر دوباره اقدام بفرمایید!',
      'خطا رخ داد',
    );
    next(error);
  } else {
    limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey);
    limiterSlowBruteByIP.consume(ipAddr);
    next();
  }
}
