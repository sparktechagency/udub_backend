import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { Material } from './payment.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import { IPayment } from './payment.interface';

const addPayment = async (userId: string, payload: IPayment) => {
  const project = await Project.findOne({ _id: payload.project });
  if (!project) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }
  if (project.financeManager.toString() != userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not asssigned this project , so you can't able to add a material",
    );
  }

  const result = await Material.create({
    ...payload,
    project: payload.project,
    createdBy: userId,
    projectOwner: project.projectOwnerEmail,
  });
  return result;
};

const updatePayment = async (
  userData: JwtPayload,
  id: string,
  payload: IPayment,
) => {
  const payment = await Material.findById(id);
  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Project not found');
  }

  if (userData.role == USER_ROLE.user) {
    if (payment.projectOwner != userData.id) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'This is not your project payment',
      );
    }
  }
  const result = await Material.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const PaymentService = { addPayment, updatePayment };
export default PaymentService;
