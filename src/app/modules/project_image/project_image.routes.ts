import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { uploadFile } from '../../helper/fileUploader';
import ProjectImageValidations from './project_image.validation';
import Project_imageController from './project_image.controller';

const router = express.Router();

router.patch(
  '/upload-project-image',
  auth(USER_ROLE.user),
  uploadFile(),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ProjectImageValidations.projectImageValidationSchema),
  Project_imageController.uploadImagesForProject,
);

export const project_imageRoutes = router;
