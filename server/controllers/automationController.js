// const Automation = require('../models/Automation');
// const ProcessingHistory = require('../models/ProcessingHistory');
// const AppError = require('../utils/AppError');
// const asyncHandler = require('../utils/asyncHandler');
// const engine = require('../services/engine');
// const { getOwnedFile, persistData } = require('../services/fileAccess');
// const { buildFile } = require('../services/excelService');

// const owned = async (req) => {
//   const a = await Automation.findOne({ _id: req.params.id, userId: req.user.id });
//   if (!a) throw new AppError('Automation not found.', 404);
//   return a;
// };
// const payload = (body) => {
//   const name = String(body.name || '').trim();
//   if (!name) throw new AppError('Please enter a name for this automation.', 400);
//   engine.assertRules(body.rules);
//   return { name: name.slice(0, 120), description: String(body.description || '').slice(0, 500), rules: body.rules };
// };

// exports.create = asyncHandler(async (req, res) => {
//   res.status(201).json({ automation: await Automation.create({ ...payload(req.body), userId: req.user.id }) });
// });
// exports.list = asyncHandler(async (req, res) => {
//   res.json({ automations: await Automation.find({ userId: req.user.id }).sort({ updatedAt: -1 }) });
// });
// exports.update = asyncHandler(async (req, res) => {
//   const a = await owned(req);
//   Object.assign(a, payload(req.body));
//   await a.save();
//   res.json({ automation: a });
// });
// exports.remove = asyncHandler(async (req, res) => {
//   await (await owned(req)).deleteOne();
//   res.json({ message: 'Automation deleted.' });
// });
// exports.duplicate = asyncHandler(async (req, res) => {
//   const a = await owned(req);
//   const copy = await Automation.create({ userId: req.user.id, name: `${a.name} (copy)`.slice(0, 120), description: a.description, rules: a.rules });
//   res.status(201).json({ automation: copy });
// });

// exports.run = asyncHandler(async (req, res) => {
//   const automation = await owned(req);
//   const file = await getOwnedFile(req.user.id, req.body.fileId, true);
//   const history = await ProcessingHistory.create({
//     userId: req.user.id, fileId: file._id, automationId: automation._id, kind: 'automation',
//     fileName: file.fileName, automationName: automation.name, status: 'Processing',
//   });
//   try {
//     const ctx = engine.runRules(file.columns, file.data || [], automation.rules);
//     const out = buildFile(ctx.columns, ctx.data, 'xlsx');
//     await persistData(file, ctx.columns, ctx.data, 'Completed');
//     Object.assign(history, {
//       status: 'Completed', rowsProcessed: ctx.data.length, outputFile: `${file.fileName.replace(/\.[^.]+$/, '')}_${automation.name.replace(/\W+/g, '_')}.xlsx`,
//       outputBuffer: out.buffer, details: { steps: automation.rules.map(engine.describeRule), messages: ctx.messages, results: ctx.results, issueCount: ctx.issues.length },
//     });
//     await history.save();
//     res.json({ historyId: history._id, columns: ctx.columns, data: ctx.data, messages: ctx.messages, results: ctx.results, issues: ctx.issues, rowCount: ctx.data.length });
//   } catch (err) {
//     history.status = 'Failed';
//     history.details = { error: err.isOperational ? err.message : 'Unexpected error while processing.' };
//     await history.save();
//     file.status = 'Failed';
//     await file.save();
//     throw err;
//   }
// });
import Automation from "../models/Automation.js";
import ProcessingHistory from "../models/ProcessingHistory.js";

import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

import * as engine from "../services/engine.js";

import {
  getOwnedFile,
  persistData,
} from "../services/fileAccess.js";

import { buildFile } from "../services/excelService.js";

const owned = async (req) => {
  const a = await Automation.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!a) {
    throw new AppError(
      "Automation not found.",
      404
    );
  }

  return a;
};

const payload = (body) => {
  const name = String(body.name || "").trim();

  if (!name) {
    throw new AppError(
      "Please enter a name for this automation.",
      400
    );
  }

  engine.assertRules(body.rules);

  return {
    name: name.slice(0, 120),
    description: String(
      body.description || ""
    ).slice(0, 500),
    rules: body.rules,
  };
};

const create = asyncHandler(async (req, res) => {
  const automation = await Automation.create({
    ...payload(req.body),
    userId: req.user.id,
  });

  res.status(201).json({
    automation,
  });
});

const list = asyncHandler(async (req, res) => {
  const automations = await Automation.find({
    userId: req.user.id,
  }).sort({
    updatedAt: -1,
  });

  res.json({
    automations,
  });
});

const update = asyncHandler(async (req, res) => {
  const a = await owned(req);

  Object.assign(a, payload(req.body));

  await a.save();

  res.json({
    automation: a,
  });
});

const remove = asyncHandler(async (req, res) => {
  const a = await owned(req);

  await a.deleteOne();

  res.json({
    message: "Automation deleted.",
  });
});

const duplicate = asyncHandler(async (req, res) => {
  const a = await owned(req);

  const copy = await Automation.create({
    userId: req.user.id,
    name: `${a.name} (copy)`.slice(0, 120),
    description: a.description,
    rules: a.rules,
  });

  res.status(201).json({
    automation: copy,
  });
});

const run = asyncHandler(async (req, res) => {
  const automation = await owned(req);

  const file = await getOwnedFile(
    req.user.id,
    req.body.fileId,
    true
  );

  const history = await ProcessingHistory.create({
    userId: req.user.id,
    fileId: file._id,
    automationId: automation._id,
    kind: "automation",
    fileName: file.fileName,
    automationName: automation.name,
    status: "Processing",
  });

  try {
    const ctx = engine.runRules(
      file.columns,
      file.data || [],
      automation.rules
    );

    const out = buildFile(
      ctx.columns,
      ctx.data,
      "xlsx"
    );

    await persistData(
      file,
      ctx.columns,
      ctx.data,
      "Completed"
    );

    Object.assign(history, {
      status: "Completed",

      rowsProcessed: ctx.data.length,

      outputFile: `${file.fileName.replace(
        /\.[^.]+$/,
        ""
      )}_${automation.name.replace(
        /\W+/g,
        "_"
      )}.xlsx`,

      outputBuffer: out.buffer,

      details: {
        steps: automation.rules.map(
          engine.describeRule
        ),

        messages: ctx.messages,

        results: ctx.results,

        issueCount: ctx.issues.length,
      },
    });

    await history.save();

    res.json({
      historyId: history._id,
      columns: ctx.columns,
      data: ctx.data,
      messages: ctx.messages,
      results: ctx.results,
      issues: ctx.issues,
      rowCount: ctx.data.length,
    });
  } catch (err) {
    history.status = "Failed";

    history.details = {
      error: err.isOperational
        ? err.message
        : "Unexpected error while processing.",
    };

    await history.save();

    file.status = "Failed";

    await file.save();

    throw err;
  }
});

export {
  create,
  list,
  update,
  remove,
  duplicate,
  run,
};