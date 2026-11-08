import mongoose from 'mongoose';
import { Router } from 'express';
import Content from '../models/Content.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import { requireAuth } from '../middleware/auth.js';
import { publishDueContent, publicationDateForUpdate, validatePublication } from '../utils/contentPublishing.js';

const router = Router();
const editableFields = [
  'title', 'description', 'category', 'type', 'status', 'thumbnailUrl',
  'mediaUrl', 'articleContent', 'duration', 'publicationDate',
  'featured',
];

function pickContentFields(body) {
  return Object.fromEntries(editableFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]]));
}

function isValidUrlOrEmpty(value) {
  if (value === undefined || value === '') return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateContentUrls(body) {
  return isValidUrlOrEmpty(body.thumbnailUrl) && isValidUrlOrEmpty(body.mediaUrl);
}

router.get('/', async (request, response) => {
  await publishDueContent();
  const { category, search, page = '1', limit = '12' } = request.query;
  const pageNumber = Number(page);
  const pageSize = Number(limit);
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(pageSize) || pageSize < 1 || pageSize > 50) {
    return response.status(400).json({ message: 'Page and limit must be valid positive integers; limit cannot exceed 50.' });
  }

  const query = { status: 'Published' };
  if (typeof category === 'string' && category.trim()) query.category = category.trim();
  if (typeof search === 'string' && search.trim()) query.$text = { $search: search.trim() };

  const [items, total] = await Promise.all([
    Content.find(query).sort({ publicationDate: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(),
    Content.countDocuments(query),
  ]);
  return response.json({ items, page: pageNumber, limit: pageSize, total });
});

router.get('/manage/all', requireAuth, async (request, response) => {
  await publishDueContent();
  const items = await Content.find().sort({ publicationDate: -1 }).lean();
  return response.json({ items });
});

router.get('/:id', async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) return response.status(400).json({ message: 'Content ID is invalid.' });
  await publishDueContent();
  const item = await Content.findOneAndUpdate(
    { _id: request.params.id, status: 'Published' },
    { $inc: { views: 1 } },
    { new: true },
  );
  if (!item) return response.status(404).json({ message: 'Published content was not found.' });
  return response.json({ item });
});

router.post('/', requireAuth, async (request, response) => {
  const fields = pickContentFields(request.body);
  if (!fields.title || !fields.description || !fields.category || !fields.type) {
    return response.status(400).json({ message: 'Title, description, category, and content type are required.' });
  }
  if (!validateContentUrls(fields)) return response.status(400).json({ message: 'Media and thumbnail URLs must be valid HTTP or HTTPS URLs.' });
  const publicationError = validatePublication(fields.status || 'Draft', fields.publicationDate, fields.status === 'Scheduled');
  if (publicationError) return response.status(400).json({ message: publicationError });

  const item = await Content.create(fields);
  if (item.featured) await Content.updateMany({ _id: { $ne: item._id }, featured: true }, { $set: { featured: false } });
  return response.status(201).json({ item });
});

router.put('/:id', requireAuth, async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) return response.status(400).json({ message: 'Content ID is invalid.' });
  const fields = pickContentFields(request.body);
  if (!Object.keys(fields).length) return response.status(400).json({ message: 'At least one content field must be provided.' });
  if (!validateContentUrls(fields)) return response.status(400).json({ message: 'Media and thumbnail URLs must be valid HTTP or HTTPS URLs.' });

  const existing = await Content.findById(request.params.id);
  if (!existing) return response.status(404).json({ message: 'Content was not found.' });
  const publicationDate = publicationDateForUpdate(fields.status, existing.status, fields.publicationDate);
  if (publicationDate !== undefined) fields.publicationDate = publicationDate;
  const publicationError = validatePublication(
    fields.status ?? existing.status,
    fields.publicationDate !== undefined ? fields.publicationDate : existing.publicationDate,
  );
  if (publicationError) return response.status(400).json({ message: publicationError });
  Object.assign(existing, fields);
  const item = await existing.save();
  if (item.featured) await Content.updateMany({ _id: { $ne: item._id }, featured: true }, { $set: { featured: false } });
  return response.json({ item });
});

router.delete('/:id', requireAuth, async (request, response) => {
  if (!mongoose.isObjectIdOrHexString(request.params.id)) return response.status(400).json({ message: 'Content ID is invalid.' });
  const item = await Content.findByIdAndDelete(request.params.id);
  if (!item) return response.status(404).json({ message: 'Content was not found.' });
  await Promise.all([
    Comment.deleteMany({ content: item._id }),
    Like.deleteMany({ content: item._id }),
  ]);
  return response.status(204).end();
});

export default router;
