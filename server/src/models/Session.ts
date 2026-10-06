import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  visitorId: string;
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date;
  entryPage: string;
  exitPage: string;
  pageViews: number;
  duration: number;
  deviceType: string;
  browser: string;
  operatingSystem: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  isActive: boolean;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    visitorId: { type: String, required: true, index: true },
    startedAt: { type: Date, default: Date.now, index: true },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    endedAt: { type: Date },
    entryPage: { type: String, default: '/' },
    exitPage: { type: String, default: '/' },
    pageViews: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    deviceType: { type: String, default: 'desktop' },
    browser: { type: String, default: 'Unknown' },
    operatingSystem: { type: String, default: 'Unknown' },
    referrer: { type: String, default: 'direct' },
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: false }
);

SessionSchema.index({ lastActivityAt: 1, isActive: 1 });
SessionSchema.index({ startedAt: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
