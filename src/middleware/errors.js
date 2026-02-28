import { localizeMessage } from '../utils/messages.js';

export function notFound(_req, _res, next) {
  const err = new Error('Маршрут не найден');
  err.status = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message =
    err?.type === 'entity.parse.failed'
      ? localizeMessage('Некорректный JSON в теле запроса', status)
      : localizeMessage(err?.localizedMessage || err?.message, status);

  res.status(status).json({
    message
  });
}
