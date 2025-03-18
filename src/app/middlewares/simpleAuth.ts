/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import config from '../config';

const simpleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return next();
    }

    let decoded: JwtPayload | null = null;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        decoded = jwt.decode(token) as JwtPayload | null;
      } else {
        return next();
      }
    }

    if (decoded) {
      req.user = decoded;
    }

    next();
  } catch (error) {
    next();
  }
};

export default simpleAuth;
