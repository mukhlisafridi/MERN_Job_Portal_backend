
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        errorHandler(403, `Role (${req.user.role}) is not allowed`)
      );
    }
    next();
  };
};