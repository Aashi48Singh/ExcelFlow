// const multer = require('multer');
// exports.notFound = (_req, res) => res.status(404).json({ message: 'Resource not found.' });
// exports.errorHandler = (err, _req, res, _next) => {
//   if (err instanceof multer.MulterError) {
//     const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large. The maximum size is 5 MB.' : 'Please upload a valid Excel or CSV file.';
//     return res.status(400).json({ message });
//   }
//   if (err.name === 'CastError') return res.status(404).json({ message: 'Resource not found.' });
//   if (err.type === 'entity.too.large') return res.status(413).json({ message: 'The data is too large to process.' });
//   if (err.isOperational) return res.status(err.status || 400).json({ message: err.message });
//   console.error(err); // raw errors are logged server-side only
//   res.status(500).json({ message: 'Something went wrong. Please try again.' });
// };
import multer from "multer";

const notFound = (_req, res) => {
  res.status(404).json({
    message: "Resource not found.",
  });
};

const errorHandler = (err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. The maximum size is 5 MB."
        : "Please upload a valid Excel or CSV file.";

    return res.status(400).json({ message });
  }

  if (err.name === "CastError") {
    return res.status(404).json({
      message: "Resource not found.",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      message: "The data is too large to process.",
    });
  }

  if (err.isOperational) {
    return res.status(err.status || 400).json({
      message: err.message,
    });
  }

  console.error(err);

  res.status(500).json({
    message: "Something went wrong. Please try again.",
  });
};

export { notFound, errorHandler };