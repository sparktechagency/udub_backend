import { model, Schema } from 'mongoose';
import { IMaterial } from './material.interface';

const MaterialSchema = new Schema<IMaterial>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    manufacturer: { type: String, required: false },
    model: { type: String, required: false },
  },
  { timestamps: true },
);

export const Material = model<IMaterial>('Material', MaterialSchema);
