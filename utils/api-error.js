/**
 * Custom error class for handling API-specific errors.
 */
module.exports = class ApiError extends Error {
 /**
  * Constructs a new ApiError instance.
  *
  * @param message - The error message.
  * @param statusCode - The HTTP status code associated with the error.
  * @param isOperational - Indicates if the error is operational (defaults to `true`).
  */
 constructor(message, statusCode, error = null, isOperational = true) {
  super(message);

  Object.setPrototypeOf(this, new.target.prototype);
  this.statusCode = statusCode;
  this.isOperational = isOperational;
  this.error = error;
  Error.captureStackTrace(this);
 }

 /**
  * Creates a new ApiError for a `400 Bad Request` error.
  *
  * @param message - The error message.
  * @returns An ApiError instance.
  */
 static badRequest(message, error = null) {
  return new ApiError(message, 400, error);
 }

 /**
  * Creates a new ApiError for a `401 Unauthorized` error.
  *
  * @param message - The error message.
  * @returns An ApiError instance.
  */
 static unauthorized(message) {
  return new ApiError(message, 401);
 }

 /**
  * Creates a new ApiError for a `403 Forbidden` error.
  *
  * @param message - The error message.
  * @returns An ApiError instance.
  */
 static forbidden(message) {
  return new ApiError(message, 403);
 }

 /**
  * Creates a new ApiError for a `404 Not Found` error.
  *
  * @param message - The error message.
  * @returns An ApiError instance.
  */
 static notFound(message) {
  return new ApiError(message, 404);
 }

 /**
  * Creates a new ApiError for a `500 Internal Server Error`.
  *
  * @param message - The error message.
  * @returns An ApiError instance.
  */
 static internal(message) {
  return new ApiError(message, 500);
 }
};
