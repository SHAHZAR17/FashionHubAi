// Shared error handler — catches anything not already handled in a controller
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Something went wrong on the server",
  });
}

module.exports = errorHandler;
