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
// get all project
router.get(
  '/get-all-project',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.financeManager,
    USER_ROLE.officeManager,
    USER_ROLE.user,
    USER_ROLE.manager,
  ),
  ProjectController.getAllProject,
);

router.get(
  '/get-single-project/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.financeManager,
    USER_ROLE.officeManager,
    USER_ROLE.user,
    USER_ROLE.manager,
  ),
  ProjectController.getSingleProject,
);

router.delete(
  '/delete-project/:id',
  auth(USER_ROLE.superAdmin),
  ProjectController.deleteProject,
);

router.patch(
  '/update-project/:id',
  auth(USER_ROLE.superAdmin),
  ProjectController.updateProject,
);

export const projectRoutes = router;
