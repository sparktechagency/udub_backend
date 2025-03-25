import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import userServices from './user.services';
import { sendImageToCloudinary } from '../../utilities/sendImageToCloudinary';

const registerUser = catchAsync(async (req, res) => {
  const result = await userServices.registerUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User registration successful.Check email for verify your email',
    data: result,
  });
});

const updateUserProfile = catchAsync(async (req, res) => {
  const { files } = req;
  let profile_image_path;
  if (files && typeof files === 'object' && 'profile_image' in files) {
    profile_image_path = files['profile_image'][0].path;
  }
  const imageName = req.user.id;
  if (profile_image_path) {
    const { secure_url } = await sendImageToCloudinary(
      imageName,
      profile_image_path as string,
      'profile_image',
    );
    req.body.profile_image = secure_url as string;
  }

  const result = await userServices.updateUserProfile(req.user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req, res) => {
  const result = await userServices.getMyProfile(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Successfully retrieved your data',
    data: result,
  });
});

const deleteUserAccount = catchAsync(async (req, res) => {
  const result = await userServices.deleteUserAccount(
    req.user,
    req.body.password,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Your account deleted successfully`,
    data: result,
  });
});
const getAllUser = catchAsync(async (req, res) => {
  const result = await userServices.getAllUserFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User retrieved successfully`,
    data: result,
  });
});

const userController = {
  registerUser,

  updateUserProfile,
  getAllUser,
  getMyProfile,
  deleteUserAccount,
};
export default userController;
