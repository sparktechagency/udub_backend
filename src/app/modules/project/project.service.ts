import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { IProject } from './project.interface';
import { User } from '../user/user.model';
import { Project } from './project.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import Notification from '../notification/notification.model';
import { getIO } from '../../socket/socketManager';
import getUserNotificationCount from '../../helper/getUserNotificationCount';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';

const createProject = async (payload: IProject) => {
  const io = getIO();
  // const managers = await User.find({
  //   _id: {
  //     $in: [
  //       payload.projectManager,
  //       payload.officeManager,
  //       payload.financeManager,
  //       payload.projectOwner,
  //     ],
  //   },
  // }).select('_id');

  // const existingManagerIds = new Set(
  //   managers.map((manager) => manager._id.toString()),
  // );

  // if (!existingManagerIds.has(payload.projectManager.toString())) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Project manager not found');
  // }
  // if (!existingManagerIds.has(payload.officeManager.toString())) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Office manager not found');
  // }
  // if (!existingManagerIds.has(payload.financeManager.toString())) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Finance manager not found');
  // }
  // if (!existingManagerIds.has(payload.projectOwner.toString())) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Project owner not found');
  // }

  const result = await Project.create(payload);

  const receivers = [
    payload.projectManager.toString(),
    payload.financeManager.toString(),
    payload.officeManager.toString(),
    payload.projectOwner.toString(),
  ];

  const notificationData = receivers.map((receiver) => ({
    title: 'New project assigned',
    message: `You assigned a new project: ${payload.name}`,
    receiver,
    type: ENUM_NOTIFICATION_TYPE.PROJECT,
    redirectId: result._id,
  }));

  await Notification.insertMany(notificationData);

  const notificationCounts = await Promise.all(
    receivers.map((receiver) => getUserNotificationCount(receiver)),
  );

  receivers.forEach((receiver, index) => {
    io.to(receiver).emit('notification', notificationCounts[index]);
  });
  return result;
};

// get all project

const getAllProject = async (query: Record<string, unknown>) => {
  const projectQuery = new QueryBuilder(
    Project.find()
      .populate({
        path: 'projectManager',
        select: 'name email phone profile_image',
      })
      .populate({
        path: 'officeManager',
        select: 'name email phone profile_image',
      })
      .populate({
        path: 'financeManager',
        select: 'name email phone profile_image',
      })
      .populate({
        path: 'projectOwner',
        select: 'name email phone profile_image',
      }),
    query,
  )
    .search(['name', 'title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();

  return {
    meta,
    result,
  };
};
const getMyProject = async (
  userData: JwtPayload,
  query: Record<string, unknown>,
) => {
  let projectQuery;
  if (userData?.role == USER_ROLE.user) {
    projectQuery = new QueryBuilder(
      Project.find({ projectOwner: userData.id }),
      query,
    )
      .search(['name', 'title'])
      .filter()
      .sort()
      .paginate()
      .fields();
  } else if (userData?.role == USER_ROLE.manager) {
    projectQuery = new QueryBuilder(
      Project.find({ projectManager: userData.id }),
      query,
    )
      .search(['name', 'title'])
      .filter()
      .sort()
      .paginate()
      .fields();
  } else if (userData?.role == USER_ROLE.financeManager) {
    projectQuery = new QueryBuilder(
      Project.find({ financeManager: userData.id }),
      query,
    )
      .search(['name', 'title'])
      .filter()
      .sort()
      .paginate()
      .fields();
  } else if (userData?.role == USER_ROLE.officeManager) {
    projectQuery = new QueryBuilder(
      Project.find({ officeManager: userData.id }),
      query,
    )
      .search(['name', 'title'])
      .filter()
      .sort()
      .paginate()
      .fields();
  }

  if (!projectQuery) {
    throw new AppError(httpStatus.NOT_FOUND, 'Data not found');
  }

  const result = await projectQuery.modelQuery;
  const meta = await projectQuery.countTotal();
  return {
    meta,
    result,
  };
};

// get singel projet
const getSingleProject = async (id: string) => {
  const result = await Project.findById(id)
    .populate({
      path: 'projectManager',
      select: 'name email profile_image phone address',
    })
    .populate({
      path: 'officeManager',
      select: 'name email profile_image phone address',
    })
    .populate({
      path: 'financeManager',
      select: 'name email profile_image phone address',
    })
    .populate({
      path: 'projectOwner',
      select: 'name email profile_image phone address',
    });
  return result;
};

const deleteProject = async (id: string) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  const result = await Project.findByIdAndDelete(id);

  // TOOD: need to delete corrospoding images and documents

  return result;
};

const updateProject = async (id: string, payload: Partial<IProject>) => {
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

  if (
    payload?.projectManager &&
    !existingManagerIds.has(payload.projectManager.toString())
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project manager not found');
  }
  if (
    payload?.officeManager &&
    !existingManagerIds.has(payload.officeManager.toString())
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Office manager not found');
  }
  if (
    payload?.financeManager &&
    !existingManagerIds.has(payload.financeManager.toString())
  ) {
    throw new AppError(httpStatus.NOT_FOUND, 'Finance manager not found');
  }
  const project = await Project.exists({ _id: id });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const ProjectServices = {
  createProject,
  getAllProject,
  getSingleProject,
  deleteProject,
  updateProject,
  getMyProject,
};
export default ProjectServices;
