import { Router } from 'express';
import { db } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';

const router = Router();

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Показатели админ-дашборда
 *     tags: [Admin-Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', requireAuth, allowRoles('admin'), (_req, res) => {
  const studentsCount = db.users.filter((u) => u.role === 'student').length;
  const modulesCount = db.modules.length;
  const lessonsCount = db.lessons.length;
  const pendingPractices = db.practiceSubmissions.filter((row) => row.status === 'pending').length;

  res.json({
    studentsCount,
    modulesCount,
    lessonsCount,
    pendingPractices
  });
});

export default router;


