// // const ExcelFile = require('../models/ExcelFile');
// // const ProcessingHistory = require('../models/ProcessingHistory');
// // const Automation = require('../models/Automation');
// // const AppError = require('../utils/AppError');
// // const asyncHandler = require('../utils/asyncHandler');
// // const { parseBuffer } = require('../services/excelService');
// // const { getOwnedFile, persistData } = require('../services/fileAccess');
// // const { sanitizeName } = require('../services/engine');

// // exports.upload = asyncHandler(async (req, res) => {
// //   if (!req.file) throw new AppError('Please upload a valid Excel or CSV file.', 400);
// //   const { sheets, columns, data, fileType } = parseBuffer(req.file.buffer, req.file.originalname);
// //   const file = await ExcelFile.create({
// //     userId: req.user.id, fileName: req.file.originalname.slice(0, 200), fileType, sheets, columns, data,
// //     rowCount: data.length, columnCount: columns.length, status: 'Uploaded',
// //   });
// //   await ProcessingHistory.create({ userId: req.user.id, fileId: file._id, kind: 'upload', fileName: file.fileName, automationName: 'File upload', status: 'Uploaded', rowsProcessed: data.length });
// //   res.status(201).json({ file: { ...file.toObject(), data: undefined } });
// // });

// // exports.list = asyncHandler(async (req, res) => {
// //   const files = await ExcelFile.find({ userId: req.user.id }).sort({ createdAt: -1 });
// //   res.json({ files });
// // });

// // exports.get = asyncHandler(async (req, res) => {
// //   const file = await getOwnedFile(req.user.id, req.params.id, true);
// //   res.json({ file: { ...file.toObject(), data: file.data } });
// // });

// // exports.saveData = asyncHandler(async (req, res) => {
// //   const file = await getOwnedFile(req.user.id, req.params.id, true);
// //   const { columns, data } = req.body;
// //   if (!Array.isArray(columns) || !Array.isArray(data) || columns.length === 0) throw new AppError('The uploaded file does not contain usable data.', 400);
// //   if (data.length > 50000 || columns.length > 200) throw new AppError('The data is too large to process.', 400);
// //   await persistData(file, columns.map(sanitizeName), data.filter((r) => r && typeof r === 'object'), 'Completed');
// //   res.json({ file: { ...file.toObject(), data: undefined } });
// // });

// // exports.remove = asyncHandler(async (req, res) => {
// //   const file = await getOwnedFile(req.user.id, req.params.id);
// //   await file.deleteOne();
// //   await ProcessingHistory.deleteMany({ userId: req.user.id, fileId: file._id });
// //   res.json({ message: 'File deleted.' });
// // });

// // exports.stats = asyncHandler(async (req, res) => {
// //   const userId = req.user.id;
// //   const [totalFiles, processedFiles, savedAutomations, reportsGenerated, recent] = await Promise.all([
// //     ExcelFile.countDocuments({ userId }),
// //     ExcelFile.countDocuments({ userId, status: 'Completed' }),
// //     Automation.countDocuments({ userId }),
// //     ProcessingHistory.countDocuments({ userId, kind: 'report' }),
// //     ExcelFile.find({ userId }).sort({ createdAt: -1 }).limit(5),
// //   ]);
// //   res.json({ totalFiles, processedFiles, savedAutomations, reportsGenerated, recent });
// // });
// import ExcelFile from "../models/ExcelFile.js";
// import ProcessingHistory from "../models/ProcessingHistory.js";
// import Automation from "../models/Automation.js";

// import AppError from "../utils/AppError.js";
// import asyncHandler from "../utils/asyncHandler.js";

// import { parseBuffer } from "../services/excelService.js";
// import {
//   getOwnedFile,
//   persistData,
// } from "../services/fileAccess.js";

// import { sanitizeName } from "../services/engine.js";

// const upload = asyncHandler(async (req, res) => {
//   if (!req.file) {
//     throw new AppError(
//       "Please upload a valid Excel or CSV file.",
//       400
//     );
//   }

//   const {
//     sheets,
//     columns,
//     data,
//     fileType,
//   } = parseBuffer(
//     req.file.buffer,
//     req.file.originalname
//   );

//   const file = await ExcelFile.create({
//     userId: req.user.id,
//     fileName: req.file.originalname.slice(0, 200),
//     fileType,
//     sheets,
//     columns,
//     data,
//     rowCount: data.length,
//     columnCount: columns.length,
//     status: "Uploaded",
//   });

//   await ProcessingHistory.create({
//     userId: req.user.id,
//     fileId: file._id,
//     kind: "upload",
//     fileName: file.fileName,
//     automationName: "File upload",
//     status: "Uploaded",
//     rowsProcessed: data.length,
//   });

//   res.status(201).json({
//     file: {
//       ...file.toObject(),
//       data: undefined,
//     },
//   });
// });

// const list = asyncHandler(async (req, res) => {
//   const files = await ExcelFile.find({
//     userId: req.user.id,
//   }).sort({
//     createdAt: -1,
//   });

//   res.json({ files });
// });

// const get = asyncHandler(async (req, res) => {
//   const file = await getOwnedFile(
//     req.user.id,
//     req.params.id,
//     true
//   );

//   res.json({
//     file: {
//       ...file.toObject(),
//       data: file.data,
//     },
//   });
// });

// const saveData = asyncHandler(async (req, res) => {
//   const file = await getOwnedFile(
//     req.user.id,
//     req.params.id,
//     true
//   );

//   const { columns, data } = req.body;

//   if (
//     !Array.isArray(columns) ||
//     !Array.isArray(data) ||
//     columns.length === 0
//   ) {
//     throw new AppError(
//       "The uploaded file does not contain usable data.",
//       400
//     );
//   }

//   if (
//     data.length > 50000 ||
//     columns.length > 200
//   ) {
//     throw new AppError(
//       "The data is too large to process.",
//       400
//     );
//   }

//   await persistData(
//     file,
//     columns.map(sanitizeName),
//     data.filter(
//       (r) => r && typeof r === "object"
//     ),
//     "Completed"
//   );

//   res.json({
//     file: {
//       ...file.toObject(),
//       data: undefined,
//     },
//   });
// });

// const remove = asyncHandler(async (req, res) => {
//   const file = await getOwnedFile(
//     req.user.id,
//     req.params.id
//   );

//   await file.deleteOne();

//   await ProcessingHistory.deleteMany({
//     userId: req.user.id,
//     fileId: file._id,
//   });

//   res.json({
//     message: "File deleted.",
//   });
// });

// const stats = asyncHandler(async (req, res) => {
//   const userId = req.user.id;

//   const [
//     totalFiles,
//     processedFiles,
//     savedAutomations,
//     reportsGenerated,
//     recent,
//   ] = await Promise.all([
//     ExcelFile.countDocuments({ userId }),

//     ExcelFile.countDocuments({
//       userId,
//       status: "Completed",
//     }),

//     Automation.countDocuments({
//       userId,
//     }),

//     ProcessingHistory.countDocuments({
//       userId,
//       kind: "report",
//     }),

//     ExcelFile.find({
//       userId,
//     })
//       .sort({ createdAt: -1 })
//       .limit(5),
//   ]);

//   res.json({
//     totalFiles,
//     processedFiles,
//     savedAutomations,
//     reportsGenerated,
//     recent,
//   });
// });

// export {
//   upload,
//   list,
//   get,
//   saveData,
//   remove,
//   stats,
// };
import ExcelFile from "../models/ExcelFile.js";
import ProcessingHistory from "../models/ProcessingHistory.js";
import Automation from "../models/Automation.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import { parseBuffer } from "../services/excelService.js";

import {
  getOwnedFile,
  persistData,
} from "../services/fileAccess.js";

import { sanitizeName } from "../services/engine.js";

const upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError(
      "Please upload a valid Excel or CSV file.",
      400
    );
  }

  const {
    sheets,
    columns,
    data,
    fileType,
  } = parseBuffer(
    req.file.buffer,
    req.file.originalname
  );

  const file = await ExcelFile.create({
    userId: req.user.id,
    fileName: req.file.originalname.slice(0, 200),
    fileType,
    sheets,
    columns,
    data,
    rowCount: data.length,
    columnCount: columns.length,
    status: "Uploaded",
  });

  await ProcessingHistory.create({
    userId: req.user.id,
    fileId: file._id,
    kind: "upload",
    fileName: file.fileName,
    automationName: "File upload",
    status: "Uploaded",
    rowsProcessed: data.length,
  });

  res.status(201).json({
    file: {
      ...file.toObject(),
      data: undefined,
    },
  });
});

const list = asyncHandler(async (req, res) => {
  const files = await ExcelFile.find({
    userId: req.user.id,
  }).sort({
    createdAt: -1,
  });

  res.json({ files });
});

const get = asyncHandler(async (req, res) => {
  const file = await getOwnedFile(
    req.user.id,
    req.params.id,
    true
  );

  res.json({
    file: {
      ...file.toObject(),
      data: file.data,
    },
  });
});

const saveData = asyncHandler(async (req, res) => {
  const file = await getOwnedFile(
    req.user.id,
    req.params.id,
    true
  );

  const { columns, data } = req.body;

  if (
    !Array.isArray(columns) ||
    !Array.isArray(data) ||
    columns.length === 0
  ) {
    throw new AppError(
      "The uploaded file does not contain usable data.",
      400
    );
  }

  if (
    data.length > 50000 ||
    columns.length > 200
  ) {
    throw new AppError(
      "The data is too large to process.",
      400
    );
  }

  await persistData(
    file,
    columns.map(sanitizeName),
    data.filter(
      (r) => r && typeof r === "object"
    ),
    "Completed"
  );

  res.json({
    file: {
      ...file.toObject(),
      data: undefined,
    },
  });
});

const remove = asyncHandler(async (req, res) => {
  const file = await getOwnedFile(
    req.user.id,
    req.params.id
  );

  await file.deleteOne();

  await ProcessingHistory.deleteMany({
    userId: req.user.id,
    fileId: file._id,
  });

  res.json({
    message: "File deleted.",
  });
});

const stats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    totalFiles,
    processedFiles,
    savedAutomations,
    reportsGenerated,
    recent,
  ] = await Promise.all([
    ExcelFile.countDocuments({ userId }),

    ExcelFile.countDocuments({
      userId,
      status: "Completed",
    }),

    Automation.countDocuments({
      userId,
    }),

    ProcessingHistory.countDocuments({
      userId,
      kind: "report",
    }),

    ExcelFile.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.json({
    totalFiles,
    processedFiles,
    savedAutomations,
    reportsGenerated,
    recent,
  });
});

export {
  upload,
  list,
  get,
  saveData,
  remove,
  stats,
};