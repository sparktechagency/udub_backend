import { model, Schema } from 'mongoose';
import { IPayment } from './material.interface';

const PaymentSchema = new Schema<IPayment>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    projectOwner: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    amount: { type: Number },
    status: { type: String },
  },
  { timestamps: true },
);

export const Material = model<IPayment>('Payment', PaymentSchema);
