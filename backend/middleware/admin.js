const { forbiddenResponse } = require('../utils/responseHandler');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return forbiddenResponse(res, 'Authentication required');
  }

  if (req.user.role !== 'admin') {
    return forbiddenResponse(res, 'Access denied: Administrator privileges required');
  }

  next();
};

module.exports = {
  requireAdmin
};
