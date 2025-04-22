import { model, Schema } from 'mongoose';
import { IMaterial } from './material.interface';

const MaterialSchema = new Schema<IMaterial>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    projectOwner: {
      type: [Schema.Types.ObjectId],
      required: true,
      ref: 'User',
    },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    manufacturer: { type: String, required: false },
    model: { type: String, required: false },
    image: { type: String, required: false },
  },
  { timestamps: true },
);

export const Material = model<IMaterial>('Material', MaterialSchema);
