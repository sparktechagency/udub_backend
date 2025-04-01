import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import PaymentService from './payment.service';

const addPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.addPayment(req.user.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment added successfully',
    data: result,
  });
});

// update material
const updatePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.updatePayment(
    req.user,
    req.params.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment updated successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await PaymentService.getProjectPayments(
    req.params.id,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments retrieved successfully',
    data: result,
  });
});
const getSinglePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.getSinglePayment(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment retrieved successfully',
    data: result,
  });
});

const PaymentController = {
  addPayment,
  updatePayment,
  getAllPayments,
  getSinglePayment,
};
export default PaymentController;
