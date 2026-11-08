import mongoose from 'mongoose';
import { Router } from 'express';
import Content from '../models/Content.js';
import Like from '../models/Like.js';
import Viewer from '../models/Viewer.js';
import { publishDueContent } from '../utils/contentPublishing.js';

const router = Router();

router.post('/', async (request, response) => {
  await publishDueContent();
  const { contentId, viewerId, displayName = 'Viewer' } = request.body;
  if (!mongoose.isObjectIdOrHexString(contentId)) return response.status(400).json({ message: 'A valid content ID is required.' });
  if (typeof viewerId !== 'string' || !viewerId.trim() || viewerId.length > 100) {
    return response.status(400).json({ message: 'A valid viewer ID is required to like content.' });
  }
  if (typeof displayName !== 'string' || displayName.trim().length > 50) {
    return response.status(400).json({ message: 'Display name must be 50 characters or fewer.' });
  }
  const published = await Content.exists({ _id: contentId, status: 'Published' });
  if (!published) return response.status(404).json({ message: 'Published content was not found.' });

  const viewer = await Viewer.findOneAndUpdate(
    { viewerId: viewerId.trim() },
    { $set: { displayName: displayName.trim() || 'Viewer' } },
    { new: true, upsert: true, runValidators: true },
  );
  await Like.updateOne({ content: contentId, viewer: viewer._id }, { $setOnInsert: { content: contentId, viewer: viewer._id } }, { upsert: true });
  const likes = await Like.countDocuments({ content: contentId });
  await Content.updateOne({ _id: contentId }, { $set: { likes } });
  return response.status(200).json({ liked: true, likes });
});

router.delete('/:contentId', async (request, response) => {
  const { contentId } = request.params;
  const { viewerId } = request.body;
  if (!mongoose.isObjectIdOrHexString(contentId)) return response.status(400).json({ message: 'Content ID is invalid.' });
  if (typeof viewerId !== 'string' || !viewerId.trim()) return response.status(400).json({ message: 'A valid viewer ID is required to remove a like.' });
  const viewer = await Viewer.findOne({ viewerId: viewerId.trim() });
  if (viewer) await Like.deleteOne({ content: contentId, viewer: viewer._id });
  const likes = await Like.countDocuments({ content: contentId });
  await Content.updateOne({ _id: contentId }, { $set: { likes } });
  return response.json({ liked: false, likes });
});

router.get('/:contentId', async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.contentId)) return response.status(400).json({ message: 'Content ID is invalid.' });
  await publishDueContent();
  const published = await Content.exists({ _id: request.params.contentId, status: 'Published' });
  if (!published) return response.status(404).json({ message: 'Published content was not found.' });
  const likes = await Like.countDocuments({ content: request.params.contentId });
  const viewerId = typeof request.query.viewerId === 'string' ? request.query.viewerId.trim() : '';
  const viewer = viewerId ? await Viewer.findOne({ viewerId }).select('_id') : null;
  const liked = viewer ? Boolean(await Like.exists({ content: request.params.contentId, viewer: viewer._id })) : false;
  return response.json({ likes, liked });
});

export default router;
