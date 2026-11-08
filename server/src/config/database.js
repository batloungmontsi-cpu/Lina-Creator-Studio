import mongoose from 'mongoose';

function resolveUri() {
  const { MONGODB_URI, DB_USER, DB_PASSWORD } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Add your Atlas connection string to server/.env.');
  }

  if (!DB_USER || DB_PASSWORD === undefined) {
    return MONGODB_URI;
  }

  const credentials = `${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}`;
  return MONGODB_URI.replace(/^(mongodb(?:\+srv)?:\/\/)([^@/]*@)?/, `$1${credentials}@`);
}

export async function connectDatabase() {
  const uri = resolveUri();

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log('MongoDB connected.');
}