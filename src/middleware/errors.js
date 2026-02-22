export function notFound(_req, _res, next) {
  const err = new Error('Маршрут не найден');
  err.status = 404;
  next(err);
}

const FALLBACK_MESSAGES = {
  400: 'Ошибка в запросе',
  401: 'Требуется авторизация',
  403: 'Недостаточно прав',
  404: 'Ресурс не найден',
  409: 'Конфликт данных',
  422: 'Ошибка валидации'
};

function isRussianMessage(message) {
  return typeof message === 'string' && /[А-Яа-яЁё]/.test(message);
}

function getFallbackMessage(status) {
  if (status >= 500) {
    return 'Внутренняя ошибка сервера';
  }

  return FALLBACK_MESSAGES[status] || 'Ошибка запроса';
}

function resolveErrorMessage(err, status) {
  if (err?.type === 'entity.parse.failed') {
    return 'Некорректный JSON в теле запроса';
  }

  if (isRussianMessage(err?.message)) {
    return err.message;
  }

  return getFallbackMessage(status);
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  res.status(status).json({
    message: resolveErrorMessage(err, status)
  });
}
