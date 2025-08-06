import { Types } from 'mongoose';

export interface IMaterial {
  createdBy: Types.ObjectId;
  project: Types.ObjectId;
  title: string;
  manufacturer: string;
  model: string;
  image: string;
  projectOwner: Types.ObjectId[];
  notes: string;
}
