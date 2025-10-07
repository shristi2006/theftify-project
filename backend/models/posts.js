import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text', 'image'], required: true },
  title: { type: String, trim: true },
  content: { type: String, trim: true },
  imageUrl: { type: String }, 
  caption: { type: String, trim: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }]
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);