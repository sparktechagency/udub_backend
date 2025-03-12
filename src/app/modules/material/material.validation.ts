import { z } from "zod";

export const updateMaterialData = z.object({
    body: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
    }),
});

const MaterialValidations = { updateMaterialData };
export default MaterialValidations;