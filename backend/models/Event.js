import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String, // Store as YYYY-MM-DD string
    required: true,
  },
  description: String,
});

export default mongoose.model('Event', eventSchema);
