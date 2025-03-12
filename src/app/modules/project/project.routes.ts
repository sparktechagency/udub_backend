import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';

import { uploadFile } from '../../helper/fileUploader';
import ProjectValidations from './project.validation';
import ProjectController from './project.controller';

const router = express.Router();

router.patch(
  '/create-project',
  auth(USER_ROLE.superAdmin),
  uploadFile(),
  (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ProjectValidations.createProjectValidationSchema),
  ProjectController.createProject,
);

export const projectRoutes = router;
