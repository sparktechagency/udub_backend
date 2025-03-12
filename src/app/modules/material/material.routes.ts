import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';

import { uploadFile } from '../../helper/fileUploader';
import MaterialValidations from './material.validation';
import MaterialController from './material.controller';

const router = express.Router();

router.post(
  '/add-material',
  auth(USER_ROLE.manager, USER_ROLE.officeManager, USER_ROLE.superAdmin),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(MaterialValidations.materialValidationSchema),
  MaterialController.addMaterial,
);
router.patch(
  '/update-material/:id',
  auth(
    USER_ROLE.manager,
    USER_ROLE.officeManager,
    USER_ROLE.superAdmin,
    USER_ROLE.user,
  ),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(MaterialValidations.updateMaterialValidationSchema),
  MaterialController.updateMaterial,
);

export const materialRoutes = router;
