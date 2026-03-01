import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import progressRouter from './routes/progress.js';
import topicsRouter from './routes/topics.js';
import chatRouter from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/topics', topicsRouter);
app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
  console.log(`Mwangaza server running on port ${PORT}`);
});