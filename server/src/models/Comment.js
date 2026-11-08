import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true, index: true },
  viewer: { type: mongoose.Schema.Types.ObjectId, ref: 'Viewer' },
  displayName: { type: String, required: true, trim: true, maxlength: 50 },
  text: { type: String, required: true, trim: true, minlength: 3, maxlength: 1000 },
  status: { type: String, enum: ['Pending', 'Approved', 'Hidden'], default: 'Pending', index: true },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
