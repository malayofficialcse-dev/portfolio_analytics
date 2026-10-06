import mongoose, { Document, Schema } from 'mongoose';

export interface IPageView extends Document {
  visitorId: string;
  sessionId: string;
  path: string;
  title: string;
  timestamp: Date;
  duration: number;
  referrer: string;
}

const PageViewSchema = new Schema<IPageView>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    title: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now, index: true },
    duration: { type: Number, default: 0 },
    referrer: { type: String, default: '' },
  },
  { timestamps: false }
);

PageViewSchema.index({ timestamp: 1, path: 1 });
PageViewSchema.index({ timestamp: -1 });

export const PageView = mongoose.model<IPageView>('PageView', PageViewSchema);
