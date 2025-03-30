import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import ProjectDocumentService from './project_document.service';

const uploadImagesForProject = catchAsync(async (req, res) => {
  const { files } = req;
  if (files && typeof files === 'object' && 'documents' in files) {
    req.body.images = files['documents'].map((file) => file.path);
  }
  const result = await ProjectDocumentService.uploadDocumentsForProject(
    req.user.id,
    req.params.projectId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document uploaded successfully',
    data: result,
  });
});

const updateDocument = catchAsync(async (req, res) => {
  // const { files } = req;
  // if (files && typeof files === 'object' && 'document' in files) {
  //   req.body.document_url = files['document'][0].path;
  // }
  const result = await ProjectDocumentService.updateDocument(
    req.user.id,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document updated successfully',
    data: result,
  });
});

const getProjectDocuments = catchAsync(async (req, res) => {
  const result = await ProjectDocumentService.getProjectDocuments(
    req.params.id,
    req.query,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Documents retrieved successfully',
    data: result,
  });
});
const getSingleDocument = catchAsync(async (req, res) => {
  const result = await ProjectDocumentService.getSingleDocument(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document retrieved successfully',
    data: result,
  });
});

const ProjectDocumentController = {
  uploadImagesForProject,
  updateDocument,
  getProjectDocuments,
  getSingleDocument,
};
export default ProjectDocumentController;
