// const XLSX = require('xlsx');
// const path = require('path');
// const AppError = require('../utils/AppError');
// const { sanitizeName, isBlank } = require('./engine');

// const MAX_ROWS = 50000;

// function cellValue(v) {
//   if (v instanceof Date) return isNaN(v) ? '' : v.toISOString().slice(0, 10);
//   return v === null || v === undefined ? '' : v;
// }

// /** Read the first sheet of an uploaded workbook into { sheets, columns, data }. */
// function parseBuffer(buffer, originalName) {
//   let wb;
//   try {
//     wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
//   } catch {
//     throw new AppError('Please upload a valid Excel or CSV file.', 400);
//   }
//   const sheets = wb.SheetNames;
//   if (!sheets.length) throw new AppError('The uploaded file does not contain usable data.', 400);
//   const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sheets[0]], { header: 1, defval: '', raw: true });
//   const rows = aoa.filter((r) => r.some((c) => !isBlank(c)));
//   if (rows.length < 2) throw new AppError('The uploaded file does not contain usable data.', 400);
//   if (rows.length - 1 > MAX_ROWS) throw new AppError(`This file has too many rows. The limit is ${MAX_ROWS}.`, 400);

//   const seen = new Map();
//   const columns = rows[0].map((h, i) => {
//     let name = sanitizeName(cellValue(h)) || `Column ${i + 1}`;
//     const n = seen.get(name) || 0;
//     seen.set(name, n + 1);
//     return n ? `${name}_${n + 1}` : name;
//   });
//   const data = rows.slice(1).map((r) => Object.fromEntries(columns.map((c, i) => [c, cellValue(r[i])])));
//   return { sheets, columns, data, fileType: path.extname(originalName).slice(1).toLowerCase() };
// }

// function toSheet(columns, data) {
//   return XLSX.utils.json_to_sheet(data, { header: columns });
// }

// function buildFile(columns, data, format = 'xlsx') {
//   const ws = toSheet(columns, data);
//   if (format === 'csv') return { buffer: Buffer.from(XLSX.utils.sheet_to_csv(ws), 'utf8'), mime: 'text/csv', ext: 'csv' };
//   const wb = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(wb, ws, 'Processed Data');
//   return { buffer: XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' };
// }

// function buildReportFile(report) {
//   const wb = XLSX.utils.book_new();
//   const summary = [['Metric', 'Value'], ...report.metrics.map((m) => [m.label, m.value])];
//   XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'Summary');
//   report.tables.forEach((t, i) => {
//     XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(t.rows), (t.title || `Table ${i + 1}`).slice(0, 31).replace(/[\\/?*[\]:]/g, ''));
//   });
//   return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
// }

// module.exports = { parseBuffer, buildFile, buildReportFile };
import XLSX from "xlsx";
import path from "path";

import AppError from "../utils/AppError.js";

import {
  sanitizeName,
  isBlank,
} from "./engine.js";

const MAX_ROWS = 50000;

function cellValue(v) {
  if (v instanceof Date) {
    return isNaN(v)
      ? ""
      : v.toISOString().slice(0, 10);
  }

  return v === null || v === undefined
    ? ""
    : v;
}

/**
 * Read the first sheet of an uploaded workbook
 * into { sheets, columns, data }.
 */
function parseBuffer(buffer, originalName) {
  let wb;

  try {
    wb = XLSX.read(buffer, {
      type: "buffer",
      cellDates: true,
    });
  } catch {
    throw new AppError(
      "Please upload a valid Excel or CSV file.",
      400
    );
  }

  const sheets = wb.SheetNames;

  if (!sheets.length) {
    throw new AppError(
      "The uploaded file does not contain usable data.",
      400
    );
  }

  const aoa = XLSX.utils.sheet_to_json(
    wb.Sheets[sheets[0]],
    {
      header: 1,
      defval: "",
      raw: true,
    }
  );

  const rows = aoa.filter((r) =>
    r.some((c) => !isBlank(c))
  );

  if (rows.length < 2) {
    throw new AppError(
      "The uploaded file does not contain usable data.",
      400
    );
  }

  if (rows.length - 1 > MAX_ROWS) {
    throw new AppError(
      `This file has too many rows. The limit is ${MAX_ROWS}.`,
      400
    );
  }

  const seen = new Map();

  const columns = rows[0].map((h, i) => {
    let name =
      sanitizeName(cellValue(h)) ||
      `Column ${i + 1}`;

    const n = seen.get(name) || 0;

    seen.set(name, n + 1);

    return n
      ? `${name}_${n + 1}`
      : name;
  });

  const data = rows
    .slice(1)
    .map((r) =>
      Object.fromEntries(
        columns.map((c, i) => [
          c,
          cellValue(r[i]),
        ])
      )
    );

  return {
    sheets,
    columns,
    data,
    fileType: path
      .extname(originalName)
      .slice(1)
      .toLowerCase(),
  };
}

function toSheet(columns, data) {
  return XLSX.utils.json_to_sheet(data, {
    header: columns,
  });
}

function buildFile(
  columns,
  data,
  format = "xlsx"
) {
  const ws = toSheet(columns, data);

  if (format === "csv") {
    return {
      buffer: Buffer.from(
        XLSX.utils.sheet_to_csv(ws),
        "utf8"
      ),
      mime: "text/csv",
      ext: "csv",
    };
  }

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Processed Data"
  );

  return {
    buffer: XLSX.write(wb, {
      type: "buffer",
      bookType: "xlsx",
    }),
    mime:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: "xlsx",
  };
}

function buildReportFile(report) {
  const wb = XLSX.utils.book_new();

  const summary = [
    ["Metric", "Value"],
    ...report.metrics.map((m) => [
      m.label,
      m.value,
    ]),
  ];

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summary),
    "Summary"
  );

  report.tables.forEach((t, i) => {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(t.rows),
      (
        t.title ||
        `Table ${i + 1}`
      )
        .slice(0, 31)
        .replace(/[\\/?*[\]:]/g, "")
    );
  });

  return XLSX.write(wb, {
    type: "buffer",
    bookType: "xlsx",
  });
}

export {
  parseBuffer,
  buildFile,
  buildReportFile,
};