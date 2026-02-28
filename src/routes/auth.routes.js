import { Router } from 'express';
import { addUser, findUserByEmail, publicUser } from '../services/dataStore.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { loginSchema, registerSchema } from '../utils/schemas.js';
import { persistMongoStore } from '../services/mongoStore.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового студента
 *     tags: [Public-Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             additionalProperties: false
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered
 *       409:
 *         description: Пользователь с таким email уже существует
 */
router.post('/register', validateBody(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (findUserByEmail(email)) {
      const err = new Error('Пользователь с таким email уже существует');
      err.status = 409;
      return next(err);
    }

    const user = addUser({
      name,
      email,
      passwordHash: hashPassword(password),
      role: 'student'
    });

    await persistMongoStore();

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход по email и паролю
 *     tags: [Public-Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             additionalProperties: false
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth success
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validateBody(loginSchema), (req, res, next) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (!user || !comparePassword(password, user.passwordHash)) {
    const err = new Error('Неверный email или пароль');
    err.status = 401;
    return next(err);
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Student-Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get('/me', requireAuth, (req, res, next) => {
  try {
    if (!req.user) {
      const err = new Error('Пользователь не найден');
      err.status = 401;
      return next(err);
    }

    return res.status(200).json(publicUser(req.user));
  } catch (err) {
    return next(err);
  }
});

export default router;
