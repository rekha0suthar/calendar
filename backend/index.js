import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import eventRoutes from './routes/event.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/events', eventRoutes);

mongoose
  .connect(process.env.MONGO_URI || '')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

app.listen(port, () => console.log(`Server is running on port ${port}`));
