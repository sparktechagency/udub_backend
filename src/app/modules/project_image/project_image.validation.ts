import { z } from 'zod';
import { Types } from 'mongoose';

const projectImageValidationSchema = z.object({
  body: z.object({
    addedBy: z
      .instanceof(Types.ObjectId)
      .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid user ID'),

    projectId: z
      .instanceof(Types.ObjectId)
      .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine((val) => Types.ObjectId.isValid(val), 'Invalid project ID'),

    title: z.string().optional(),
    description: z.string().optional(),
  }),
});

const ProjectImageValidations = {
  projectImageValidationSchema,
};

export default ProjectImageValidations;
