import { Router } from 'express';
import Comment from '../models/Comment.js';
import Content from '../models/Content.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/stats', requireAuth, async (request, response) => {
  const [total, published, drafts, scheduled, comments, views, likes] = await Promise.all([
    Content.countDocuments(),
    Content.countDocuments({ status: 'Published' }),
    Content.countDocuments({ status: 'Draft' }),
    Content.countDocuments({ status: 'Scheduled' }),
    Comment.countDocuments(),
    Content.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Content.aggregate([{ $group: { _id: null, total: { $sum: '$likes' } } }]),
  ]);
  return response.json({
    total,
    published,
    drafts,
    scheduled,
    comments,
    pendingComments: await Comment.countDocuments({ status: 'Pending' }),
    views: views[0]?.total || 0,
    likes: likes[0]?.total || 0,
  });
});

export default router;
