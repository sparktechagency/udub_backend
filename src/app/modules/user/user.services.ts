/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { TUser } from './user.interface';
import { USER_ROLE } from './user.constant';
import { JwtPayload } from 'jsonwebtoken';

const registerUser = async (payload: TUser) => {
  const emailExist = await User.findOne({ email: payload.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  const result = await User.create(payload);
  return result;
};

const updateUserProfile = async (id: string, payload: Partial<TUser>) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getMyProfile = async (userData: JwtPayload) => {
  let result = null;
  if (userData.role === USER_ROLE.user) {
    result = await User.findOne({ email: userData.email });
  }
  return result;
};

const deleteUserAccount = async (user: JwtPayload, password: string) => {
  const userData = await User.findById(user.id);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (!(await User.isPasswordMatched(password, userData?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not match');
  }
  await User.findByIdAndDelete(user.id);

  return null;
};

// all cron jobs for users

const userServices = {
  registerUser,
  updateUserProfile,
  getMyProfile,
  deleteUserAccount,
};

export default userServices;
