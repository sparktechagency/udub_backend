import { model, Schema } from 'mongoose';
import { IProjectDocument } from './project_document.interface';

const ProjectDocumentSchema = new Schema<IProjectDocument>(
  {
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: false },
    description: { type: String, required: false },
    document_url: { type: String, required: true },
  },
  { timestamps: true },
);

export const ProjectDocument = model<IProjectDocument>(
  'ProjectDocument',
  ProjectDocumentSchema,
);
