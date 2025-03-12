import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IProject_image } from "./project_image.interface";
import project_imageModel from "./project_image.model";

const updateUserProfile = async (id: string, payload: Partial<IProject_image>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await project_imageModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await project_imageModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const Project_imageServices = { updateUserProfile };
export default Project_imageServices;