import { model, Schema } from 'mongoose';
import { IProject_image } from './project_image.interface';
//
const ProjectImageSchema = new Schema<IProject_image>(
  {
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    image_url: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProjectImage = model<IProject_image>(
  'ProjectImage',
  ProjectImageSchema,
);
