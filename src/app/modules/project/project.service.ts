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
import {
  deleteFileFromS3,
  deleteFilesFromS3,
} from '../../helper/deleteFileFromS3';
import { ProjectImage } from '../project_image/project_image.model';
import { ProjectDocument } from '../project_document/project_document.model';
import { Material } from '../material/material.model';
import { extractS3Key } from '../../helper/extractS3Key';

const createProject = async (payload: IProject) => {
  const io = getIO();
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
      participants: [
        ...(payload.projectManager || []),
        ...(payload.projectOwner || []),
      ],
      projectId: result._id,
      type: CONVERSATION_TYPE.MANAGER_GROUP,
    },
    {
      participants: [
        ...(payload.officeManager || []),
        ...(payload.projectOwner || []),
      ],
      projectId: result._id,
      type: CONVERSATION_TYPE.OFFICE_MANAGER_GROUP,
    },
    {
      participants: [
        ...(payload.financeManager || []),
        ...(payload.projectOwner || []),
      ],
      projectId: result._id,
      type: CONVERSATION_TYPE.FINANCE_GROUP,
    },
  ];

  // console.log('convversatain data', conversationData);

  // create conversation-------------
  await Conversation.insertMany(conversationData);

  const receivers = [
    ...(payload.projectManager || []),
    ...(payload.financeManager || []),
    ...(payload.officeManager || []),
    ...(payload.projectOwner || []),
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

// const deleteProject = async (id: string) => {
//   const project = await Project.findById(id);
//   if (!project) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
//   }
//   const result = await Project.findByIdAndDelete(id);

//   await Conversation.updateMany({ projectId: id }, { isDeleted: true });

//   // TOOD: need to delete corrospoding images and documents

//   await ProjectImage.deleteMany({ projectId: id });
//   await ProjectDocument.deleteMany({ projectId: id });
//   await Material.deleteMany({ project: id });

//   return result;
// };

const deleteProject = async (id: string) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  // Fetch all related entities
  const [projectImages, projectDocuments, materials] = await Promise.all([
    ProjectImage.find({ projectId: id }),
    ProjectDocument.find({ projectId: id }),
    Material.find({ project: id }),
  ]);

  // Extract all S3 keys
  const imageKeys = projectImages.map((img) => extractS3Key(img.image_url));
  const documentKeys = projectDocuments.map((doc) =>
    extractS3Key(doc.document_url),
  );
  const materialKeys = materials
    .filter((mat) => mat.image)
    .map((mat) => extractS3Key(mat.image!));

  const allKeys = [...imageKeys, ...documentKeys, ...materialKeys];

  // Batch delete files from S3
  await deleteFilesFromS3(allKeys);

  // Soft delete conversations
  await Conversation.updateMany({ projectId: id }, { isDeleted: true });

  // Delete related DB records
  await Promise.all([
    ProjectImage.deleteMany({ projectId: id }),
    ProjectDocument.deleteMany({ projectId: id }),
    Material.deleteMany({ project: id }),
  ]);

  // Delete the project itself
  const result = await Project.findByIdAndDelete(id);

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

  const project = await Project.findOne({ _id: id });
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

  if (payload.projectImage) {
    if (project.projectImage) {
      const oldFileName = project.projectImage.split('cloudfront.net/')[1];
      console.log('oldfile name', oldFileName);
      await deleteFileFromS3(oldFileName);
    }
  }

  if (
    (payload.projectManager && payload.projectManager.length > 0) ||
    (payload.projectOwner && payload.projectOwner.length > 0)
  ) {
    let participants: any = [];
    if (payload.projectManager && payload.projectOwner) {
      participants = [...payload.projectManager, ...payload.projectOwner];
    } else if (payload.projectManager) {
      participants = [...payload.projectManager, ...project.projectOwner];
    } else if (payload.projectOwner) {
      participants = [...payload.projectOwner, ...project.projectManager];
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
      participants = [...payload.financeManager, ...project.projectOwner];
    } else if (payload.projectOwner) {
      participants = [...payload.projectOwner, ...project.financeManager];
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
      participants = [...payload.officeManager, ...project.projectOwner];
    } else if (payload.projectOwner) {
      participants = [...payload.projectOwner, ...project.officeManager];
    }
    await Conversation.findOneAndUpdate(
      { projectId: result._id, type: CONVERSATION_TYPE.OFFICE_MANAGER_GROUP },
      { participants: participants },
    );
  }

  const newManagers = payload?.projectManager?.filter(
    (manager) => !project.projectManager.includes(manager),
  );
  const newFinances = payload?.financeManager?.filter(
    (manager) => !project.financeManager.includes(manager),
  );
  const newOfficeManagers = payload?.officeManager?.filter(
    (manager) => !project.officeManager.includes(manager),
  );
  const newOwner = payload?.projectOwner?.filter(
    (manager) => !project.projectOwner.includes(manager),
  );
  // console.log(newManagers, newFinances, newOfficeManagers, newOwner);
  const receivers = [
    ...(newManagers || []),
    ...(newFinances || []),
    ...(newOfficeManagers || []),
    ...(newOwner || []),
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
  const io = getIO();

  receivers.forEach((receiver, index) => {
    io.to(receiver.toString()).emit('notification', notificationCounts[index]);
  });
  return result;
};

const getSmartSheet = async (projectId: string) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const result = await getSpecificSheet(project.smartSheetId);
  console.log(result);
  if (result.success == false) {
    return {};
  }
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
