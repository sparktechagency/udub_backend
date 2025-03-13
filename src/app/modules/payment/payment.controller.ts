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

const PaymentController = {
  addPayment,
  updatePayment,
};
export default PaymentController;
