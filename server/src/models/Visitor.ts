import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  visitorId: string;
  firstSeen: Date;
  lastSeen: Date;
  totalSessions: number;
  totalPageViews: number;
  country: string;
  region: string;
  city: string;
  deviceType: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  language: string;
  referrer: string;
  isReturning: boolean;
}

const VisitorSchema = new Schema<IVisitor>(
  {
    visitorId: { type: String, required: true, unique: true, index: true },
    firstSeen: { type: Date, default: Date.now, index: true },
    lastSeen: { type: Date, default: Date.now, index: true },
    totalSessions: { type: Number, default: 1 },
    totalPageViews: { type: Number, default: 0 },
    country: { type: String, default: 'Unknown' },
    region: { type: String, default: '' },
    city: { type: String, default: '' },
    deviceType: { type: String, default: 'desktop' },
    browser: { type: String, default: 'Unknown' },
    browserVersion: { type: String, default: '' },
    operatingSystem: { type: String, default: 'Unknown' },
    language: { type: String, default: '' },
    referrer: { type: String, default: 'direct' },
    isReturning: { type: Boolean, default: false },
  },
  { timestamps: false }
);

export const Visitor = mongoose.model<IVisitor>('Visitor', VisitorSchema);
