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
import swaggerSpec from './docs/swagger.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());

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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/practices', practiceRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

