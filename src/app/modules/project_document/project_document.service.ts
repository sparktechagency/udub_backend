import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProject_document } from './project_document.interface';
import project_documentModel from './project_document.model';

const updateUserProfile = async (
  id: string,
  payload: Partial<IProject_document>,
) => {
  if (payload.email || payload.username) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You cannot change the email or username',
    );
  }
  const user = await project_documentModel.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Profile not found');
  }
  return await project_documentModel.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};

const Project_documentServices = { updateUserProfile };
export default Project_documentServices;
