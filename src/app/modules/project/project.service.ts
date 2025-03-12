import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProject } from './project.interface';
import { User } from '../user/user.model';
import { Project } from './project.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createProject = async (payload: IProject) => {
  const managers = await User.find({
    _id: {
      $in: [
        payload.projectManager,
        payload.officeManager,
        payload.financeManager,
      ],
    },
  }).select('_id');

  const existingManagerIds = new Set(
    managers.map((manager) => manager._id.toString()),
  );

  if (!existingManagerIds.has(payload.projectManager.toString())) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project manager not found');
  }
  if (!existingManagerIds.has(payload.officeManager.toString())) {
    throw new AppError(httpStatus.NOT_FOUND, 'Office manager not found');
  }
  if (!existingManagerIds.has(payload.financeManager.toString())) {
    throw new AppError(httpStatus.NOT_FOUND, 'Finance manager not found');
  }

  const result = await Project.create(payload);
  return result;
};

// get all project

const getAllProject = async (query: Record<string, unknown>) => {
  const projectQuery = new QueryBuilder(Project.find(), query)
    .search(['name', 'title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();
  return {
    result,
    meta,
  };
};

const ProjectServices = { createProject, getAllProject };
export default ProjectServices;
