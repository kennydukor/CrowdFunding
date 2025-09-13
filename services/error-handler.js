const ApiError = require('../utils/api-error');

module.exports = (err, req, res, next) => {
 console.error(`Error: ${err.message}\nStack: ${err.stack}`);

 if (process.env.NODE_ENV !== 'test') {
  console.error({ error: err.error, stack: err.stack });
 }
 const isDevelopment = process.env.NODE_ENV === 'development';

 if (err instanceof ApiError) {
  return res.status(err.statusCode || ResponseUtil.BAD_REQUEST).json({
   success: false,
   message: err.message,
   error: err.error,
   ...(isDevelopment && { stack: err.stack }),
  });
 }

 const status = err.status || 500;
 return res.status(status).json({
  success: false,
  message: err.message || 'Something went wrong',
  ...(isDevelopment && { stack: err.stack }),
 });
};
