export function validateBody(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
      const err = new Error(message);
      err.status = 400;
      return next(err);
    }

    req.body = parsed.data;
    return next();
  };
}
