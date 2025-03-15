/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import project_imageServices from './project_image.service';
import { sendImageToCloudinary } from '../../utilities/sendImageToCloudinary';
import AppError from '../../error/appError';

const uploadImagesForProject = catchAsync(async (req, res) => {
  const { files } = req;
  let images: any;
  if (files && typeof files === 'object' && 'project_images' in files) {
    images = files['project_images'].map((file) => file.path);
  }
  if (!images.length) {
    throw new AppError(httpStatus.NOT_FOUND, 'Images not found');
  }

  // Upload images from 'uploads' folder to Cloudinary
  const uploadedImages = await Promise.all(
    images.map(async (imagePath: any, index: any) => {
      const imageName = `${req.user.id}_${Date.now()}_${index}`;
      const { secure_url } = await sendImageToCloudinary(
        imageName,
        imagePath,
        'project_images',
      );
      return secure_url;
    }),
  );

  // Replace local paths with Cloudinary URLs in req.body
  req.body.images = uploadedImages;

  const result = await project_imageServices.uploadImageForProject(
    req.user.id,
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
  const { files } = req;
  if (files && typeof files === 'object' && 'image' in files) {
    req.body.image_url = files['image'][0].path;
  }
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

const Project_imageController = { uploadImagesForProject, updateImage };
export default Project_imageController;
