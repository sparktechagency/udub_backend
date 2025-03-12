/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ProjectImage } from './project_image.model';
import { Project } from '../project/project.model';

const uploadImageForProject = async (userId: string, payload: any) => {
  const project = await Project.exists({ _id: payload.projectId });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const imageData = payload.imageData;

  if (!imageData || imageData.length !== payload.images.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Each image must have a corresponding title, description, and projectId',
    );
  }

  const imagesData = payload.images.map((image: string, index: number) => ({
    addedBy: userId,
    projectId: imageData[index].projectId,
    title: imageData[index].title || '',
    description: imageData[index].description || '',
    image_url: image,
  }));

  const result = await ProjectImage.insertMany(imagesData);
  return result;
};

const Project_imageServices = { uploadImageForProject };
export default Project_imageServices;
