import { verifyToken } from '../utils/jwt.js';
import { db, publicUser } from '../services/dataStore.js';

export function requireAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

    if (!token) {
      const err = new Error('Требуется авторизация');
      err.status = 401;
      throw err;
    }

    const payload = verifyToken(token);
    const user = db.users.find((u) => u.id === Number(payload.sub));
    if (!user) {
      const err = new Error('Требуется авторизация');
      err.status = 401;
      throw err;
    }

    req.user = publicUser(user);
    next();
  } catch (_error) {
    const err = new Error('Требуется авторизация');
    err.status = 401;
    next(err);
  }
}

