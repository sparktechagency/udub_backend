import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import project_imageServices from './project_image.service';

const uploadImagesForProject = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'images' in files) {
    req.body.images = files['images'].map((file) => file.path);
  }
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
