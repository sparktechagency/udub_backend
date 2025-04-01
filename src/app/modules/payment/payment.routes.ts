import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';

import { uploadFile } from '../../helper/fileUploader';
import PaymentValidations from './payment.validation';
import PaymentController from './payment.controller';

const router = express.Router();

router.post(
  '/add-payment',
  auth(USER_ROLE.superAdmin, USER_ROLE.financeManager),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(PaymentValidations.paymentValidationSchema),
  PaymentController.addPayment,
);
router.patch(
  '/update-payment/:id',
  auth(USER_ROLE.financeManager, USER_ROLE.user),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(PaymentValidations.updatePaymentValidationSchema),
  PaymentController.updatePayment,
);

router.get(
  '/get-project-payments/:id',
  auth(
    USER_ROLE.manager,
    USER_ROLE.superAdmin,
    USER_ROLE.officeManager,
    USER_ROLE.user,
    USER_ROLE.financeManager,
  ),
  PaymentController.getAllPayments,
);
router.get(
  '/get-single-payment/:id',
  auth(
    USER_ROLE.manager,
    USER_ROLE.superAdmin,
    USER_ROLE.officeManager,
    USER_ROLE.user,
    USER_ROLE.financeManager,
  ),
  PaymentController.getSinglePayment,
);
export const paymentRoutes = router;
