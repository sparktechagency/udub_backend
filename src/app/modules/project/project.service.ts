import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IProject } from "./project.interface";
import projectModel from "./project.model";

const updateUserProfile = async (id: string, payload: Partial<IProject>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await projectModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await projectModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const ProjectServices = { updateUserProfile };
export default ProjectServices;