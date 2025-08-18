import { model, Schema } from 'mongoose';
import { IProject } from './project.interface';

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    // projectOwnerEmail: { type: String },
    address: { type: String, required: true },
    startDate: { type: Date, required: true },
    liveLink: { type: String, default: '' },
    liveLink2: { type: String, default: '' },
    projectManager: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
    },
    officeManager: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
    },
    financeManager: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
    },
    projectOwner: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      // required: true,
    },
    projectImage: { type: String, default: '' },
    smartSheetId: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    locationDropDownItems: {
      type: [String],
      required: true,
    },
    paymentInfoLink: {
      type: String,
      default: '',
    },
    smartsheetLink: {
      type: String,
      default: '',
    },
    recentlyCompletedLink: {
      type: String,
      default: '',
    },
    twoWeekLookAheadLink: {
      type: String,
      default: '',
    },
    twoMonthLookAheadLink: {
      type: String,
      default: '',
    },
    fullScheduleLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

export const Project = model<IProject>('Project', ProjectSchema);
