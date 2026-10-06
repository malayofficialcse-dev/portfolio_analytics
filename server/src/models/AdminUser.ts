import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdminUser extends Document {
  email: string;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  lastLogin?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

AdminUserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

AdminUserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
