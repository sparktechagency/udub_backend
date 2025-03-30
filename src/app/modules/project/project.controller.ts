import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import projectServices from './project.service';
import { uploadToS3FromServer } from '../../helper/uploadToS3FromServer';

const createProject = catchAsync(async (req, res) => {
  const { files } = req;
  let project_image_path;
  if (files && typeof files === 'object' && 'project_images' in files) {
    project_image_path = files['project_images'][0].path;
  }
  // const imageName = req.user.id;
  if (project_image_path) {
    const project_image_url = await uploadToS3FromServer(project_image_path);
    req.body.projectImage = project_image_url as string;
  }
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
const getMyProject = catchAsync(async (req, res) => {
  const result = await projectServices.getMyProject(req.user, req.query);
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
  const { files } = req;
  let project_image_path;
  if (files && typeof files === 'object' && 'project_images' in files) {
    project_image_path = files['project_images'][0].path;
  }
  // const imageName = req.user.id;
  if (project_image_path) {
    const project_image_url = await uploadToS3FromServer(project_image_path);
    req.body.projectImage = project_image_url as string;
  }
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
  getMyProject,
};
export default ProjectController;
