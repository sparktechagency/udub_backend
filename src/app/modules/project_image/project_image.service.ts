/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ProjectImage } from './project_image.model';
import { Project } from '../project/project.model';
import { IProject_image } from './project_image.interface';
import unlinkFile from '../../helper/unLinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

const uploadImageForProject = async (userId: string, payload: any) => {
  const project = await Project.findOne({ _id: payload.projectId }).select(
    'projectOwner name',
  );
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

  const notifcationDataForUser = {
    title: `Image added`,
    message: `Image added for project : ${project.name}`,
    receiver: project.projectOwner.toString(),
    type: ENUM_NOTIFICATION_TYPE.PROJECT,
    redirectId: payload.project.toString(),
  };
  sendNotification(notifcationDataForUser);

  const result = await ProjectImage.insertMany(imagesData);
  return result;
};

const updateImage = async (
  updateBy: string,
  id: string,
  payload: Partial<IProject_image>,
) => {
  const image = await ProjectImage.findOne({ _id: id });
  if (!image) {
    throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
  }
  const result = await ProjectImage.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  // TOOD: need to be change in store image another way
  if (payload.image_url) {
    unlinkFile(image.image_url);
  }
  return result;
};

const getProjectImages = async (id: string, query: Record<string, unknown>) => {
  const imageQuery = new QueryBuilder(
    ProjectImage.find({ projectId: id }),
    query,
  )
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await imageQuery.countTotal();
  const result = await imageQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const getSingleImage = async (id: string) => {
  const result = await ProjectImage.findById(id);
  return result;
};

const Project_imageServices = {
  uploadImageForProject,
  updateImage,
  getProjectImages,
  getSingleImage,
};
export default Project_imageServices;
