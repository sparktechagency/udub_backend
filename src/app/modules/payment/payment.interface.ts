import { Types } from 'mongoose';

export interface IPayment {
  createdBy: Types.ObjectId;
  project: Types.ObjectId;
  paymentMilestoneName: string;
  amount: number;
  projectOwner: Types.ObjectId[];
  status: string;
}
