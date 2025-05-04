/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import project_imageServices from './project_image.service';
// import { sendImageToCloudinary } from '../../utilities/sendImageToCloudinary';
// import AppError from '../../error/appError';

const uploadImagesForProject = catchAsync(async (req, res) => {
  const result = await project_imageServices.uploadImageForProject(
    req.user.id,
    req.params.projectId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images uploaded successfully',
    data: result,
  });
});
const updateImage = catchAsync(async (req, res) => {
  // const { files } = req;
  // if (files && typeof files === 'object' && 'image' in files) {
  //   req.body.image_url = files['image'][0].path;
  // }
  const result = await project_imageServices.updateImage(
    req.user.id,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images updated successfully',
    data: result,
  });
});
const getProjectImages = catchAsync(async (req, res) => {
  const result = await project_imageServices.getProjectImages(
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Images retrieved successfully',
    data: result,
  });
});
const getSingleImage = catchAsync(async (req, res) => {
  const result = await project_imageServices.getSingleImage(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image retrieved successfully',
    data: result,
  });
});

const Project_imageController = {
  uploadImagesForProject,
  updateImage,
  getProjectImages,
  getSingleImage,
};
export default Project_imageController;
