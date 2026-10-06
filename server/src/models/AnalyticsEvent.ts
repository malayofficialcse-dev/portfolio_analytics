import mongoose, { Document, Schema } from 'mongoose';

export interface IAnalyticsEvent extends Document {
  visitorId: string;
  sessionId: string;
  eventType: string;
  page: string;
  target: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    eventType: { type: String, required: true, index: true },
    page: { type: String, default: '' },
    target: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

AnalyticsEventSchema.index({ timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
