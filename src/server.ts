import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import progressRouter from './routes/progress.js';
import topicsRouter from './routes/topics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/progress', progressRouter);
app.use('/api/topics', topicsRouter);

app.listen(PORT, () => {
  console.log(`Mwangaza server running on port ${PORT}`);
});
