import validateRequest from '../../middlewares/validateRequest';
import userControllers from './user.controller';
import { NextFunction, Request, Response, Router } from 'express';
import userValidations from './user.validation';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import { uploadFile } from '../../helper/fileUploader';

const router = Router();

router.post(
  '/register-user',
  auth(USER_ROLE.superAdmin),
  validateRequest(userValidations.userValidationSchema),
  userControllers.registerUser,
);
router.patch(
  '/update-profile',
  auth(
    USER_ROLE.user,
    USER_ROLE.manager,
    USER_ROLE.financeManager,
    USER_ROLE.officeManager,
    USER_ROLE.superAdmin,
  ),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(userValidations.userUpdateValidationSchema),
  userControllers.updateUserProfile,
);

router.get(
  '/get-my-profile',
  auth(
    USER_ROLE.user,
    USER_ROLE.manager,
    USER_ROLE.financeManager,
    USER_ROLE.officeManager,
    USER_ROLE.superAdmin,
  ),
  userControllers.getMyProfile,
);

router.patch(
  '/delete-my-account',
  auth(USER_ROLE.user),
  validateRequest(userValidations.deleteUserAccountValidationSchema),
  userControllers.deleteUserAccount,
);

router.delete(
  '/delete-account/:id',
  auth(USER_ROLE.superAdmin),
  validateRequest(userValidations.deleteUserAccountValidationSchema),
  userControllers.deleteUserAccount,
);

router.get(
  '/get-all-user',
  auth(USER_ROLE.superAdmin),
  userControllers.getAllUser,
);

export const userRoutes = router;
