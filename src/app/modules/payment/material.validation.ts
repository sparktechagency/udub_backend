import { z } from 'zod';

export const paymentValidationSchema = z.object({
  project: z.string().nonempty('Project is required'),
  amount: z.number({ required_error: 'Amount is required' }),
  paymentMilestoneName: z.string({
    required_error: 'Payment milestone name is required',
  }),
});
const updatePaymentValidationSchema = z.object({
  amount: z.number({ required_error: 'Amount is required' }),
  paymentMilestoneName: z.string({
    required_error: 'Payment milestone name is required',
  }),
  status: z.string().optional(),
});

const PaymentValidations = {
  paymentValidationSchema,
  updatePaymentValidationSchema,
};
export default PaymentValidations;
