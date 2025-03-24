/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { ProjectDocument } from './project_document.model';
import { IProjectDocument } from './project_document.interface';
import unlinkFile from '../../helper/unLinkFile';

const uploadDocumentsForProject = async (userId: string, payload: any) => {
  const project = await Project.exists({ _id: payload.projectId });
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

const getProjectDocuments = async (id: string) => {
  const result = await ProjectDocument.find({ projectId: id });
  return result;
};

const ProjectDocumentService = { uploadDocumentsForProject, updateDocument };
export default ProjectDocumentService;
