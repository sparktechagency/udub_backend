import { Types } from 'mongoose';
import { z } from 'zod';

const createProjectValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    projectOwnerEmail: z.string().email('Invalid email format'),
    title: z.string().min(1, 'Title is required'),
    startDate: z.preprocess(
      (arg) =>
        typeof arg === 'string' || arg instanceof Date ? new Date(arg) : arg,
      z.date({ required_error: 'Start date is required' }),
    ),
    liveLink: z.string().url('Invalid URL').optional(),
    projectManager: z
      .instanceof(Types.ObjectId)
      .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => Types.ObjectId.isValid(val),
        'Invalid project manager ID',
      ),
    officeManager: z
      .instanceof(Types.ObjectId)
      .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => Types.ObjectId.isValid(val),
        'Invalid office manager ID',
      ),
    financeManager: z
      .instanceof(Types.ObjectId)
      .or(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId'))
      .refine(
        (val) => Types.ObjectId.isValid(val),
        'Invalid finance manager ID',
      ),
  }),
});

const ProjectValidations = {
  createProjectValidationSchema,
};

export default ProjectValidations;
