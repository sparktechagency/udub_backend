import { z } from "zod";

export const updateProject_imageData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const Project_imageValidations = { updateProject_imageData };
export default Project_imageValidations;