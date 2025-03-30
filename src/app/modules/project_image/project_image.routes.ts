import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
// import { uploadFile } from '../../helper/fileUploader';
import ProjectImageValidations from './project_image.validation';
import Project_imageController from './project_image.controller';

const router = express.Router();

router.post(
  '/upload-project-image/:projectId',
  auth(USER_ROLE.manager, USER_ROLE.officeManager, USER_ROLE.superAdmin),
  // uploadFile(),
  // (req, res, next) => {
  //   if (req.body.data) {
  //     req.body = JSON.parse(req.body.data);
  //   }
  //   next();
  // },
  validateRequest(ProjectImageValidations.projectImageValidationSchema),
  Project_imageController.uploadImagesForProject,
);
router.patch(
  '/update-project-image/:id',
  auth(USER_ROLE.manager, USER_ROLE.officeManager, USER_ROLE.superAdmin),
  // uploadFile(),
  // (req, res, next) => {
  //   if (req.body.data) {
  //     req.body = JSON.parse(req.body.data);
  //   }
  //   next();
  // },
  Project_imageController.updateImage,
);

router.get(
  '/get-project-images/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.manager,
    USER_ROLE.officeManager,
    USER_ROLE.financeManager,
    USER_ROLE.user,
  ),
  Project_imageController.getProjectImages,
);
router.get(
  '/get-single-image/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.manager,
    USER_ROLE.officeManager,
    USER_ROLE.financeManager,
    USER_ROLE.user,
  ),
  Project_imageController.getSingleImage,
);

export const project_imageRoutes = router;
