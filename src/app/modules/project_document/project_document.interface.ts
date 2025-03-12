import { Types } from 'mongoose';

export interface IProjectDocument {
  addedBy: Types.ObjectId;
  projectId: Types.ObjectId;
  title: string;
  description: string;
  document_url: string;
}
