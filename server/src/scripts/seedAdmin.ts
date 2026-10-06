import 'dotenv/config';
import dns from 'dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { console.error('MONGODB_URI not set'); process.exit(1); }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const email = process.env.ADMIN_EMAIL || 'malay.official.cse@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const username = process.env.ADMIN_USERNAME || 'malay';

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({ email, username, passwordHash, role: 'admin' });
  console.log(`Admin created: ${email}`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => { console.error(err); process.exit(1); });
