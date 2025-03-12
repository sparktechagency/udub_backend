import { z } from 'zod';

export const materialValidationSchema = z.object({
  createdBy: z.string().nonempty('CreatedBy is required'),
  project: z.string().nonempty('Project is required'),
  title: z.string().nonempty('Title is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  image: z.string().optional(),
});
const updateMaterialValidationSchema = z.object({
  title: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  image: z.string().optional(),
});

const MaterialValidations = {
  materialValidationSchema,
  updateMaterialValidationSchema,
};
export default MaterialValidations;
