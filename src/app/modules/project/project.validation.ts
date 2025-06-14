import { Types } from 'mongoose';
import { z } from 'zod';

const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    projectOwnerEmail: z.string().email('Invalid email format').optional(),
    address: z.string({ required_error: 'Address is required' }),
    startDate: z.preprocess(
      (arg) =>
        typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
      z.date({ required_error: 'Start date is required' }),
    ),
    projectManager: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => val.every((id) => Types.ObjectId.isValid(id)),
        'Invalid project manager ID(s)',
      )
      .optional(),
    officeManager: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => val.every((id) => Types.ObjectId.isValid(id)),
        'Invalid office manager ID(s)',
      )
      .optional(),
    financeManager: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => val.every((id) => Types.ObjectId.isValid(id)),
        'Invalid finance manager ID(s)',
      )
      .optional(),
    projectOwner: z
      .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => val.every((id) => Types.ObjectId.isValid(id)),
        'Invalid project owner ID(s)',
      )
      .optional(),
    projectImage: z.string().optional(),
  }),
});

const ProjectValidations = {
  createProjectValidationSchema,
};

export default ProjectValidations;
