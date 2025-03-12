import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { IMaterial } from './material.interface';
import { Material } from './material.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';

const createMaterial = async (userId: string, payload: IMaterial) => {
  const project = await Project.findOne({ _id: payload.project });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (payload.manufacturer || payload.image || payload.model) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You can just add title');
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

const MaterialServices = { createMaterial, updateMaterial };
export default MaterialServices;
