import mongoose from 'mongoose';
mongoose.pluralize(null);

const collection = 'messages'
const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
}, {
  timestamps: true,
});

const Message = mongoose.model(collection, messageSchema);

export default Message;