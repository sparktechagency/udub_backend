import { Schema, model } from 'mongoose';
import { IPodcast } from './podcast.interface';

const PodcastSchema = new Schema<IPodcast>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    coverImage: { type: String, required: true },
    video_url: { type: String, required: true },
    audio_url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

PodcastSchema.index({ location: '2dsphere' });

const Podcast = model<IPodcast>('Podcast', PodcastSchema);
export default Podcast;
