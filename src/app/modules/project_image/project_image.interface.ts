import { Types } from 'mongoose';

export interface IProject_image {
  addedBy: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  description: string;
  image_url: string;
}
