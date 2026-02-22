export function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('Недостаточно прав');
      err.status = 403;
      return next(err);
    }

    return next();
  };
}

