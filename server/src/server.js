import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { publishDueContent } from './utils/contentPublishing.js';

const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to a random secret of at least 32 characters.');
}

try {
  await connectDatabase();
  await publishDueContent();
  const publicationTimer = setInterval(() => {
    publishDueContent().catch((error) => console.error('Failed to publish scheduled content:', error));
  }, 30_000);
  publicationTimer.unref();
  app.listen(port, () => {
    console.log(`Creator API listening on port ${port}`);
  });
} catch (error) {
  console.error('Failed to start the Creator API:', error.message);
  process.exitCode = 1;
}
