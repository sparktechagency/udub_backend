import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import projectServices from './project.service';

const createProject = catchAsync(async (req, res) => {
  // const { files } = req;
  // if (files && typeof files === 'object' && 'images' in files) {
  //   req.body.images = files['image'].map((file) => file.path);
  // }
  // if (files && typeof files === 'object' && 'documents' in files) {
  //   req.body.documents = files['documents'].map((file) => file.path);
  // }
  const result = await projectServices.createProject(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project created successfully',
    data: result,
  });
});

//
const getAllProject = catchAsync(async (req, res) => {
  const result = await projectServices.getAllProject(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});

// get single project
const getSingleProject = catchAsync(async (req, res) => {
  const result = await projectServices.getSingleProject(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project retrieved successfully',
    data: result,
  });
});
const deleteProject = catchAsync(async (req, res) => {
  const result = await projectServices.deleteProject(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project deleted successfully',
    data: result,
  });
});
const updateProject = catchAsync(async (req, res) => {
  const result = await projectServices.updateProject(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Project updated successfully',
    data: result,
  });
});

const ProjectController = {
  createProject,
  getAllProject,
  getSingleProject,
  deleteProject,
  updateProject,
};
export default ProjectController;
