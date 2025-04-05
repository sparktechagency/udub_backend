import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import MaterialValidations from './material.validation';
import MaterialController from './material.controller';

const router = express.Router();

// material routes
router.post(
  '/add-material',
  auth(USER_ROLE.manager, USER_ROLE.officeManager, USER_ROLE.superAdmin),
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

  validateRequest(MaterialValidations.updateMaterialValidationSchema),
  MaterialController.updateMaterial,
);

router.get(
  '/get-project-materials/:id',
  auth(
    USER_ROLE.manager,
    USER_ROLE.superAdmin,
    USER_ROLE.officeManager,
    USER_ROLE.user,
  ),
  MaterialController.getAllMatetial,
);
router.get(
  '/get-single-material/:id',
  auth(
    USER_ROLE.manager,
    USER_ROLE.superAdmin,
    USER_ROLE.officeManager,
    USER_ROLE.user,
  ),
  MaterialController.getSingleMaterial,
);

export const materialRoutes = router;
