/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { ProjectDocument } from './project_document.model';
import { IProjectDocument } from './project_document.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';
import { deleteFileFromS3 } from '../../helper/deleteFileFromS3';
import { getCloudFrontUrl } from '../../helper/getCloudfontUrl';

const uploadDocumentsForProject = async (
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

  // const documentData = payload.documentData;

  // if (!documentData || documentData.length !== payload.images.length) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Each docuemnt must have a corresponding title, description, and projectId',
  //   );
  // }

  const documentsData = payload.map((document: any) => ({
    addedBy: userId,
    projectId: projectId,
    title: document?.title,
    description: document?.description,
    document_url: getCloudFrontUrl(document?.document_url),
  }));

  const result = await ProjectDocument.insertMany(documentsData);

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

const updateDocument = async (
  updateBy: string,
  id: string,
  payload: Partial<IProjectDocument>,
) => {
  if (payload.document_url) {
    payload.document_url = getCloudFrontUrl(payload.document_url as string);
  }
  const document = await ProjectDocument.findOne({ _id: id });
  if (!document) {
    throw new AppError(httpStatus.NOT_FOUND, 'Document not found');
  }
  const result = await ProjectDocument.findByIdAndUpdate(
    id,
    { ...payload, addedBy: updateBy },
    {
      new: true,
      runValidators: true,
    },
  );
  // TOOD: need to be change in store image another way
  if (payload.document_url) {
    if (payload.document_url) {
      const oldFileName = document.document_url.split('cloudfront.net/')[1];
      console.log('oldfile name', oldFileName);
      await deleteFileFromS3(oldFileName);
    }
  }
  return result;
};

const getProjectDocuments = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const documentQuery = new QueryBuilder(
    ProjectDocument.find({ projectId: id }),
    query,
  )
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();
  const meta = await documentQuery.countTotal();
  const result = await documentQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const getSingleDocument = async (id: string) => {
  const result = await ProjectDocument.findById(id);
  return result;
};

const deleteDocument = async (id: string) => {
  const result = await ProjectDocument.findByIdAndDelete(id);
  if (result?.document_url) {
    await deleteFileFromS3(result.document_url.split('cloudfront.net/')[1]);
  }
  return result;
};

const ProjectDocumentService = {
  uploadDocumentsForProject,
  updateDocument,
  getProjectDocuments,
  getSingleDocument,
  deleteDocument,
};
export default ProjectDocumentService;
