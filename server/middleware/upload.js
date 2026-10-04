// const multer = require('multer');
// const path = require('path');
// const AppError = require('../utils/AppError');
// const ALLOWED = ['.xlsx', '.xls', '.csv'];
// module.exports = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024, files: 1 },
//   fileFilter: (_req, file, cb) => {
//     if (ALLOWED.includes(path.extname(file.originalname).toLowerCase())) return cb(null, true);
//     cb(new AppError('Please upload a valid Excel or CSV file.', 400));
//   },
// }).single('file');

import multer from "multer";
import path from "path";
import AppError from "../utils/AppError.js";

const ALLOWED = [".xlsx", ".xls", ".csv"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (ALLOWED.includes(extension)) {
      return cb(null, true);
    }

    cb(
      new AppError(
        "Please upload a valid Excel or CSV file.",
        400
      )
    );
  },
}).single("file");

export default upload;