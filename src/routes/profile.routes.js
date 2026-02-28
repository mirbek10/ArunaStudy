import { Router } from 'express';
import { findUserByEmail, getUserById, publicUser } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { profileUpdateSchema } from '../utils/schemas.js';
import { hashPassword } from '../utils/password.js';
import { persistMongoStore } from '../services/mongoStore.js';

const router = Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Student-Profile]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', requireAuth, (req, res, next) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    return res.json({ profile: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Обновить профиль текущего пользователя
 *     tags: [Student-Profile]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/', requireAuth, validateBody(profileUpdateSchema), async (req, res, next) => {
  try {
    const user = getUserById(req.user.id);
    if (!user) {
      const err = new Error('Пользователь не найден');
      err.status = 404;
      return next(err);
    }

    if (req.body.email) {
      const existingUser = findUserByEmail(req.body.email);
      if (existingUser && existingUser.id !== user.id) {
        const err = new Error('Пользователь с таким email уже существует');
        err.status = 409;
        return next(err);
      }
      user.email = req.body.email;
    }

    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.password) {
      user.passwordHash = hashPassword(req.body.password);
    }

    await persistMongoStore();
    return res.json({ profile: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

export default router;
