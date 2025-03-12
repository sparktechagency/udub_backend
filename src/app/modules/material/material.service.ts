import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { IMaterial } from './material.interface';
import { Material } from './material.model';

const createMaterial = async (userId: string, payload: IMaterial) => {
  const project = await Project.exists({ _id: payload.project });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  const result = await Material.create({
    ...payload,
    project: payload.project,
    userId,
  });
  return result;
};

const MaterialServices = { createMaterial };
export default MaterialServices;
