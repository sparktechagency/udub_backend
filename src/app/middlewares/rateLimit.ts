import { Request, Response, NextFunction } from 'express';
import Redis, { RedisKey } from 'ioredis';

const redis = new Redis();

// Middleware function for rate limiting
const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const limit = 10;
  const windowTime = 60;

  // Increment request count
  const requests = await redis.incr(ip as RedisKey);

  // Set expiry time for the first request
  if (requests === 1) {
    await redis.expire(ip as RedisKey, windowTime);
  }

  // If limit exceeded, return error
  if (requests > limit) {
    return res
      .status(429)
      .json({ message: 'Too many requests. Try again later.' });
  }

  next();
};

export default rateLimit;
