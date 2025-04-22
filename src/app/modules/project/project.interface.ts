import { Types } from 'mongoose';

export interface IProject {
  name: string;
  projectOwnerEmail?: string;
  title: string;
  startDate: Date;
  liveLink: string;
  projectOwner: [Types.ObjectId];
  projectManager: [Types.ObjectId];
  officeManager: [Types.ObjectId];
  financeManager: [Types.ObjectId];
  projectImage: string;
  smartSheetId: string;
}
