// Postgres error codes we can translate into meaningful HTTP responses.
const PG_ERROR_MAP = {
  '22P02': { status: 400, message: 'Malformed identifier supplied' }, // invalid_text_representation
  '23503': { status: 400, message: 'Referenced record does not exist' }, // foreign_key_violation
  '23505': { status: 409, message: 'Record already exists' }, // unique_violation
  '23502': { status: 400, message: 'Required field is missing' }, // not_null_violation
  '22001': { status: 400, message: 'Value is too long' }, // string_data_right_truncation
  '22P01': { status: 400, message: 'Invalid value supplied' }, // invalid_text_representation (enum)
};

const errorHandler = (err, req, res, next) => {
  // Surface known database problems as clean client errors instead of a 500.
  if (err && err.code && PG_ERROR_MAP[err.code]) {
    const { status, message } = PG_ERROR_MAP[err.code];
    return res.status(status).json({
      message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;