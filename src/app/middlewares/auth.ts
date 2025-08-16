/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utilities/catchasync';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { TUserRole } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // check if the token is sent from client -----
    const token = req?.headers?.authorization;
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized 1');
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, role, email, username, iat } = decoded;

    if (!decoded) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Token is expired');
    }
    // get the user if that here ---------
    const user = await User.findById(id);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'This user does not exist');
    }

    if (user.isBlock) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked');
    }
    if (
      user?.passwordChangedAt &&
      (await User.isJWTIssuedBeforePasswordChange(
        user?.passwordChangedAt,
        iat as number,
      ))
    ) {
      throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized 2');
    }
    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Your are not authorized 3');
    }
    // add those properties in req
    req.user = decoded as JwtPayload;
    next();
  });
};

export default auth;
