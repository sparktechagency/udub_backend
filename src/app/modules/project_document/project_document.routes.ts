import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import project_documentValidations from './project_document.validation';
import { uploadFile } from '../../helper/fileUploader';
import ProjectDocumentController from './project_document.controller';

const router = express.Router();

router.patch(
  '/upload-project-documents',
  auth(USER_ROLE.user),
  uploadFile(),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(project_documentValidations.updateProject_documentData),
  ProjectDocumentController.uploadImagesForProject,
);

export const projectDocumentRoutes = router;
