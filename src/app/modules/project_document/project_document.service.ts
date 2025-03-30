/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { ProjectDocument } from './project_document.model';
import { IProjectDocument } from './project_document.interface';
import unlinkFile from '../../helper/unLinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';

const uploadDocumentsForProject = async (userId: string, payload: any) => {
  const project = await Project.findOne({ _id: payload.projectId }).select(
    'projectOwner name',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  const documentData = payload.documentData;

  if (!documentData || documentData.length !== payload.images.length) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Each docuemnt must have a corresponding title, description, and projectId',
    );
  }

  const documentsData = payload.images.map((image: string, index: number) => ({
    addedBy: userId,
    projectId: documentData[index].projectId,
    title: documentData[index].title || '',
    description: documentData[index].description || '',
    image_url: image,
  }));

  const notifcationDataForUser = {
    title: `Document added`,
    message: `Document added for project : ${project.name}`,
    receiver: project.projectOwner.toString(),
  };
  sendNotification(notifcationDataForUser);

  const result = await ProjectDocument.insertMany(documentsData);
  return result;
};

const updateDocument = async (
  updateBy: string,
  id: string,
  payload: Partial<IProjectDocument>,
) => {
  const document = await ProjectDocument.findOne({ _id: id });
  if (!document) {
    throw new AppError(httpStatus.NOT_FOUND, 'Document not found');
  }
  const result = await ProjectDocument.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  // TOOD: need to be change in store image another way
  if (payload.document_url) {
    unlinkFile(document.document_url);
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

const ProjectDocumentService = {
  uploadDocumentsForProject,
  updateDocument,
  getProjectDocuments,
  getSingleDocument,
};
export default ProjectDocumentService;
