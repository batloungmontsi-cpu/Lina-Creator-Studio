import mongoose from 'mongoose';

const viewerSchema = new mongoose.Schema({
  viewerId: { type: String, required: true, unique: true, trim: true, maxlength: 100 },
  displayName: { type: String, trim: true, maxlength: 50, default: 'Viewer' },
}, { timestamps: true });

export default mongoose.model('Viewer', viewerSchema);
