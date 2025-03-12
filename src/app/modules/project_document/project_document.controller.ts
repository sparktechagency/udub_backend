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
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Document uploaded successfully',
    data: result,
  });
});

const ProjectDocumentController = { uploadImagesForProject };
export default ProjectDocumentController;
