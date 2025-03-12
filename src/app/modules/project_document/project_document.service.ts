/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { ProjectDocument } from './project_document.model';

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

const ProjectDocumentService = { uploadDocumentsForProject };
export default ProjectDocumentService;
