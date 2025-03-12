import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import MaterialServices from './material.service';

const addMaterial = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'material_image' in files) {
    req.body.profile_image = files['material_image'][0].path;
  }
  const result = await MaterialServices.createMaterial(req.user.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Material added successfully',
    data: result,
  });
});

const MaterialController = { addMaterial };
export default MaterialController;
