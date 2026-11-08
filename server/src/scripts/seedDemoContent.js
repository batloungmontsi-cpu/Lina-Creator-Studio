import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import Content from '../models/Content.js';
import Comment from '../models/Comment.js';
import { demoComments, demoStories } from './demoStories.js';

try {
  await connectDatabase();
  const existingFeatured = await Content.exists({ featured: true });
  let created = 0;

  for (const [index, story] of demoStories.entries()) {
    const result = await Content.updateOne(
      { title: story.title },
      { $setOnInsert: { ...story, featured: index === 0 && !existingFeatured } },
      { upsert: true, runValidators: true },
    );
    created += result.upsertedCount;
  }

  const storiesByTitle = new Map(
    (await Content.find({ title: { $in: demoStories.map(({ title }) => title) } }, { _id: 1, title: 1 }).lean())
      .map(({ _id, title }) => [title, _id]),
  );
  let commentsCreated = 0;
  for (const sample of demoComments) {
    const contentId = storiesByTitle.get(sample.storyTitle);
    if (!contentId) throw new Error(`Seed story not found for sample comment: ${sample.storyTitle}`);

    const result = await Comment.updateOne(
      { content: contentId, displayName: sample.displayName, text: sample.text },
      {
        $setOnInsert: {
          content: contentId,
          displayName: sample.displayName,
          text: sample.text,
          status: sample.status,
        },
      },
      { upsert: true, runValidators: true },
    );
    commentsCreated += result.upsertedCount;
  }

  console.log(`Demo seeding complete: ${created} stories and ${commentsCreated} comments added; existing samples were preserved.`);
} catch (error) {
  console.error('Could not seed demo content:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
