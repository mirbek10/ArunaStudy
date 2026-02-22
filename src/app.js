import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import moduleRoutes from './routes/modules.routes.js';
import sectionRoutes from './routes/sections.routes.js';
import lessonRoutes from './routes/lessons.routes.js';
import practiceRoutes from './routes/practices.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { attachRequestLanguage } from './middleware/language.js';
import { requireMongoStore } from './middleware/mongo.js';
import swaggerSpec from './docs/swagger.js';

const app = express();
const allowedOrigins = [env.CLIENT_URL, 'https://project-aruna-study.vercel.app'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());
app.use(attachRequestLanguage);

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Проверка состояния сервера
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerSpec));
app.get('/api/docs/', swaggerUi.setup(swaggerSpec));

app.use('/api/auth', requireMongoStore, authRoutes);
app.use('/api/sections', requireMongoStore, sectionRoutes);
app.use('/api/modules', requireMongoStore, moduleRoutes);
app.use('/api/lessons', requireMongoStore, lessonRoutes);
app.use('/api/practices', requireMongoStore, practiceRoutes);
app.use('/api/progress', requireMongoStore, progressRoutes);
app.use('/api/admin', requireMongoStore, adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
