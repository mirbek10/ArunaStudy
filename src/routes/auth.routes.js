import { Router } from 'express';
import { addUser, findUserByEmail, publicUser } from '../services/dataStore.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../utils/schemas.js';

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
 *         description: Email already exists
 */
router.post('/register', validateBody(registerSchema), (req, res, next) => {
  const { name, email, password } = req.body;

  if (findUserByEmail(email)) {
    const err = new Error('Email already exists');
    err.status = 409;
    return next(err);
  }

  const user = addUser({
    name,
    email,
    passwordHash: hashPassword(password),
    role: 'student'
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: publicUser(user) });
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
    const err = new Error('Invalid email or password');
    err.status = 401;
    return next(err);
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
});

export default router;

