export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.path}` });
}

export function handleError(error, request, response, next) {
  if (response.headersSent) return next(error);

  if (error.message === 'This origin is not allowed by the CORS policy.') {
    return response.status(403).json({ message: 'This origin is not allowed.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ message: 'The submitted data is invalid.', details: error.message });
  }
  if (error.code === 11000) {
    return response.status(409).json({ message: 'A record with that value already exists.' });
  }

  console.error(error);
  return response.status(500).json({ message: 'An unexpected server error occurred.' });
}
