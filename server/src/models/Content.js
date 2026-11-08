import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  type: { type: String, required: true, enum: ['Video', 'Article', 'Photo story', 'Podcast', 'Image'] },
  status: { type: String, required: true, enum: ['Draft', 'Published', 'Scheduled'], default: 'Draft' },
  featured: { type: Boolean, default: false },
  thumbnailUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  mediaUrl: { type: String, trim: true, maxlength: 2048, default: '' },
  articleContent: { type: String, maxlength: 50000, default: '' },
  duration: { type: String, trim: true, maxlength: 80, default: '' },
  publicationDate: { type: Date, default: Date.now },
  views: { type: Number, min: 0, default: 0 },
  likes: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

contentSchema.index({ status: 1, publicationDate: -1 });
contentSchema.index({ title: 'text', description: 'text', category: 'text' });

export default mongoose.model('Content', contentSchema);
