import { model, Schema } from 'mongoose';
import { IProject } from './project.interface';

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    projectOwnerEmail: { type: String },
    title: { type: String, required: true },
    startDate: { type: Date, required: true },
    liveLink: { type: String, required: false },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    officeManager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    financeManager: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectImage: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Project = model<IProject>('Project', ProjectSchema);
