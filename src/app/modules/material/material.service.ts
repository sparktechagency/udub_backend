import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { IMaterial } from './material.interface';
import { Material } from './material.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';
import Notification from '../notification/notification.model';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

const createMaterial = async (userData: JwtPayload, payload: IMaterial) => {
  const project = await Project.findOne({ _id: payload.project }).select(
    'name _id projectOwner projectManager officeManager',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  // if (payload.manufacturer || payload.image || payload.model) {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'You can just add title');
  // }
  if (
    !project.projectManager.includes(userData.id) &&
    userData?.role != USER_ROLE.superAdmin
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not asssigned this project , so you can't able to add a material",
    );
  }
  const result = await Material.create({
    ...payload,
    project: payload.project,
    createdBy: userData?.id,
    projectOwner: project.projectOwner,
  });

  // send notification---------------
  for (const ownerId of project.projectOwner) {
    const notificationDataForUser = {
      title: 'New Meterial added',
      message: `A new meterial added to project : ${project.name} `,
      receiver: ownerId.toString(),
      type: ENUM_NOTIFICATION_TYPE.MATERIAL,
      redirectId: result._id.toString(),
    };

    sendNotification(notificationDataForUser);
  }

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
  const project = await Project.findById(material.project).select(
    'name projectManager financeManager officeManager projectOwner',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (
    userData.role == USER_ROLE.manager ||
    userData.role == USER_ROLE.officeManager ||
    userData.role == USER_ROLE.superAdmin
  ) {
    // if (payload.manufacturer || payload.image || payload.model) {
    //   throw new AppError(httpStatus.BAD_REQUEST, 'You can just update title');
    // }

    if (
      project.projectManager.includes(userData.id) &&
      project.officeManager.includes(userData.id) &&
      project.officeManager.includes(userData.id)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You are not asssigned this project , so you can't able to update this material",
      );
    }
  }
  if (userData.role == USER_ROLE.user) {
    if (!material.projectOwner.includes(userData.id)) {
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

  // for send notification ============
  if (
    userData.role == USER_ROLE.manager ||
    userData.role == USER_ROLE.superAdmin ||
    userData.role == USER_ROLE.officeManager
  ) {
    for (const ownerId of project.projectOwner) {
      const notifcationDataForUser = {
        title: `Material updated`,
        message: `Material updated for project : ${project.name}`,
        receiver: ownerId.toString(),
        type: ENUM_NOTIFICATION_TYPE.MATERIAL,
        redirectId: material._id.toString(),
      };
      sendNotification(notifcationDataForUser);
    }
  } else {
    const receivers = [
      ...project.projectManager,
      ...project.officeManager,
      USER_ROLE.superAdmin,
    ];
    const notificationData = receivers.map((receiver) => ({
      title: `Material updated`,
      message: `Material updated by project owner for project : ${project.name}`,
      receiver: receiver.toString(),
      type: ENUM_NOTIFICATION_TYPE.MATERIAL,
      redirectId: material._id.toString(),
    }));
    await Notification.create(notificationData);
    notificationData.forEach((data) => {
      sendNotification(data);
    });
  }
  return result;
};

const getProjectMaterial = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const resultQuery = new QueryBuilder(Material.find({ project: id }), query)
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
  getProjectMaterial,
  getSingleMaterial,
};
export default MaterialServices;
