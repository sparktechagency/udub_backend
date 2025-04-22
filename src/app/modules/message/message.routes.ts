import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import MessageController from './message.controller';

const router = express.Router();

router.get(
  '/get-messages',
  auth(
    USER_ROLE.user,
    USER_ROLE.manager,
    USER_ROLE.superAdmin,
    USER_ROLE.financeManager,
    USER_ROLE.officeManager,
  ),
  MessageController.getMessages,
);

export const messageRoutes = router;
