// // const AppError = require('../utils/AppError');
// // const asyncHandler = require('../utils/asyncHandler');
// // const ProcessingHistory = require('../models/ProcessingHistory');
// // const engine = require('../services/engine');
// // const { getWorkingSet } = require('../services/fileAccess');
// // const { buildFile } = require('../services/excelService');

// // const result = (ctx) => ({ columns: ctx.columns, data: ctx.data, messages: ctx.messages, results: ctx.results, issues: ctx.issues, rowCount: ctx.data.length });

// // // Each operation returns the transformed dataset to the client; nothing is persisted until the user saves.
// // exports.clean = asyncHandler(async (req, res) => {
// //   const { columns, data } = await getWorkingSet(req);
// //   const ops = Array.isArray(req.body.ops) ? req.body.ops : [];
// //   if (!ops.length) throw new AppError('Select at least one cleaning option.', 400);
// //   res.json(result(engine.runRules(columns, data, ops.map((o) => ({ ...o, type: 'clean' })))));
// // });

// // exports.validate = asyncHandler(async (req, res) => {
// //   const { columns, data } = await getWorkingSet(req);
// //   const checks = Array.isArray(req.body.checks) && req.body.checks.length ? req.body.checks : [{ check: 'missing' }];
// //   const ctx = engine.runRules(columns, data, checks.map((c) => ({ ...c, type: 'validate' })));
// //   res.json({ issues: ctx.issues, messages: ctx.messages, rowCount: data.length });
// // });

// // exports.calculate = asyncHandler(async (req, res) => {
// //   const { columns, data } = await getWorkingSet(req);
// //   res.json(result(engine.runRules(columns, data, req.body.rules)));
// // });

// // exports.command = asyncHandler(async (req, res) => {
// //   const { columns, data } = await getWorkingSet(req);
// //   const rules = engine.parseCommand(req.body.text, columns);
// //   if (req.body.preview) return res.json({ rules, steps: rules.map(engine.describeRule) });
// //   res.json({ rules, steps: rules.map(engine.describeRule), ...result(engine.runRules(columns, data, rules)) });
// // });

// // exports.export = asyncHandler(async (req, res) => {
// //   const { file, columns, data } = await getWorkingSet(req);
// //   const format = req.body.format === 'csv' ? 'csv' : 'xlsx';
// //   const out = buildFile(columns, data, format);
// //   const base = file.fileName.replace(/\.[^.]+$/, '');
// //   const outputFile = `${base}_processed.${out.ext}`;
// //   await ProcessingHistory.create({ userId: req.user.id, fileId: file._id, kind: 'export', fileName: file.fileName, automationName: `Export (${out.ext.toUpperCase()})`, status: 'Completed', rowsProcessed: data.length, outputFile, outputBuffer: out.buffer });
// //   res.set({ 'Content-Type': out.mime, 'Content-Disposition': `attachment; filename="${encodeURIComponent(outputFile)}"`, 'Access-Control-Expose-Headers': 'Content-Disposition' });
// //   res.send(out.buffer);
// // });

// // exports.supported = (_req, res) => res.json({ commands: engine.SUPPORTED_COMMANDS });
// import AppError from "../utils/AppError.js";
// import asyncHandler from "../utils/asyncHandler.js";

// import ProcessingHistory from "../models/ProcessingHistory.js";

// import * as engine from "../services/engine.js";

// import {
//   getWorkingSet,
// } from "../services/fileAccess.js";

// import {
//   buildFile,
// } from "../services/excelService.js";

// const result = (ctx) => ({
//   columns: ctx.columns,
//   data: ctx.data,
//   messages: ctx.messages,
//   results: ctx.results,
//   issues: ctx.issues,
//   rowCount: ctx.data.length,
// });

// // CLEAN
// const clean = asyncHandler(async (req, res) => {
//   const { columns, data } = await getWorkingSet(req);

//   const ops = Array.isArray(req.body.ops)
//     ? req.body.ops
//     : [];

//   if (!ops.length) {
//     throw new AppError(
//       "Select at least one cleaning option.",
//       400
//     );
//   }

//   const rules = ops.map((o) => ({
//     ...o,
//     type: "clean",
//   }));

//   res.json(
//     result(
//       engine.runRules(
//         columns,
//         data,
//         rules
//       )
//     )
//   );
// });

// // VALIDATE
// const validate = asyncHandler(async (req, res) => {
//   const { columns, data } = await getWorkingSet(req);

//   const checks =
//     Array.isArray(req.body.checks) &&
//     req.body.checks.length
//       ? req.body.checks
//       : [{ check: "missing" }];

//   const rules = checks.map((c) => ({
//     ...c,
//     type: "validate",
//   }));

//   const ctx = engine.runRules(
//     columns,
//     data,
//     rules
//   );

//   res.json({
//     issues: ctx.issues,
//     messages: ctx.messages,
//     rowCount: data.length,
//   });
// });

// // CALCULATE
// const calculate = asyncHandler(async (req, res) => {
//   const { columns, data } =
//     await getWorkingSet(req);

//   res.json(
//     result(
//       engine.runRules(
//         columns,
//         data,
//         req.body.rules
//       )
//     )
//   );
// });

// // COMMAND
// const command = asyncHandler(async (req, res) => {
//   const { columns, data } =
//     await getWorkingSet(req);

//   const rules = engine.parseCommand(
//     req.body.text,
//     columns
//   );

//   if (req.body.preview) {
//     return res.json({
//       rules,
//       steps: rules.map(
//         engine.describeRule
//       ),
//     });
//   }

//   res.json({
//     rules,
//     steps: rules.map(
//       engine.describeRule
//     ),
//     ...result(
//       engine.runRules(
//         columns,
//         data,
//         rules
//       )
//     ),
//   });
// });

// // EXPORT
// const exportFile = asyncHandler(async (req, res) => {
//   const {
//     file,
//     columns,
//     data,
//   } = await getWorkingSet(req);

//   const format =
//     req.body.format === "csv"
//       ? "csv"
//       : "xlsx";

//   const out = buildFile(
//     columns,
//     data,
//     format
//   );

//   const base = file.fileName.replace(
//     /\.[^.]+$/,
//     ""
//   );

//   const outputFile =
//     `${base}_processed.${out.ext}`;

//   await ProcessingHistory.create({
//     userId: req.user.id,
//     fileId: file._id,
//     kind: "export",
//     fileName: file.fileName,
//     automationName:
//       `Export (${out.ext.toUpperCase()})`,
//     status: "Completed",
//     rowsProcessed: data.length,
//     outputFile,
//     outputBuffer: out.buffer,
//   });

//   res.set({
//     "Content-Type": out.mime,
//     "Content-Disposition":
//       `attachment; filename="${encodeURIComponent(
//         outputFile
//       )}"`,
//     "Access-Control-Expose-Headers":
//       "Content-Disposition",
//   });

//   res.send(out.buffer);
// });

// // SUPPORTED COMMANDS
// const supported = (_req, res) => {
//   res.json({
//     commands: engine.SUPPORTED_COMMANDS,
//   });
// };

// export {
//   clean,
//   validate,
//   calculate,
//   command,
//   exportFile,
//   supported,
// };
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import ProcessingHistory from "../models/ProcessingHistory.js";

import * as engine from "../services/engine.js";

import {
  getWorkingSet,
} from "../services/fileAccess.js";

import {
  buildFile,
} from "../services/excelService.js";

const result = (ctx) => ({
  columns: ctx.columns,
  data: ctx.data,
  messages: ctx.messages,
  results: ctx.results,
  issues: ctx.issues,
  rowCount: ctx.data.length,
});

const clean = asyncHandler(async (req, res) => {
  const { columns, data } = await getWorkingSet(req);

  const ops = Array.isArray(req.body.ops)
    ? req.body.ops
    : [];

  if (!ops.length) {
    throw new AppError(
      "Select at least one cleaning option.",
      400
    );
  }

  const rules = ops.map((o) => ({
    ...o,
    type: "clean",
  }));

  res.json(
    result(
      engine.runRules(
        columns,
        data,
        rules
      )
    )
  );
});

const validate = asyncHandler(async (req, res) => {
  const { columns, data } = await getWorkingSet(req);

  const checks =
    Array.isArray(req.body.checks) &&
    req.body.checks.length
      ? req.body.checks
      : [{ check: "missing" }];

  const rules = checks.map((c) => ({
    ...c,
    type: "validate",
  }));

  const ctx = engine.runRules(
    columns,
    data,
    rules
  );

  res.json({
    issues: ctx.issues,
    messages: ctx.messages,
    rowCount: data.length,
  });
});

const calculate = asyncHandler(async (req, res) => {
  const { columns, data } =
    await getWorkingSet(req);

  res.json(
    result(
      engine.runRules(
        columns,
        data,
        req.body.rules
      )
    )
  );
});

const command = asyncHandler(async (req, res) => {
  const { columns, data } =
    await getWorkingSet(req);

  const rules = engine.parseCommand(
    req.body.text,
    columns
  );

  if (req.body.preview) {
    return res.json({
      rules,
      steps: rules.map(
        engine.describeRule
      ),
    });
  }

  res.json({
    rules,
    steps: rules.map(
      engine.describeRule
    ),
    ...result(
      engine.runRules(
        columns,
        data,
        rules
      )
    ),
  });
});

const exportFile = asyncHandler(async (req, res) => {
  const {
    file,
    columns,
    data,
  } = await getWorkingSet(req);

  const format =
    req.body.format === "csv"
      ? "csv"
      : "xlsx";

  const out = buildFile(
    columns,
    data,
    format
  );

  const base = file.fileName.replace(
    /\.[^.]+$/,
    ""
  );

  const outputFile =
    `${base}_processed.${out.ext}`;

  await ProcessingHistory.create({
    userId: req.user.id,
    fileId: file._id,
    kind: "export",
    fileName: file.fileName,
    automationName:
      `Export (${out.ext.toUpperCase()})`,
    status: "Completed",
    rowsProcessed: data.length,
    outputFile,
    outputBuffer: out.buffer,
  });

  res.set({
    "Content-Type": out.mime,
    "Content-Disposition":
      `attachment; filename="${encodeURIComponent(
        outputFile
      )}"`,
    "Access-Control-Expose-Headers":
      "Content-Disposition",
  });

  res.send(out.buffer);
});

const supported = (_req, res) => {
  res.json({
    commands: engine.SUPPORTED_COMMANDS,
  });
};

export {
  clean,
  validate,
  calculate,
  command,
  exportFile,
  supported,
};