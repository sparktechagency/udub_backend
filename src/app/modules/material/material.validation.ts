import { z } from 'zod';

export const materialValidationSchema = z.object({
  body: z.object({
    project: z.string().nonempty('Project is required'),
    title: z.string().optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    image: z.string().optional(),
    notes: z.string().optional(),
  }),
});
const updateMaterialValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    image: z.string().optional(),
    notes: z.string().optional(),
  }),
});

const MaterialValidations = {
  materialValidationSchema,
  updateMaterialValidationSchema,
};
export default MaterialValidations;
