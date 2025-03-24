import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { IMaterial } from './material.interface';
import { Material } from './material.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';

const createMaterial = async (userId: string, payload: IMaterial) => {
  const project = await Project.findOne({ _id: payload.project });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (payload.manufacturer || payload.image || payload.model) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can just add title');
  }
  if (
    project.projectManager.toString() != userId &&
    !project.officeManager.toString()
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not asssigned this project , so you can't able to add a material",
    );
  }
  const result = await Material.create({
    ...payload,
    project: payload.project,
    createdBy: userId,
    projectOwner: project.projectOwnerEmail,
  });
  return result;
};

const updateMaterial = async (
  userData: JwtPayload,
  id: string,
  payload: IMaterial,
) => {
  const material = await Material.findById(id);
  if (!material) {
    throw new AppError(httpStatus.NOT_FOUND, 'Material not found');
  }
  if (
    userData.role == USER_ROLE.manager ||
    userData.role == USER_ROLE.officeManager ||
    userData.role == USER_ROLE.superAdmin
  ) {
    if (payload.manufacturer || payload.image || payload.model) {
      throw new AppError(httpStatus.BAD_REQUEST, 'You can just update title');
    }
    const project = await Project.findById(material.project);
    if (!project) {
      throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
    }
    if (
      project.projectManager.toString() != userData.userId &&
      project.officeManager.toString() != userData.userId
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are not asssigned this project , so you can't able to update this material",
      );
    }
  }
  if (userData.role == USER_ROLE.user) {
    if (material.projectOwner != userData.id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This is not your project material',
      );
    }
  }
  const result = await Material.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const getAllMatetial = async (query: Record<string, unknown>) => {
  const resultQuery = new QueryBuilder(Material.find(), query)
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

const getSingleMaterial = async (id: string) => {
  const result = await Material.findById(id);
  return result;
};

const MaterialServices = {
  createMaterial,
  updateMaterial,
  getAllMatetial,
  getSingleMaterial,
};
export default MaterialServices;
