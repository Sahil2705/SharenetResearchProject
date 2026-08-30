const { badRequestResponse } = require('../utils/responseHandler');

const validateRegister = (req, res, next) => {
  const { full_name, email, phone, password } = req.body;
  const errors = [];

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
    errors.push('A valid phone number is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return badRequestResponse(res, errors.join(' '), errors);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Email is required.');
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return badRequestResponse(res, errors.join(' '), errors);
  }

  next();
};

const validateDataAmount = (req, res, next) => {
  const { amount } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return badRequestResponse(res, 'Invalid data amount. Must be a positive number greater than 0.');
  }

  if (numAmount > 1000) {
    return badRequestResponse(res, 'Data amount exceeds maximum allowed single transaction limit (1000 GB).');
  }

  req.validatedAmount = Number(numAmount.toFixed(2));
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateDataAmount
};
