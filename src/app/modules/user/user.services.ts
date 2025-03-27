/* eslint-disable no-unused-vars */

import { User } from './user.model';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { TUser } from './user.interface';
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { deleteFileFromS3 } from '../../helper/deleteFileFromS3';

const registerUser = async (payload: TUser) => {
  const emailExist = await User.findOne({ email: payload.email });
  if (emailExist) {
    throw new AppError(httpStatus.BAD_REQUEST, 'This email already exist');
  }
  const result = await User.create(payload);
  return result;
};
///
const updateUserProfile = async (id: string, payload: Partial<TUser>) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.profile_image) {
    const oldFileName = user.profile_image.split('amazonaws.com/')[1];
    console.log('oldfile name', oldFileName);
    await deleteFileFromS3(oldFileName);
  }
  return result;
};

const getMyProfile = async (userData: JwtPayload) => {
  const result = await User.findOne({ email: userData.email });
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

const getAllUserFromDB = async (query: Record<string, unknown>) => {
  const resultQuery = new QueryBuilder(User.find(), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await resultQuery.countTotal();
  const result = await resultQuery.modelQuery;
  return {
    meta,
    result,
  };
};

// all cron jobs for users---------------

const userServices = {
  registerUser,
  updateUserProfile,
  getMyProfile,
  deleteUserAccount,
  getAllUserFromDB,
};

export default userServices;
