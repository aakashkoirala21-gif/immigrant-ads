import express from 'express';
import dotenv from 'dotenv';
import { migrator } from './utils/migrator';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes'
import commentRoutes from './routes/comment.routes'
import communityRoutes from './routes/community.routes'
import likeRoutes from './routes/like.routes'
import paymentRoutes from './routes/payment.routes'
import professionalRoutes from './routes/professional.routes'
import scheduleRoutes from './routes/schedule.routes'

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }) // raw body ONLY for Stripe
);

(async () => {
  try {
    await migrator.up();
    console.log('✅ All migrations executed');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
})();

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/category', categoryRoutes);
app.use('/comment', commentRoutes);
app.use('/community', communityRoutes);
app.use('/like', likeRoutes);
app.use('/payment', paymentRoutes);
app.use('/professional', professionalRoutes);
app.use('/schedule', scheduleRoutes);



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
