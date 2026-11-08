import mongoose from 'mongoose';
import { Router } from 'express';
import Comment from '../models/Comment.js';
import Content from '../models/Content.js';
import Viewer from '../models/Viewer.js';
import { requireAuth } from '../middleware/auth.js';
import { publishDueContent } from '../utils/contentPublishing.js';

const router = Router();

router.post('/', async (request, response) => {
  await publishDueContent();
  const { contentId, displayName, text, viewerId } = request.body;
  if (!mongoose.isObjectIdOrHexString(contentId)) return response.status(400).json({ message: 'A valid content ID is required.' });
  if (typeof displayName !== 'string' || !displayName.trim() || displayName.trim().length > 50) {
    return response.status(400).json({ message: 'Display name is required and must be 50 characters or fewer.' });
  }
  if (typeof text !== 'string' || text.trim().length < 3 || text.trim().length > 1000) {
    return response.status(400).json({ message: 'Comment must contain 3 to 1000 characters.' });
  }
  if (viewerId !== undefined && (typeof viewerId !== 'string' || !viewerId.trim() || viewerId.length > 100)) {
    return response.status(400).json({ message: 'Viewer ID is invalid.' });
  }

  const published = await Content.exists({ _id: contentId, status: 'Published' });
  if (!published) return response.status(404).json({ message: 'Published content was not found.' });

  let viewer;
  if (viewerId) {
    viewer = await Viewer.findOneAndUpdate(
      { viewerId: viewerId.trim() },
      { $set: { displayName: displayName.trim() } },
      { new: true, upsert: true, runValidators: true },
    );
  }
  const comment = await Comment.create({
    content: contentId,
    viewer: viewer?._id,
    displayName: displayName.trim(),
    text: text.trim(),
  });
  return response.status(201).json({ message: 'Comment submitted for creator approval.', comment });
});

router.get('/dashboard', requireAuth, async (request, response) => {
  const comments = await Comment.find().populate('content', 'title').sort({ createdAt: -1 }).lean();
  return response.json({ comments });
});

router.get('/:contentId', async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.contentId)) return response.status(400).json({ message: 'Content ID is invalid.' });
  await publishDueContent();
  const comments = await Comment.find({
    content: request.params.contentId,
    status: 'Approved',
  }).sort({ createdAt: -1 }).lean();
  return response.json({ comments });
});

router.patch('/:id/moderation', requireAuth, async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) return response.status(400).json({ message: 'Comment ID is invalid.' });
  const { status } = request.body;
  if (!['Approved', 'Hidden'].includes(status)) {
    return response.status(400).json({ message: 'Comment status must be Approved or Hidden.' });
  }
  const comment = await Comment.findByIdAndUpdate(request.params.id, { status }, { new: true, runValidators: true });
  if (!comment) return response.status(404).json({ message: 'Comment was not found.' });
  return response.json({ comment });
});

router.delete('/:id', requireAuth, async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) return response.status(400).json({ message: 'Comment ID is invalid.' });
  const comment = await Comment.findByIdAndDelete(request.params.id);
  if (!comment) return response.status(404).json({ message: 'Comment was not found.' });
  return response.status(204).end();
});

export default router;
