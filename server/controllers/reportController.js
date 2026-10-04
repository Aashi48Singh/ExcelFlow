// const asyncHandler = require('../utils/asyncHandler');
// const ProcessingHistory = require('../models/ProcessingHistory');
// const AppError = require('../utils/AppError');
// const { getOwnedFile } = require('../services/fileAccess');
// const { buildReport, REPORT_TYPES } = require('../services/reports');
// const { buildReportFile } = require('../services/excelService');

// const make = async (req) => {
//   if (!REPORT_TYPES.includes(req.query.type)) throw new AppError('Please choose a report type.', 400);
//   const file = await getOwnedFile(req.user.id, req.params.fileId, true);
//   return { file, report: buildReport(req.query.type, file.columns, file.data || []) };
// };

// exports.generate = asyncHandler(async (req, res) => {
//   const { file, report } = await make(req);
//   await ProcessingHistory.create({ userId: req.user.id, fileId: file._id, kind: 'report', fileName: file.fileName, automationName: report.title, status: 'Completed', rowsProcessed: file.rowCount, details: { metrics: report.metrics } });
//   res.json({ report });
// });

// exports.download = asyncHandler(async (req, res) => {
//   const { file, report } = await make(req);
//   const name = `${file.fileName.replace(/\.[^.]+$/, '')}_${req.query.type}_report.xlsx`;
//   res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"`, 'Access-Control-Expose-Headers': 'Content-Disposition' });
//   res.send(buildReportFile(report));
// });
import asyncHandler from "../utils/asyncHandler.js";
import ProcessingHistory from "../models/ProcessingHistory.js";
import AppError from "../utils/AppError.js";

import {
  getOwnedFile,
} from "../services/fileAccess.js";

import {
  buildReport,
  REPORT_TYPES,
} from "../services/reports.js";

import {
  buildReportFile,
} from "../services/excelService.js";

const make = async (req) => {
  if (!REPORT_TYPES.includes(req.query.type)) {
    throw new AppError(
      "Please choose a report type.",
      400
    );
  }

  const file = await getOwnedFile(
    req.user.id,
    req.params.fileId,
    true
  );

  return {
    file,
    report: buildReport(
      req.query.type,
      file.columns,
      file.data || []
    ),
  };
};

const generate = asyncHandler(async (req, res) => {
  const { file, report } = await make(req);

  await ProcessingHistory.create({
    userId: req.user.id,
    fileId: file._id,
    kind: "report",
    fileName: file.fileName,
    automationName: report.title,
    status: "Completed",
    rowsProcessed: file.rowCount,
    details: {
      metrics: report.metrics,
    },
  });

  res.json({
    report,
  });
});

const download = asyncHandler(async (req, res) => {
  const { file, report } = await make(req);

  const name = `${file.fileName.replace(
    /\.[^.]+$/,
    ""
  )}_${req.query.type}_report.xlsx`;

  res.set({
    "Content-Type":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    "Content-Disposition":
      `attachment; filename="${encodeURIComponent(
        name
      )}"`,

    "Access-Control-Expose-Headers":
      "Content-Disposition",
  });

  res.send(buildReportFile(report));
});

export {
  generate,
  download,
};