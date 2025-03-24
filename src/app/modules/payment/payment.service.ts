import httpStatus from 'http-status';
import AppError from '../../error/appError';
import { Project } from '../project/project.model';
import { Payment } from './payment.model';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import { IPayment } from './payment.interface';
import QueryBuilder from '../../builder/QueryBuilder';

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

  const result = await Payment.create({
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
  const payment = await Payment.findById(id);
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
  const result = await Payment.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
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
