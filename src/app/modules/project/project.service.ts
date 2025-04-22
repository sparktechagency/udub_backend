/* eslint-disable @typescript-eslint/no-explicit-any */
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
import Conversation from '../conversation/conversation.model';
import { CONVERSATION_TYPE } from '../conversation/conversation.enum';
import getSpecificSheet from '../../helper/getSpecificSheet';

const createProject = async (payload: IProject) => {
  const io = getIO();
  console.log('payload', payload);
  // Check for projectManager
  if (payload.projectManager && payload.projectManager.length > 0) {
    const managers = await User.find({
      _id: { $in: payload.projectManager },
      role: USER_ROLE.manager,
    });
    if (managers.length !== payload.projectManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Managers');
    }
  }

  // Check for financeManager
  if (payload.financeManager && payload.financeManager.length > 0) {
    const financeManagers = await User.find({
      _id: { $in: payload.financeManager },
      role: USER_ROLE.financeManager,
    });
    if (financeManagers.length !== payload.financeManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Finance Managers');
    }
  }

  // Check for officeManager
  if (payload.officeManager && payload.officeManager.length > 0) {
    const officeManagers = await User.find({
      _id: { $in: payload.officeManager },
      role: USER_ROLE.officeManager,
    });
    if (officeManagers.length !== payload.officeManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Office Managers');
    }
  }

  // Check for projectOwner
  if (payload.projectOwner && payload.projectOwner.length > 0) {
    const projectOwners = await User.find({
      _id: { $in: payload.projectOwner },
      role: USER_ROLE.user,
    });
    if (projectOwners.length !== payload.projectOwner.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Project Owners');
    }
  }

  // create project
  const result = await Project.create(payload);

  const conversationData = [
    {
      participants: [...payload.projectManager, ...payload.projectOwner],
      projectId: result._id,
      type: CONVERSATION_TYPE.MANAGER_GROUP,
    },
    {
      participants: [...payload.officeManager, ...payload.projectOwner],
      projectId: result._id,
      type: CONVERSATION_TYPE.OFFICE_MANAGER_GROUP,
    },
    {
      participants: [...payload.financeManager, ...payload.projectOwner],
      projectId: result._id,
      type: CONVERSATION_TYPE.FINANCE_GROUP,
    },
  ];

  // create conversation-------------
  await Conversation.insertMany(conversationData);

  const receivers = [
    ...payload.projectManager,
    ...payload.financeManager,
    ...payload.officeManager,
    ...payload.projectOwner,
  ];

  const notificationData = receivers.map((receiver) => ({
    title: 'New project assigned',
    message: `You assigned a new project: ${payload.name}`,
    receiver,
    type: ENUM_NOTIFICATION_TYPE.PROJECT,
    redirectId: result._id,
  }));

  // create notification -----------
  await Notification.insertMany(notificationData);

  const notificationCounts = await Promise.all(
    receivers.map((receiver) => getUserNotificationCount(receiver.toString())),
  );

  receivers.forEach((receiver, index) => {
    io.to(receiver.toString()).emit('notification', notificationCounts[index]);
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
  // Check for projectManager
  if (payload.projectManager && payload.projectManager.length > 0) {
    const managers = await User.find({
      _id: { $in: payload.projectManager },
      role: USER_ROLE.manager,
    });
    if (managers.length !== payload.projectManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Managers');
    }
  }

  // Check for financeManager
  if (payload.financeManager && payload.financeManager.length > 0) {
    const financeManagers = await User.find({
      _id: { $in: payload.financeManager },
      role: USER_ROLE.financeManager,
    });
    if (financeManagers.length !== payload.financeManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Finance Managers');
    }
  }

  // Check for officeManager
  if (payload.officeManager && payload.officeManager.length > 0) {
    const officeManagers = await User.find({
      _id: { $in: payload.officeManager },
      role: USER_ROLE.officeManager,
    });
    if (officeManagers.length !== payload.officeManager.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Office Managers');
    }
  }

  // Check for projectOwner
  if (payload.projectOwner && payload.projectOwner.length > 0) {
    const projectOwners = await User.find({
      _id: { $in: payload.projectOwner },
      role: USER_ROLE.user,
    });
    if (projectOwners.length !== payload.projectOwner.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid Project Owners');
    }
  }

  const project = await Project.exists({ _id: id });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  const result = await Project.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!result) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Failed to update project',
    );
  }

  if (
    (payload.projectManager && payload.projectManager.length > 0) ||
    (payload.projectOwner && payload.projectOwner.length > 0)
  ) {
    let participants: any = [];
    if (payload.projectManager && payload.projectOwner) {
      participants = [...payload.projectManager, ...payload.projectOwner];
    } else if (payload.projectManager) {
      participants = payload.projectManager;
    } else if (payload.projectOwner) {
      participants = payload.projectOwner;
    }

    await Conversation.findOneAndUpdate(
      { projectId: result._id, type: CONVERSATION_TYPE.MANAGER_GROUP },
      { participants: participants },
    );
  }
  if (
    (payload.financeManager && payload.financeManager.length > 0) ||
    (payload.projectOwner && payload.projectOwner.length > 0)
  ) {
    let participants: any = [];
    if (payload.financeManager && payload.projectOwner) {
      participants = [...payload.financeManager, ...payload.projectOwner];
    } else if (payload.financeManager) {
      participants = payload.financeManager;
    } else if (payload.projectOwner) {
      participants = payload.projectOwner;
    }
    await Conversation.findOneAndUpdate(
      { projectId: result._id, type: CONVERSATION_TYPE.FINANCE_GROUP },
      { participants: participants },
    );
  }
  if (
    (payload.officeManager && payload.officeManager.length > 0) ||
    (payload.projectOwner && payload.projectOwner.length > 0)
  ) {
    let participants: any = [];
    if (payload.officeManager && payload.projectOwner) {
      participants = [...payload.officeManager, ...payload.projectOwner];
    } else if (payload.officeManager) {
      participants = payload.officeManager;
    } else if (payload.projectOwner) {
      participants = payload.projectOwner;
    }
    await Conversation.findOneAndUpdate(
      { projectId: result._id, type: CONVERSATION_TYPE.OFFICE_MANAGER_GROUP },
      { participants: participants },
    );
  }
  return result;
};

const getSmartSheet = async (projectId: string) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const result = await getSpecificSheet('5768154999377796');
  return result;
};

const ProjectServices = {
  createProject,
  getAllProject,
  getSingleProject,
  deleteProject,
  updateProject,
  getMyProject,
  getSmartSheet,
};
export default ProjectServices;
