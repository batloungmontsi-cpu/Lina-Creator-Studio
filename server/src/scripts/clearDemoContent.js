import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Comment from '../models/Comment.js';
import Content from '../models/Content.js';
import Like from '../models/Like.js';
import { demoStories } from './demoStories.js';

try {
  await connectDatabase();
  const sampleStories = await Content.find(
    { title: { $in: demoStories.map(({ title }) => title) } },
    { _id: 1 },
  ).lean();
  const contentIds = sampleStories.map(({ _id }) => _id);

  if (contentIds.length === 0) {
    console.log('No Sample: stories found; nothing was removed.');
  } else {
    const [comments, likes] = await Promise.all([
      Comment.deleteMany({ content: { $in: contentIds } }),
      Like.deleteMany({ content: { $in: contentIds } }),
    ]);
    const stories = await Content.deleteMany({ _id: { $in: contentIds } });

    console.log(
      `Demo cleanup complete: ${stories.deletedCount} sample stories, ${comments.deletedCount} related comments, and ${likes.deletedCount} related likes removed.`,
    );
  }
} catch (error) {
  console.error('Could not clear demo content:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
