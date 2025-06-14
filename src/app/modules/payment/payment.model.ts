import { model, Schema } from 'mongoose';
import { IPayment } from './payment.interface';

const PaymentSchema = new Schema<IPayment>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    projectOwner: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: 'User',
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number },
    status: { type: String },
    paymentMilestoneName: { type: String, required: true },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>('Payment', PaymentSchema);
