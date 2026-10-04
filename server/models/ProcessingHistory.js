// const mongoose = require('mongoose');
// const schema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
//   fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExcelFile' },
//   automationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Automation' },
//   kind: { type: String, enum: ['upload', 'automation', 'report', 'export'], default: 'automation' },
//   fileName: String,
//   automationName: String,
//   status: { type: String, enum: ['Uploaded', 'Processing', 'Completed', 'Failed'], default: 'Processing' },
//   rowsProcessed: { type: Number, default: 0 },
//   outputFile: String,
//   outputBuffer: { type: Buffer, select: false },
//   details: mongoose.Schema.Types.Mixed,
//   createdAt: { type: Date, default: Date.now },
// });
// module.exports = mongoose.model('ProcessingHistory', schema);
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExcelFile",
  },

  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Automation",
  },

  kind: {
    type: String,
    enum: [
      "upload",
      "automation",
      "report",
      "export",
    ],
    default: "automation",
  },

  fileName: String,

  automationName: String,

  status: {
    type: String,
    enum: [
      "Uploaded",
      "Processing",
      "Completed",
      "Failed",
    ],
    default: "Processing",
  },

  rowsProcessed: {
    type: Number,
    default: 0,
  },

  outputFile: String,

  outputBuffer: {
    type: Buffer,
    select: false,
  },

  details: mongoose.Schema.Types.Mixed,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProcessingHistory = mongoose.model(
  "ProcessingHistory",
  schema
);

export default ProcessingHistory;