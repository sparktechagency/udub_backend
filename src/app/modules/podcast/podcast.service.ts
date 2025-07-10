import httpStatus from "http-status";
import AppError from "../../error/appError";
import { IPodcast } from "./podcast.interface";
import podcastModel from "./podcast.model";

const updateUserProfile = async (id: string, payload: Partial<IPodcast>) => {
    if (payload.email || payload.username) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot change the email or username");
    }
    const user = await podcastModel.findById(id);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "Profile not found");
    }
    return await podcastModel.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

const PodcastServices = { updateUserProfile };
export default PodcastServices;