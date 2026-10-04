// const ExcelFile = require('../models/ExcelFile');
// const AppError = require('../utils/AppError');
// const { sanitizeName } = require('./engine');

// /** Load a file owned by the requesting user (never another user's). */
// async function getOwnedFile(userId, fileId, withData = false) {
//   if (!fileId) throw new AppError('Please select a file first.', 400);
//   const q = ExcelFile.findOne({ _id: fileId, userId });
//   const file = await (withData ? q.select('+data') : q);
//   if (!file) throw new AppError('File not found.', 404);
//   return file;
// }

// /** Use the (possibly unsaved) workspace state from the request when supplied, else the stored data. */
// async function getWorkingSet(req) {
//   const file = await getOwnedFile(req.user.id, req.body.fileId, true);
//   const { columns, data } = req.body;
//   if (Array.isArray(columns) && Array.isArray(data)) {
//     if (data.length > 50000 || columns.length > 200) throw new AppError('The data is too large to process.', 400);
//     return { file, columns: columns.map(sanitizeName), data: data.filter((r) => r && typeof r === 'object') };
//   }
//   return { file, columns: [...file.columns], data: file.data || [] };
// }

// async function persistData(file, columns, data, status = 'Completed') {
//   file.columns = columns;
//   file.data = data;
//   file.rowCount = data.length;
//   file.columnCount = columns.length;
//   file.status = status;
//   await file.save();
// }
// module.exports = { getOwnedFile, getWorkingSet, persistData };
import ExcelFile from "../models/ExcelFile.js";
import AppError from "../utils/AppError.js";

import {
  sanitizeName,
} from "./engine.js";

/**
 * Load a file owned by the requesting user.
 * Never allow access to another user's file.
 */
async function getOwnedFile(
  userId,
  fileId,
  withData = false
) {
  if (!fileId) {
    throw new AppError(
      "Please select a file first.",
      400
    );
  }

  const q = ExcelFile.findOne({
    _id: fileId,
    userId,
  });

  const file = await (
    withData
      ? q.select("+data")
      : q
  );

  if (!file) {
    throw new AppError(
      "File not found.",
      404
    );
  }

  return file;
}

/**
 * Use the possibly unsaved workspace state
 * from the request when supplied.
 * Otherwise use the stored data.
 */
async function getWorkingSet(req) {
  const file = await getOwnedFile(
    req.user.id,
    req.body.fileId,
    true
  );

  const { columns, data } = req.body;

  if (
    Array.isArray(columns) &&
    Array.isArray(data)
  ) {
    if (
      data.length > 50000 ||
      columns.length > 200
    ) {
      throw new AppError(
        "The data is too large to process.",
        400
      );
    }

    return {
      file,
      columns: columns.map(sanitizeName),
      data: data.filter(
        (r) =>
          r &&
          typeof r === "object"
      ),
    };
  }

  return {
    file,
    columns: [...file.columns],
    data: file.data || [],
  };
}

async function persistData(
  file,
  columns,
  data,
  status = "Completed"
) {
  file.columns = columns;
  file.data = data;
  file.rowCount = data.length;
  file.columnCount = columns.length;
  file.status = status;

  await file.save();
}

export {
  getOwnedFile,
  getWorkingSet,
  persistData,
};