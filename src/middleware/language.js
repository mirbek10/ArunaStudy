import { detectRequestLanguage } from '../utils/i18n.js';

export function attachRequestLanguage(req, _res, next) {
  req.lang = detectRequestLanguage(req);
  next();
}
