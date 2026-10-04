// const ProcessingHistory = require('../models/ProcessingHistory');
// const AppError = require('../utils/AppError');
// const asyncHandler = require('../utils/asyncHandler');

// exports.list = asyncHandler(async (req, res) => {
//   const items = await ProcessingHistory.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);
//   res.json({ history: items.map((h) => ({ ...h.toObject(), hasOutput: !!h.outputFile })) });
// });
// exports.get = asyncHandler(async (req, res) => {
//   const h = await ProcessingHistory.findOne({ _id: req.params.id, userId: req.user.id });
//   if (!h) throw new AppError('History entry not found.', 404);
//   res.json({ item: h });
// });
// exports.download = asyncHandler(async (req, res) => {
//   const h = await ProcessingHistory.findOne({ _id: req.params.id, userId: req.user.id }).select('+outputBuffer');
//   if (!h || !h.outputBuffer) throw new AppError('No output file is available for this entry.', 404);
//   const isCsv = h.outputFile.endsWith('.csv');
//   res.set({ 'Content-Type': isCsv ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${encodeURIComponent(h.outputFile)}"`, 'Access-Control-Expose-Headers': 'Content-Disposition' });
//   res.send(h.outputBuffer);
// });
import ProcessingHistory from "../models/ProcessingHistory.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const list = asyncHandler(async (req, res) => {
  const items = await ProcessingHistory.find({
    userId: req.user.id,
  })
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({
    history: items.map((h) => ({
      ...h.toObject(),
      hasOutput: !!h.outputFile,
    })),
  });
});

const get = asyncHandler(async (req, res) => {
  const h = await ProcessingHistory.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!h) {
    throw new AppError(
      "History entry not found.",
      404
    );
  }

  res.json({
    item: h,
  });
});

const download = asyncHandler(async (req, res) => {
  const h = await ProcessingHistory.findOne({
    _id: req.params.id,
    userId: req.user.id,
  }).select("+outputBuffer");

  if (!h || !h.outputBuffer) {
    throw new AppError(
      "No output file is available for this entry.",
      404
    );
  }

  const isCsv = h.outputFile.endsWith(".csv");

  res.set({
    "Content-Type": isCsv
      ? "text/csv"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "Content-Disposition":
      `attachment; filename="${encodeURIComponent(
        h.outputFile
      )}"`,

    "Access-Control-Expose-Headers":
      "Content-Disposition",
  });

  res.send(h.outputBuffer);
});

export {
  list,
  get,
  download,
};