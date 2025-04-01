import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { Payment } from './payment.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import { IPayment } from './payment.interface';
import QueryBuilder from '../../builder/QueryBuilder';
import sendNotification from '../../helper/sendNotification';
import { ENUM_NOTIFICATION_TYPE } from '../../utilities/enum';
import Notification from '../notification/notification.model';

const addPayment = async (userId: string, payload: IPayment) => {
  const project = await Project.findOne({ _id: payload.project }).select(
    'name projectOwner _id financeManager',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (project.financeManager.toString() != userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not asssigned this project , so you can't able to add a material",
    );
  }

  const result = await Payment.create({
    ...payload,
    createdBy: userId,
    projectOwner: project.projectOwner,
  });
  const notifcationDataForUser = {
    title: `Payment info added`,
    message: `Payment info  added for project : ${project.name}`,
    receiver: project.projectOwner.toString(),
    type: ENUM_NOTIFICATION_TYPE.PAYMENT,
    redirectId: result._id.toString(),
  };
  sendNotification(notifcationDataForUser);
  return result;
};

const updatePayment = async (
  userData: JwtPayload,
  id: string,
  payload: IPayment,
) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'payment not found');
  }
  const project = await Project.findById(payment.project).select(
    'projectOwner financeManager',
  );
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Prject not found');
  }
  if (userData.role == USER_ROLE.user) {
    if (payment.projectOwner != userData.id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This is not your project payment',
      );
    }
  }
  const result = await Payment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  // for send notification ============
  if (
    userData.role == USER_ROLE.financeManager ||
    userData.role == USER_ROLE.superAdmin
  ) {
    const notifcationDataForUser = {
      title: `Payment updated`,
      message: `Payment updated for project : ${project.name}`,
      receiver: project.projectOwner.toString(),
      type: ENUM_NOTIFICATION_TYPE.PAYMENT,
      redirectId: payment._id.toString(),
    };
    sendNotification(notifcationDataForUser);
  } else {
    const receivers = [
      project.projectManager.toString(),
      project.officeManager.toString(),
      USER_ROLE.superAdmin,
    ];
    const notificationData = receivers.map((receiver) => ({
      title: `Payment updated`,
      message: `Payment updated by project owner for project : ${project.name}`,
      receiver: receiver.toString(),
      type: ENUM_NOTIFICATION_TYPE.PAYMENT,
      redirectId: payment._id.toString(),
    }));
    await Notification.create(notificationData);
    notificationData.forEach((data) => {
      sendNotification(data);
    });
  }

  return result;
};

const getProjectPayments = async (
  id: string,
  query: Record<string, unknown>,
) => {
  const resultQuery = new QueryBuilder(Payment.find({ project: id }), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await resultQuery.countTotal();
  const result = await resultQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const getSinglePayment = async (id: string) => {
  const result = await Payment.findById(id);
  return result;
};

const PaymentService = {
  addPayment,
  updatePayment,
  getProjectPayments,
  getSinglePayment,
};
export default PaymentService;
