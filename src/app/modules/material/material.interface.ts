import { Types } from 'mongoose';

export interface IMaterial {
  project: Types.ObjectId;
  title: string;
  manufacturer: string;
  model: string;
}
