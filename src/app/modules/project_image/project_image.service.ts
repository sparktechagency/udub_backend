/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { ProjectImage } from './project_image.model';
import { Project } from '../project/project.model';
import { IProject_image } from './project_image.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';
import { deleteFileFromS3 } from '../../helper/deleteFileFromS3';
import mongoose from 'mongoose';
import { getCloudFrontUrl } from '../../helper/getCloudfontUrl';

const uploadImageForProject = async (
  userId: string,
  projectId: string,
  payload: any,
) => {
  const project = await Project.findOne({ _id: projectId }).select(
    'projectOwner name',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // const imageData = payload.imageData;

  // if (!imageData || imageData.length !== payload.images.length) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Each image must have a corresponding title, description, and projectId',
  //   );
  // }
  const imagesData = payload.map((image: any) => ({
    addedBy: userId,
    projectId: projectId,
    title: image.title,
    description: image.description,
    //!TODO: if you want to change s3 to cloudfont
    // image_url: image.image_url,
    image_url: getCloudFrontUrl(image?.image_url),
  }));
  const result = await ProjectImage.insertMany(imagesData);
  for (const ownerId of project.projectOwner) {
    const notifcationDataForUser = {
      title: `Document added`,
      message: `Document added for project : ${project.name}`,
      receiver: ownerId.toString(),
      type: ENUM_NOTIFICATION_TYPE.PROJECT,
      redirectId: projectId.toString(),
    };
    sendNotification(notifcationDataForUser);
  }

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
  if (payload.image_url) {
    payload.image_url = getCloudFrontUrl(payload?.image_url);
  }
  const result = await ProjectImage.findByIdAndUpdate(
    id,
    { ...payload, addedBy: updateBy },
    {
      new: true,
      runValidators: true,
    },
  );
  // TOOD: need to be change in store image another way
  if (payload.image_url) {
    const oldFileName = image.image_url.split('cloudfront.net/')[1];
    await deleteFileFromS3(oldFileName);
  }
  return result;
};

const getProjectImages = async (id: string, query: Record<string, unknown>) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  const imageQuery = new QueryBuilder(
    ProjectImage.find({ projectId: id }),
    query,
  )
    .search(['title', 'description'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await imageQuery.countTotal();
  const result = await imageQuery.modelQuery;

  const adminDropdownItems = project.locationDropDownItems;
  const dropDownItems: any = await ProjectImage.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $group: {
        _id: '$title',
      },
    },
    {
      $project: {
        _id: 0,
        title: '$_id',
      },
    },
  ]);

  // Using .map() after awaiting the result
  const uniqueTitles = dropDownItems?.map((item: any) => item.title);
  return {
    meta,
    result,
    adminDropdownItems,
    userDropdownItems: uniqueTitles,
  };
};

const getSingleImage = async (id: string) => {
  const result = await ProjectImage.findById(id);
  return result;
};

const deleteImage = async (id: string) => {
  const result = await ProjectImage.findByIdAndDelete(id);

  if (result?.image_url) {
    await deleteFileFromS3(result.image_url.split('cloudfront.net/')[1]);
  }
  return result;
};

const Project_imageServices = {
  uploadImageForProject,
  updateImage,
  getProjectImages,
  getSingleImage,
  deleteImage,
};
export default Project_imageServices;
