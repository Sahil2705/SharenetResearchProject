// Standardized JSON response handler for SmartNet REST APIs

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

const badRequestResponse = (res, message = 'Invalid request parameters', errors = null) => {
  return errorResponse(res, message, 400, errors);
};

const unauthorizedResponse = (res, message = 'Authentication required') => {
  return errorResponse(res, message, 401);
};

const forbiddenResponse = (res, message = 'Access forbidden: insufficient permissions') => {
  return errorResponse(res, message, 403);
};

const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};
