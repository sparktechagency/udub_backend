import { z } from "zod";

export const updateProject_documentData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const Project_documentValidations = { updateProject_documentData };
export default Project_documentValidations;