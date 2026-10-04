// /**
//  * ExcelFlow automation engine.
//  * Rules are plain JSON objects interpreted by a fixed set of handlers.
//  * Nothing here evaluates user-supplied code.
//  */
// const AppError = require('../utils/AppError');

// const RULE_TYPES = ['arithmetic', 'stat', 'text', 'if', 'date', 'round', 'dedupe', 'filter', 'clean', 'validate'];
// const MAX_ISSUES = 1000;

// // ---------- helpers ----------
// const norm = (s) => String(s).toLowerCase().replace(/[\s_\-]+/g, '');
// const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';
// const up = (s) => String(s || '').toUpperCase();
// const sanitizeName = (n) => String(n ?? '').replace(/[.$]/g, '_').trim();

// function resolveColumn(name, columns) {
//   if (name === undefined || name === null || name === '') return null;
//   if (columns.includes(name)) return name;
//   const n = norm(name);
//   return columns.find((c) => norm(c) === n) || null;
// }

// function toNumber(v) {
//   if (typeof v === 'number') return Number.isFinite(v) ? v : NaN;
//   if (isBlank(v)) return NaN;
//   const s = String(v).replace(/[,\s₹$€£]/g, '');
//   return /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s) ? Number(s) : NaN;
// }

// const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// /**
//  * Parse common date formats into ISO yyyy-mm-dd, or null.
//  * `order` resolves ambiguous values like 01/10/2026 (DMY = 1 Oct, MDY = 10 Jan).
//  * If the chosen order produces an impossible date (e.g. 25/12/2026 under MDY),
//  * the other order is tried, because only one reading can be valid.
//  */
// function parseDate(v, order = 'DMY') {
//   if (isBlank(v)) return null;
//   if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 10);
//   const s = String(v).trim();
//   const build = (y, m, d) => {
//     const dt = new Date(Date.UTC(y, m - 1, d));
//     return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d ? dt.toISOString().slice(0, 10) : null;
//   };
//   let mt = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/);
//   if (mt) return build(+mt[1], +mt[2], +mt[3]);
//   mt = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
//   if (mt) {
//     const a = +mt[1], b = +mt[2], y = +mt[3];
//     const first = order === 'MDY' ? build(y, a, b) : build(y, b, a);
//     return first || (order === 'MDY' ? build(y, b, a) : build(y, a, b));
//   }
//   return null;
// }

// const titleCase = (s) => s.toLowerCase().replace(/(^|[\s\-'])(\p{L})/gu, (_m, a, b) => a + b.toUpperCase());

// function compare(a, op, b) {
//   const na = toNumber(a), nb = toNumber(b);
//   const numeric = !isNaN(na) && !isNaN(nb);
//   const x = numeric ? na : String(a ?? '').trim().toLowerCase();
//   const y = numeric ? nb : String(b ?? '').trim().toLowerCase();
//   switch (op) {
//     case '=': return x === y;
//     case '!=': return x !== y;
//     case '>': return x > y;
//     case '<': return x < y;
//     case '>=': return x >= y;
//     case '<=': return x <= y;
//     case 'contains': return String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase());
//     default: throw new AppError('Unsupported comparison.', 400);
//   }
// }

// function setColumn(ctx, name, values) {
//   const col = sanitizeName(name);
//   if (!col) throw new AppError('Please provide a name for the output column.', 400);
//   if (!ctx.columns.includes(col)) ctx.columns.push(col);
//   ctx.data = ctx.data.map((r, i) => ({ ...r, [col]: values[i] }));
// }

// const need = (v, label) => { if (isBlank(v)) throw new AppError(`Missing ${label}.`, 400); return v; };

// function dedupe(ctx, cols) {
//   const seen = new Set();
//   const before = ctx.data.length;
//   ctx.data = ctx.data.filter((r) => {
//     const vals = cols.map((c) => String(r[c] ?? '').trim().toLowerCase());
//     if (cols.length && vals.every((v) => v === '') && cols.length < ctx.columns.length) return true; // blank keys are not duplicates
//     const key = JSON.stringify(vals);
//     if (seen.has(key)) return false;
//     seen.add(key);
//     return true;
//   });
//   return before - ctx.data.length;
// }

// // ---------- handlers ----------
// const handlers = {
//   arithmetic(rule, ctx) {
//     need(rule.left, 'first column');
//     const { op } = rule;
//     if (!['+', '-', '*', '/', '%'].includes(op)) throw new AppError('Unsupported operation.', 400);
//     const constant = toNumber(rule.rightValue);
//     if (!rule.right && isNaN(constant)) throw new AppError('Select a second column or enter a number.', 400);
//     const values = ctx.data.map((r) => {
//       const a = toNumber(r[rule.left]);
//       const b = rule.right ? toNumber(r[rule.right]) : constant;
//       if (isNaN(a) || isNaN(b)) return '';
//       let res;
//       if (op === '+') res = a + b;
//       else if (op === '-') res = a - b;
//       else if (op === '*') res = a * b;
//       else if (op === '/') res = b === 0 ? '' : a / b;
//       else res = (a * b) / 100; // "b percent of a"
//       return res === '' ? '' : Math.round(res * 1e6) / 1e6;
//     });
//     setColumn(ctx, rule.output, values);
//   },

//   stat(rule, ctx) {
//     need(rule.column, 'column');
//     const fn = up(rule.fn);
//     const vals = ctx.data.map((r) => r[rule.column]);
//     const nums = vals.map(toNumber).filter((n) => !isNaN(n));
//     const sum = nums.reduce((a, b) => a + b, 0);
//     let v;
//     if (fn === 'SUM') v = sum;
//     else if (fn === 'AVERAGE') v = nums.length ? sum / nums.length : '';
//     else if (fn === 'COUNT') v = vals.filter((x) => !isBlank(x)).length;
//     else if (fn === 'MIN') v = nums.length ? nums.reduce((a, b) => Math.min(a, b)) : '';
//     else if (fn === 'MAX') v = nums.length ? nums.reduce((a, b) => Math.max(a, b)) : '';
//     else throw new AppError('Unsupported statistic.', 400);
//     if (typeof v === 'number') v = Math.round(v * 100) / 100;
//     if (!isBlank(rule.output)) setColumn(ctx, rule.output, ctx.data.map(() => v));
//     else ctx.results.push({ label: `${fn} of ${rule.column}`, value: v });
//   },

//   text(rule, ctx) {
//     const fn = up(rule.fn);
//     if (fn === 'CONCAT') {
//       const cols = need(rule.columns?.length ? rule.columns : null, 'columns');
//       const sep = rule.separator ?? ' ';
//       return setColumn(ctx, need(rule.output, 'output name'), ctx.data.map((r) => cols.map((c) => r[c] ?? '').join(sep).trim()));
//     }
//     need(rule.column, 'column');
//     const fns = { TRIM: (s) => s.trim(), UPPER: (s) => s.toUpperCase(), LOWER: (s) => s.toLowerCase(), PROPER: titleCase };
//     if (!fns[fn]) throw new AppError('Unsupported text operation.', 400);
//     setColumn(ctx, isBlank(rule.output) ? rule.column : rule.output, ctx.data.map((r) => (typeof r[rule.column] === 'string' ? fns[fn](r[rule.column]) : r[rule.column])));
//   },

//   if(rule, ctx) {
//     need(rule.column, 'column');
//     compare('', rule.operator, ''); // validates operator
//     const t = rule.thenValue ?? '', e = rule.elseValue ?? '';
//     setColumn(ctx, need(rule.output, 'output name'), ctx.data.map((r) => (compare(r[rule.column], rule.operator, rule.value) ? t : e)));
//   },

//   date(rule, ctx) {
//     need(rule.column, 'date column');
//     const fn = up(rule.fn);
//     const order = rule.order === 'MDY' ? 'MDY' : 'DMY';
//     if (!['DIFF', 'ADD_DAYS', 'YEAR', 'MONTH', 'DAY'].includes(fn)) throw new AppError('Unsupported date operation.', 400);
//     const days = toNumber(rule.days);
//     if (fn === 'ADD_DAYS' && isNaN(days)) throw new AppError('Enter the number of days to add.', 400);
//     const today = new Date().toISOString().slice(0, 10);
//     const values = ctx.data.map((r) => {
//       const d = parseDate(r[rule.column], order);
//       if (!d) return '';
//       const dt = new Date(`${d}T00:00:00Z`);
//       if (fn === 'YEAR') return dt.getUTCFullYear();
//       if (fn === 'MONTH') return dt.getUTCMonth() + 1;
//       if (fn === 'DAY') return dt.getUTCDate();
//       if (fn === 'ADD_DAYS') { dt.setUTCDate(dt.getUTCDate() + days); return dt.toISOString().slice(0, 10); }
//       const end = rule.column2 && up(rule.column2) !== 'TODAY' ? parseDate(r[rule.column2], order) : today;
//       return end ? Math.round((new Date(`${end}T00:00:00Z`) - dt) / 86400000) : '';
//     });
//     setColumn(ctx, need(rule.output, 'output name'), values);
//   },

//   round(rule, ctx) {
//     need(rule.column, 'column');
//     const fn = up(rule.fn);
//     const digits = Number.isInteger(+rule.digits) ? +rule.digits : 0;
//     const f = 10 ** digits;
//     const ops = {
//       ROUND: (x) => Math.round(x * f) / f,
//       ROUNDUP: (x) => (Math.sign(x) * Math.ceil(Math.abs(Number((x * f).toFixed(9))))) / f,
//       ROUNDDOWN: (x) => (Math.sign(x) * Math.floor(Math.abs(Number((x * f).toFixed(9))))) / f,
//     };
//     if (!ops[fn]) throw new AppError('Unsupported rounding operation.', 400);
//     setColumn(ctx, isBlank(rule.output) ? rule.column : rule.output, ctx.data.map((r) => { const n = toNumber(r[rule.column]); return isNaN(n) ? '' : ops[fn](n); }));
//   },

//   dedupe(rule, ctx) {
//     const n = dedupe(ctx, rule.columns?.length ? rule.columns : ctx.columns);
//     ctx.messages.push(`Removed ${n} duplicate row${n === 1 ? '' : 's'}.`);
//   },

//   filter(rule, ctx) {
//     need(rule.column, 'column');
//     const before = ctx.data.length;
//     ctx.data = ctx.data.filter((r) => compare(r[rule.column], rule.operator, rule.value));
//     ctx.messages.push(`Kept ${ctx.data.length} of ${before} rows where ${rule.column} ${rule.operator} ${rule.value}.`);
//   },

//   clean(rule, ctx) {
//     const targets = rule.columns?.length ? rule.columns : ctx.columns;
//     let count = 0;
//     const mapCells = (fn) => {
//       ctx.data = ctx.data.map((r) => {
//         const out = { ...r };
//         targets.forEach((c) => { const nv = fn(r[c]); if (nv !== r[c]) { out[c] = nv; count++; } });
//         return out;
//       });
//     };
//     switch (rule.op) {
//       case 'removeDuplicates': {
//         const n = dedupe(ctx, ctx.columns);
//         return ctx.messages.push(`Removed ${n} duplicate row${n === 1 ? '' : 's'}.`);
//       }
//       case 'removeEmptyRows': {
//         const before = ctx.data.length;
//         ctx.data = ctx.data.filter((r) => ctx.columns.some((c) => !isBlank(r[c])));
//         return ctx.messages.push(`Removed ${before - ctx.data.length} empty row(s).`);
//       }
//       case 'removeEmptyColumns': {
//         const empty = ctx.columns.filter((c) => ctx.data.every((r) => isBlank(r[c])));
//         ctx.columns = ctx.columns.filter((c) => !empty.includes(c));
//         ctx.data = ctx.data.map((r) => { const o = { ...r }; empty.forEach((c) => delete o[c]); return o; });
//         return ctx.messages.push(empty.length ? `Removed empty column(s): ${empty.join(', ')}.` : 'No empty columns found.');
//       }
//       case 'trim': mapCells((v) => (typeof v === 'string' ? v.trim() : v)); return ctx.messages.push(`Trimmed ${count} cell(s).`);
//       case 'case': {
//         const fns = { upper: (s) => s.toUpperCase(), lower: (s) => s.toLowerCase(), title: titleCase };
//         if (!fns[rule.mode]) throw new AppError('Unsupported text format.', 400);
//         mapCells((v) => (typeof v === 'string' ? fns[rule.mode](v) : v));
//         return ctx.messages.push(`Standardized ${count} cell(s) to ${rule.mode} case.`);
//       }
//       case 'toNumber':
//         mapCells((v) => { if (typeof v !== 'string') return v; const n = toNumber(v); return isNaN(n) ? v : n; });
//         return ctx.messages.push(`Converted ${count} text value(s) to numbers.`);
//       case 'normalizeDates': {
//         let skipped = 0;
//         mapCells((v) => { if (isBlank(v)) return v; const d = parseDate(v, rule.order === 'MDY' ? 'MDY' : 'DMY'); if (!d) { skipped++; return v; } return d; });
//         return ctx.messages.push(`Normalized ${count} date(s) to YYYY-MM-DD${skipped ? `; ${skipped} value(s) were not recognised as dates and were left unchanged` : ''}.`);
//       }
//       default: throw new AppError('Unsupported cleaning operation.', 400);
//     }
//   },

//   validate(rule, ctx) {
//     const check = rule.check;
//     const cols = rule.column ? [rule.column] : ctx.columns;
//     const push = (row, column, value, message) => {
//       if (ctx.issues.length < MAX_ISSUES) ctx.issues.push({ row, column, value: value ?? '', check, message });
//     };
//     if (['missing', 'required'].includes(check)) {
//       cols.forEach((c) => ctx.data.forEach((r, i) => { if (isBlank(r[c])) push(i, c, '', `${c} is empty`); }));
//     } else if (check === 'email') {
//       ctx.data.forEach((r, i) => { const v = r[rule.column]; if (!isBlank(v) && !EMAIL_RE.test(String(v).trim())) push(i, rule.column, v, 'Invalid email address'); });
//     } else if (check === 'number') {
//       ctx.data.forEach((r, i) => { const v = r[rule.column]; if (!isBlank(v) && isNaN(toNumber(v))) push(i, rule.column, v, 'Not a valid number'); });
//     } else if (check === 'date') {
//       ctx.data.forEach((r, i) => { const v = r[rule.column]; if (!isBlank(v) && !parseDate(v, rule.order)) push(i, rule.column, v, 'Not a valid date'); });
//     } else if (check === 'unique') {
//       const counts = new Map();
//       ctx.data.forEach((r) => { const k = String(r[rule.column] ?? '').trim().toLowerCase(); if (k) counts.set(k, (counts.get(k) || 0) + 1); });
//       ctx.data.forEach((r, i) => { const k = String(r[rule.column] ?? '').trim().toLowerCase(); if (k && counts.get(k) > 1) push(i, rule.column, r[rule.column], 'Duplicate value'); });
//     } else throw new AppError('Unsupported validation.', 400);
//     ctx.messages.push(`Validation (${check}${rule.column ? ` on ${rule.column}` : ''}) found ${ctx.issues.filter((x) => x.check === check).length} issue(s).`);
//   },
// };

// // ---------- rule execution ----------
// function resolveRule(rule, columns, step) {
//   const out = { ...rule };
//   const find = (v) => {
//     const c = resolveColumn(v, columns);
//     if (!c) throw new AppError(`Step ${step}: column "${v}" was not found in this dataset.`, 400);
//     return c;
//   };
//   ['left', 'right', 'column'].forEach((k) => { if (!isBlank(rule[k])) out[k] = find(rule[k]); });
//   if (!isBlank(rule.column2) && up(rule.column2) !== 'TODAY') out.column2 = find(rule.column2);
//   if (Array.isArray(rule.columns)) out.columns = rule.columns.map(find);
//   return out;
// }

// function assertRules(rules) {
//   if (!Array.isArray(rules) || rules.length === 0 || rules.length > 50) throw new AppError('Please add between 1 and 50 steps.', 400);
//   rules.forEach((r, i) => {
//     if (!r || typeof r !== 'object' || !RULE_TYPES.includes(r.type)) throw new AppError(`Step ${i + 1} is not a supported operation.`, 400);
//   });
// }

// function runRules(columns, data, rules) {
//   assertRules(rules);
//   const ctx = { columns: [...columns], data: data.map((r) => ({ ...r })), messages: [], results: [], issues: [] };
//   rules.forEach((raw, i) => {
//     const step = i + 1;
//     const rule = resolveRule(raw, ctx.columns, step);
//     try {
//       handlers[rule.type](rule, ctx);
//     } catch (err) {
//       if (err.isOperational) throw new AppError(`Step ${step}: ${err.message}`, 400);
//       throw new AppError(`Step ${step}: Unable to calculate this rule. Please check the selected columns.`, 400);
//     }
//   });
//   return ctx;
// }

// // ---------- descriptions ----------
// function describeRule(r) {
//   const sym = { '*': '×', '/': '÷' };
//   switch (r.type) {
//     case 'arithmetic': return r.op === '%'
//       ? `${r.left} × ${r.right || r.rightValue}% → ${r.output}`
//       : `${r.left} ${sym[r.op] || r.op} ${r.right || r.rightValue} → ${r.output}`;
//     case 'stat': return `${up(r.fn)}(${r.column}) → ${r.output || 'result'}`;
//     case 'text': return `${up(r.fn)}(${(r.columns || [r.column]).join(', ')}) → ${r.output || r.column}`;
//     case 'if': return `IF ${r.column} ${r.operator} "${r.value}" THEN "${r.thenValue}" ELSE "${r.elseValue ?? ''}" → ${r.output}`;
//     case 'date': return `${up(r.fn)}(${r.column}${r.column2 ? `, ${r.column2}` : ''}${r.days ? `, ${r.days}` : ''}) → ${r.output}`;
//     case 'round': return `${up(r.fn)}(${r.column}, ${r.digits ?? 0}) → ${r.output || r.column}`;
//     case 'dedupe': return `Remove duplicates by ${r.columns?.length ? r.columns.join(', ') : 'all columns'}`;
//     case 'filter': return `Keep rows where ${r.column} ${r.operator} ${r.value}`;
//     case 'clean': return `Clean: ${r.op}${r.mode ? ` (${r.mode})` : ''}`;
//     case 'validate': return `Validate ${r.check}${r.column ? ` on ${r.column}` : ''}`;
//     default: return r.type;
//   }
// }

// // ---------- natural-language commands ----------
// const SUPPORTED_COMMANDS = [
//   'Calculate total salary using salary and bonus (also: minus, times, divided by)',
//   'Create annual salary from total salary',
//   'Find average / sum / minimum / maximum / count of <column>',
//   'Remove duplicate <column>',
//   'Remove empty rows · Trim spaces',
//   'Find rows with <column> greater than / less than / equal to <value>',
// ];

// function resolveLoose(name, columns) {
//   const base = name.trim();
//   const tries = [base, base.replace(/s$/, ''), base.replace(/ids$/, 'id'), base.replace(/^(the|all)\s+/, '')];
//   for (const t of tries) { const c = resolveColumn(t, columns); if (c) return c; }
//   return null;
// }

// function parseCommand(text, columns) {
//   const t = String(text || '').trim().replace(/[.?!]+$/, '');
//   if (!t) throw new AppError('Please type a command.', 400);
//   const l = t.toLowerCase();
//   const col = (name) => {
//     const c = resolveLoose(name, columns);
//     if (!c) throw new AppError(`I couldn't find a column called "${name.trim()}". Available columns: ${columns.join(', ')}.`, 400);
//     return c;
//   };
//   const opWords = { and: '+', plus: '+', minus: '-', times: '*', 'multiplied by': '*', 'divided by': '/' };
//   let m = l.match(/^(?:calculate|create|compute|add|make)\s+(.+?)\s+(?:using|from)\s+(.+?)\s+(and|plus|minus|times|multiplied by|divided by)\s+(.+)$/);
//   if (m) return [{ type: 'arithmetic', left: col(m[2]), op: opWords[m[3]], right: col(m[4]), output: titleCase(m[1]) }];

//   m = l.match(/^(?:calculate|create|compute|add|make)\s+(.+?)\s+from\s+(.+)$/);
//   if (m) {
//     if (/annual|yearly/.test(m[1])) return [{ type: 'arithmetic', left: col(m[2]), op: '*', rightValue: 12, output: titleCase(m[1]) }];
//     if (/monthly/.test(m[1])) return [{ type: 'arithmetic', left: col(m[2]), op: '/', rightValue: 12, output: titleCase(m[1]) }];
//   }

//   m = l.match(/^remove\s+duplicates?\s*(?:based on|by|on)?\s*(.*)$/);
//   if (m) return [{ type: 'dedupe', columns: m[1].trim() ? [col(m[1])] : [] }];
//   if (/^remove empty rows?$/.test(l)) return [{ type: 'clean', op: 'removeEmptyRows' }];
//   if (/^trim( spaces)?$/.test(l)) return [{ type: 'clean', op: 'trim' }];

//   m = l.match(/^(?:find|show|filter|get|list)\s+(?:\w+\s+)?(?:with|where)\s+(.+?)\s+(greater than or equal to|less than or equal to|greater than|more than|above|less than|below|not equal to|equal to|equals|contains|is|=|>=|<=|>|<)\s+(.+)$/);
//   if (m) {
//     const ops = { 'greater than or equal to': '>=', 'less than or equal to': '<=', 'greater than': '>', 'more than': '>', above: '>', 'less than': '<', below: '<', 'not equal to': '!=', 'equal to': '=', equals: '=', is: '=', '=': '=', contains: 'contains', '>': '>', '<': '<', '>=': '>=', '<=': '<=' };
//     return [{ type: 'filter', column: col(m[1]), operator: ops[m[2]], value: m[3].trim() }];
//   }

//   m = l.match(/^(?:find|calculate|get|what is|show)?\s*(?:the\s+)?(average|avg|sum|total|minimum|min|lowest|maximum|max|highest|count)\s+(?:of\s+)?(.+)$/);
//   if (m) {
//     const fn = { average: 'AVERAGE', avg: 'AVERAGE', sum: 'SUM', total: 'SUM', minimum: 'MIN', min: 'MIN', lowest: 'MIN', maximum: 'MAX', max: 'MAX', highest: 'MAX', count: 'COUNT' }[m[1]];
//     return [{ type: 'stat', fn, column: col(m[2]), output: '' }];
//   }

//   throw new AppError(`Sorry, I don't understand that command yet. Supported commands:\n• ${SUPPORTED_COMMANDS.join('\n• ')}`, 400);
// }

// module.exports = { runRules, assertRules, describeRule, parseCommand, parseDate, toNumber, isBlank, resolveColumn, sanitizeName, SUPPORTED_COMMANDS };
/**
 * ExcelFlow automation engine.
 * Rules are plain JSON objects interpreted by a fixed set of handlers.
 * Nothing here evaluates user-supplied code.
 */

import AppError from "../utils/AppError.js";

const RULE_TYPES = [
  "arithmetic",
  "stat",
  "text",
  "if",
  "date",
  "round",
  "dedupe",
  "filter",
  "clean",
  "validate",
];

const MAX_ISSUES = 1000;

// ---------- helpers ----------

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[\s_\-]+/g, "");

const isBlank = (v) =>
  v === null ||
  v === undefined ||
  String(v).trim() === "";

const up = (s) =>
  String(s || "").toUpperCase();

const sanitizeName = (n) =>
  String(n ?? "")
    .replace(/[.$]/g, "_")
    .trim();

function resolveColumn(name, columns) {
  if (
    name === undefined ||
    name === null ||
    name === ""
  ) {
    return null;
  }

  if (columns.includes(name)) {
    return name;
  }

  const n = norm(name);

  return (
    columns.find(
      (c) => norm(c) === n
    ) || null
  );
}

function toNumber(v) {
  if (typeof v === "number") {
    return Number.isFinite(v)
      ? v
      : NaN;
  }

  if (isBlank(v)) {
    return NaN;
  }

  const s = String(v).replace(
    /[,\s₹$€£]/g,
    ""
  );

  return /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(
    s
  )
    ? Number(s)
    : NaN;
}

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Parse common date formats into ISO yyyy-mm-dd, or null.
 * `order` resolves ambiguous values like 01/10/2026.
 * DMY = 1 Oct, MDY = 10 Jan.
 */
function parseDate(
  v,
  order = "DMY"
) {
  if (isBlank(v)) {
    return null;
  }

  if (v instanceof Date) {
    return isNaN(v)
      ? null
      : v.toISOString().slice(0, 10);
  }

  const s = String(v).trim();

  const build = (y, m, d) => {
    const dt = new Date(
      Date.UTC(y, m - 1, d)
    );

    return dt.getUTCFullYear() === y &&
      dt.getUTCMonth() === m - 1 &&
      dt.getUTCDate() === d
      ? dt.toISOString().slice(0, 10)
      : null;
  };

  let mt = s.match(
    /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/
  );

  if (mt) {
    return build(
      +mt[1],
      +mt[2],
      +mt[3]
    );
  }

  mt = s.match(
    /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/
  );

  if (mt) {
    const a = +mt[1];
    const b = +mt[2];
    const y = +mt[3];

    const first =
      order === "MDY"
        ? build(y, a, b)
        : build(y, b, a);

    return (
      first ||
      (order === "MDY"
        ? build(y, b, a)
        : build(y, a, b))
    );
  }

  return null;
}

const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(
      /(^|[\s\-'])(\p{L})/gu,
      (_m, a, b) =>
        a + b.toUpperCase()
    );

function compare(a, op, b) {
  const na = toNumber(a);
  const nb = toNumber(b);

  const numeric =
    !isNaN(na) &&
    !isNaN(nb);

  const x = numeric
    ? na
    : String(a ?? "")
        .trim()
        .toLowerCase();

  const y = numeric
    ? nb
    : String(b ?? "")
        .trim()
        .toLowerCase();

  switch (op) {
    case "=":
      return x === y;

    case "!=":
      return x !== y;

    case ">":
      return x > y;

    case "<":
      return x < y;

    case ">=":
      return x >= y;

    case "<=":
      return x <= y;

    case "contains":
      return String(a ?? "")
        .toLowerCase()
        .includes(
          String(b ?? "").toLowerCase()
        );

    default:
      throw new AppError(
        "Unsupported comparison.",
        400
      );
  }
}

function setColumn(
  ctx,
  name,
  values
) {
  const col = sanitizeName(name);

  if (!col) {
    throw new AppError(
      "Please provide a name for the output column.",
      400
    );
  }

  if (!ctx.columns.includes(col)) {
    ctx.columns.push(col);
  }

  ctx.data = ctx.data.map(
    (r, i) => ({
      ...r,
      [col]: values[i],
    })
  );
}

const need = (v, label) => {
  if (isBlank(v)) {
    throw new AppError(
      `Missing ${label}.`,
      400
    );
  }

  return v;
};

function dedupe(ctx, cols) {
  const seen = new Set();
  const before = ctx.data.length;

  ctx.data = ctx.data.filter(
    (r) => {
      const vals = cols.map(
        (c) =>
          String(
            r[c] ?? ""
          )
            .trim()
            .toLowerCase()
      );

      if (
        cols.length &&
        vals.every(
          (v) => v === ""
        ) &&
        cols.length <
          ctx.columns.length
      ) {
        return true;
      }

      const key =
        JSON.stringify(vals);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    }
  );

  return (
    before - ctx.data.length
  );
}

// ---------- handlers ----------

const handlers = {
  arithmetic(rule, ctx) {
    need(
      rule.left,
      "first column"
    );

    const { op } = rule;

    if (
      ![
        "+",
        "-",
        "*",
        "/",
        "%",
      ].includes(op)
    ) {
      throw new AppError(
        "Unsupported operation.",
        400
      );
    }

    const constant =
      toNumber(rule.rightValue);

    if (
      !rule.right &&
      isNaN(constant)
    ) {
      throw new AppError(
        "Select a second column or enter a number.",
        400
      );
    }

    const values = ctx.data.map(
      (r) => {
        const a = toNumber(
          r[rule.left]
        );

        const b = rule.right
          ? toNumber(
              r[rule.right]
            )
          : constant;

        if (
          isNaN(a) ||
          isNaN(b)
        ) {
          return "";
        }

        let res;

        if (op === "+") {
          res = a + b;
        } else if (op === "-") {
          res = a - b;
        } else if (op === "*") {
          res = a * b;
        } else if (op === "/") {
          res =
            b === 0
              ? ""
              : a / b;
        } else {
          res = (a * b) / 100;
        }

        return res === ""
          ? ""
          : Math.round(
              res * 1e6
            ) / 1e6;
      }
    );

    setColumn(
      ctx,
      rule.output,
      values
    );
  },

  stat(rule, ctx) {
    need(
      rule.column,
      "column"
    );

    const fn = up(rule.fn);

    const vals = ctx.data.map(
      (r) => r[rule.column]
    );

    const nums = vals
      .map(toNumber)
      .filter(
        (n) => !isNaN(n)
      );

    const sum = nums.reduce(
      (a, b) => a + b,
      0
    );

    let v;

    if (fn === "SUM") {
      v = sum;
    } else if (fn === "AVERAGE") {
      v = nums.length
        ? sum / nums.length
        : "";
    } else if (fn === "COUNT") {
      v = vals.filter(
        (x) => !isBlank(x)
      ).length;
    } else if (fn === "MIN") {
      v = nums.length
        ? nums.reduce(
            (a, b) =>
              Math.min(a, b)
          )
        : "";
    } else if (fn === "MAX") {
      v = nums.length
        ? nums.reduce(
            (a, b) =>
              Math.max(a, b)
          )
        : "";
    } else {
      throw new AppError(
        "Unsupported statistic.",
        400
      );
    }

    if (
      typeof v === "number"
    ) {
      v =
        Math.round(
          v * 100
        ) / 100;
    }

    if (!isBlank(rule.output)) {
      setColumn(
        ctx,
        rule.output,
        ctx.data.map(
          () => v
        )
      );
    } else {
      ctx.results.push({
        label: `${fn} of ${rule.column}`,
        value: v,
      });
    }
  },

  text(rule, ctx) {
    const fn = up(rule.fn);

    if (fn === "CONCAT") {
      const cols = need(
        rule.columns?.length
          ? rule.columns
          : null,
        "columns"
      );

      const sep =
        rule.separator ?? " ";

      return setColumn(
        ctx,
        need(
          rule.output,
          "output name"
        ),
        ctx.data.map(
          (r) =>
            cols
              .map(
                (c) =>
                  r[c] ?? ""
              )
              .join(sep)
              .trim()
        )
      );
    }

    need(
      rule.column,
      "column"
    );

    const fns = {
      TRIM: (s) =>
        s.trim(),

      UPPER: (s) =>
        s.toUpperCase(),

      LOWER: (s) =>
        s.toLowerCase(),

      PROPER: titleCase,
    };

    if (!fns[fn]) {
      throw new AppError(
        "Unsupported text operation.",
        400
      );
    }

    setColumn(
      ctx,
      isBlank(rule.output)
        ? rule.column
        : rule.output,
      ctx.data.map(
        (r) =>
          typeof r[
            rule.column
          ] === "string"
            ? fns[fn](
                r[rule.column]
              )
            : r[rule.column]
      )
    );
  },

  if(rule, ctx) {
    need(
      rule.column,
      "column"
    );

    compare(
      "",
      rule.operator,
      ""
    );

    const t =
      rule.thenValue ?? "";

    const e =
      rule.elseValue ?? "";

    setColumn(
      ctx,
      need(
        rule.output,
        "output name"
      ),
      ctx.data.map(
        (r) =>
          compare(
            r[rule.column],
            rule.operator,
            rule.value
          )
            ? t
            : e
      )
    );
  },

  date(rule, ctx) {
    need(
      rule.column,
      "date column"
    );

    const fn = up(rule.fn);

    const order =
      rule.order === "MDY"
        ? "MDY"
        : "DMY";

    if (
      ![
        "DIFF",
        "ADD_DAYS",
        "YEAR",
        "MONTH",
        "DAY",
      ].includes(fn)
    ) {
      throw new AppError(
        "Unsupported date operation.",
        400
      );
    }

    const days =
      toNumber(rule.days);

    if (
      fn === "ADD_DAYS" &&
      isNaN(days)
    ) {
      throw new AppError(
        "Enter the number of days to add.",
        400
      );
    }

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const values =
      ctx.data.map(
        (r) => {
          const d =
            parseDate(
              r[rule.column],
              order
            );

          if (!d) return "";

          const dt =
            new Date(
              `${d}T00:00:00Z`
            );

          if (fn === "YEAR") {
            return dt.getUTCFullYear();
          }

          if (fn === "MONTH") {
            return (
              dt.getUTCMonth() + 1
            );
          }

          if (fn === "DAY") {
            return dt.getUTCDate();
          }

          if (fn === "ADD_DAYS") {
            dt.setUTCDate(
              dt.getUTCDate() +
                days
            );

            return dt
              .toISOString()
              .slice(0, 10);
          }

          const end =
            rule.column2 &&
            up(rule.column2) !==
              "TODAY"
              ? parseDate(
                  r[rule.column2],
                  order
                )
              : today;

          return end
            ? Math.round(
                (new Date(
                  `${end}T00:00:00Z`
                ) -
                  dt) /
                  86400000
              )
            : "";
        }
      );

    setColumn(
      ctx,
      need(
        rule.output,
        "output name"
      ),
      values
    );
  },

  round(rule, ctx) {
    need(
      rule.column,
      "column"
    );

    const fn = up(rule.fn);

    const digits =
      Number.isInteger(
        +rule.digits
      )
        ? +rule.digits
        : 0;

    const f = 10 ** digits;

    const ops = {
      ROUND: (x) =>
        Math.round(
          x * f
        ) / f,

      ROUNDUP: (x) =>
        (Math.sign(x) *
          Math.ceil(
            Math.abs(
              Number(
                (
                  x * f
                ).toFixed(9)
              )
            )
          )) /
        f,

      ROUNDDOWN: (x) =>
        (Math.sign(x) *
          Math.floor(
            Math.abs(
              Number(
                (
                  x * f
                ).toFixed(9)
              )
            )
          )) /
        f,
    };

    if (!ops[fn]) {
      throw new AppError(
        "Unsupported rounding operation.",
        400
      );
    }

    setColumn(
      ctx,
      isBlank(rule.output)
        ? rule.column
        : rule.output,
      ctx.data.map(
        (r) => {
          const n =
            toNumber(
              r[rule.column]
            );

          return isNaN(n)
            ? ""
            : ops[fn](n);
        }
      )
    );
  },

  dedupe(rule, ctx) {
    const n = dedupe(
      ctx,
      rule.columns?.length
        ? rule.columns
        : ctx.columns
    );

    ctx.messages.push(
      `Removed ${n} duplicate row${
        n === 1 ? "" : "s"
      }.`
    );
  },

  filter(rule, ctx) {
    need(
      rule.column,
      "column"
    );

    const before =
      ctx.data.length;

    ctx.data =
      ctx.data.filter(
        (r) =>
          compare(
            r[rule.column],
            rule.operator,
            rule.value
          )
      );

    ctx.messages.push(
      `Kept ${ctx.data.length} of ${before} rows where ${rule.column} ${rule.operator} ${rule.value}.`
    );
  },

  clean(rule, ctx) {
    const targets =
      rule.columns?.length
        ? rule.columns
        : ctx.columns;

    let count = 0;

    const mapCells = (fn) => {
      ctx.data =
        ctx.data.map(
          (r) => {
            const out = {
              ...r,
            };

            targets.forEach(
              (c) => {
                const nv =
                  fn(r[c]);

                if (
                  nv !== r[c]
                ) {
                  out[c] = nv;
                  count++;
                }
              }
            );

            return out;
          }
        );
    };

    switch (rule.op) {
      case "removeDuplicates": {
        const n = dedupe(
          ctx,
          ctx.columns
        );

        return ctx.messages.push(
          `Removed ${n} duplicate row${
            n === 1
              ? ""
              : "s"
          }.`
        );
      }

      case "removeEmptyRows": {
        const before =
          ctx.data.length;

        ctx.data =
          ctx.data.filter(
            (r) =>
              ctx.columns.some(
                (c) =>
                  !isBlank(r[c])
              )
          );

        return ctx.messages.push(
          `Removed ${
            before -
            ctx.data.length
          } empty row(s).`
        );
      }

      case "removeEmptyColumns": {
        const empty =
          ctx.columns.filter(
            (c) =>
              ctx.data.every(
                (r) =>
                  isBlank(r[c])
              )
          );

        ctx.columns =
          ctx.columns.filter(
            (c) =>
              !empty.includes(c)
          );

        ctx.data =
          ctx.data.map(
            (r) => {
              const o = {
                ...r,
              };

              empty.forEach(
                (c) =>
                  delete o[c]
              );

              return o;
            }
          );

        return ctx.messages.push(
          empty.length
            ? `Removed empty column(s): ${empty.join(
                ", "
              )}.`
            : "No empty columns found."
        );
      }

      case "trim":
        mapCells((v) =>
          typeof v === "string"
            ? v.trim()
            : v
        );

        return ctx.messages.push(
          `Trimmed ${count} cell(s).`
        );

      case "case": {
        const fns = {
          upper: (s) =>
            s.toUpperCase(),

          lower: (s) =>
            s.toLowerCase(),

          title: titleCase,
        };

        if (!fns[rule.mode]) {
          throw new AppError(
            "Unsupported text format.",
            400
          );
        }

        mapCells((v) =>
          typeof v === "string"
            ? fns[rule.mode](v)
            : v
        );

        return ctx.messages.push(
          `Standardized ${count} cell(s) to ${rule.mode} case.`
        );
      }

      case "toNumber":
        mapCells((v) => {
          if (
            typeof v !==
            "string"
          ) {
            return v;
          }

          const n =
            toNumber(v);

          return isNaN(n)
            ? v
            : n;
        });

        return ctx.messages.push(
          `Converted ${count} text value(s) to numbers.`
        );

      case "normalizeDates": {
        let skipped = 0;

        mapCells((v) => {
          if (isBlank(v)) {
            return v;
          }

          const d =
            parseDate(
              v,
              rule.order === "MDY"
                ? "MDY"
                : "DMY"
            );

          if (!d) {
            skipped++;
            return v;
          }

          return d;
        });

        return ctx.messages.push(
          `Normalized ${count} date(s) to YYYY-MM-DD${
            skipped
              ? `; ${skipped} value(s) were not recognised as dates and were left unchanged`
              : ""
          }.`
        );
      }

      default:
        throw new AppError(
          "Unsupported cleaning operation.",
          400
        );
    }
  },

  validate(rule, ctx) {
    const check =
      rule.check;

    const cols =
      rule.column
        ? [rule.column]
        : ctx.columns;

    const push = (
      row,
      column,
      value,
      message
    ) => {
      if (
        ctx.issues.length <
        MAX_ISSUES
      ) {
        ctx.issues.push({
          row,
          column,
          value:
            value ?? "",
          check,
          message,
        });
      }
    };

    if (
      [
        "missing",
        "required",
      ].includes(check)
    ) {
      cols.forEach(
        (c) =>
          ctx.data.forEach(
            (r, i) => {
              if (
                isBlank(r[c])
              ) {
                push(
                  i,
                  c,
                  "",
                  `${c} is empty`
                );
              }
            }
          )
      );
    } else if (
      check === "email"
    ) {
      ctx.data.forEach(
        (r, i) => {
          const v =
            r[rule.column];

          if (
            !isBlank(v) &&
            !EMAIL_RE.test(
              String(v).trim()
            )
          ) {
            push(
              i,
              rule.column,
              v,
              "Invalid email address"
            );
          }
        }
      );
    } else if (
      check === "number"
    ) {
      ctx.data.forEach(
        (r, i) => {
          const v =
            r[rule.column];

          if (
            !isBlank(v) &&
            isNaN(
              toNumber(v)
            )
          ) {
            push(
              i,
              rule.column,
              v,
              "Not a valid number"
            );
          }
        }
      );
    } else if (
      check === "date"
    ) {
      ctx.data.forEach(
        (r, i) => {
          const v =
            r[rule.column];

          if (
            !isBlank(v) &&
            !parseDate(
              v,
              rule.order
            )
          ) {
            push(
              i,
              rule.column,
              v,
              "Not a valid date"
            );
          }
        }
      );
    } else if (
      check === "unique"
    ) {
      const counts =
        new Map();

      ctx.data.forEach(
        (r) => {
          const k =
            String(
              r[rule.column] ??
                ""
            )
              .trim()
              .toLowerCase();

          if (k) {
            counts.set(
              k,
              (counts.get(k) ||
                0) + 1
            );
          }
        }
      );

      ctx.data.forEach(
        (r, i) => {
          const k =
            String(
              r[rule.column] ??
                ""
            )
              .trim()
              .toLowerCase();

          if (
            k &&
            counts.get(k) >
              1
          ) {
            push(
              i,
              rule.column,
              r[rule.column],
              "Duplicate value"
            );
          }
        }
      );
    } else {
      throw new AppError(
        "Unsupported validation.",
        400
      );
    }

    ctx.messages.push(
      `Validation (${check}${
        rule.column
          ? ` on ${rule.column}`
          : ""
      }) found ${
        ctx.issues.filter(
          (x) =>
            x.check ===
            check
        ).length
      } issue(s).`
    );
  },
};

// ---------- rule execution ----------

function resolveRule(
  rule,
  columns,
  step
) {
  const out = {
    ...rule,
  };

  const find = (v) => {
    const c =
      resolveColumn(
        v,
        columns
      );

    if (!c) {
      throw new AppError(
        `Step ${step}: column "${v}" was not found in this dataset.`,
        400
      );
    }

    return c;
  };

  [
    "left",
    "right",
    "column",
  ].forEach((k) => {
    if (!isBlank(rule[k])) {
      out[k] = find(
        rule[k]
      );
    }
  });

  if (
    !isBlank(
      rule.column2
    ) &&
    up(rule.column2) !==
      "TODAY"
  ) {
    out.column2 =
      find(rule.column2);
  }

  if (
    Array.isArray(
      rule.columns
    )
  ) {
    out.columns =
      rule.columns.map(
        find
      );
  }

  return out;
}

function assertRules(rules) {
  if (
    !Array.isArray(rules) ||
    rules.length === 0 ||
    rules.length > 50
  ) {
    throw new AppError(
      "Please add between 1 and 50 steps.",
      400
    );
  }

  rules.forEach(
    (r, i) => {
      if (
        !r ||
        typeof r !==
          "object" ||
        !RULE_TYPES.includes(
          r.type
        )
      ) {
        throw new AppError(
          `Step ${
            i + 1
          } is not a supported operation.`,
          400
        );
      }
    }
  );
}

function runRules(
  columns,
  data,
  rules
) {
  assertRules(rules);

  const ctx = {
    columns: [...columns],
    data: data.map(
      (r) => ({
        ...r,
      })
    ),
    messages: [],
    results: [],
    issues: [],
  };

  rules.forEach(
    (raw, i) => {
      const step = i + 1;

      const rule =
        resolveRule(
          raw,
          ctx.columns,
          step
        );

      try {
        handlers[
          rule.type
        ](rule, ctx);
      } catch (err) {
        if (
          err.isOperational
        ) {
          throw new AppError(
            `Step ${step}: ${err.message}`,
            400
          );
        }

        throw new AppError(
          `Step ${step}: Unable to calculate this rule. Please check the selected columns.`,
          400
        );
      }
    }
  );

  return ctx;
}

// ---------- descriptions ----------

function describeRule(r) {
  const sym = {
    "*": "×",
    "/": "÷",
  };

  switch (r.type) {
    case "arithmetic":
      return r.op === "%"
        ? `${r.left} × ${
            r.right ||
            r.rightValue
          }% → ${r.output}`
        : `${r.left} ${
            sym[r.op] ||
            r.op
          } ${
            r.right ||
            r.rightValue
          } → ${r.output}`;

    case "stat":
      return `${up(
        r.fn
      )}(${r.column}) → ${
        r.output ||
        "result"
      }`;

    case "text":
      return `${up(
        r.fn
      )}(${(
        r.columns || [
          r.column,
        ]
      ).join(", ")}) → ${
        r.output ||
        r.column
      }`;

    case "if":
      return `IF ${r.column} ${r.operator} "${r.value}" THEN "${r.thenValue}" ELSE "${
        r.elseValue ??
        ""
      }" → ${r.output}`;

    case "date":
      return `${up(
        r.fn
      )}(${r.column}${
        r.column2
          ? `, ${r.column2}`
          : ""
      }${
        r.days
          ? `, ${r.days}`
          : ""
      }) → ${r.output}`;

    case "round":
      return `${up(
        r.fn
      )}(${r.column}, ${
        r.digits ?? 0
      }) → ${
        r.output ||
        r.column
      }`;

    case "dedupe":
      return `Remove duplicates by ${
        r.columns?.length
          ? r.columns.join(
              ", "
            )
          : "all columns"
      }`;

    case "filter":
      return `Keep rows where ${r.column} ${r.operator} ${r.value}`;

    case "clean":
      return `Clean: ${r.op}${
        r.mode
          ? ` (${r.mode})`
          : ""
      }`;

    case "validate":
      return `Validate ${r.check}${
        r.column
          ? ` on ${r.column}`
          : ""
      }`;

    default:
      return r.type;
  }
}

// ---------- natural-language commands ----------

const SUPPORTED_COMMANDS = [
  "Calculate total salary using salary and bonus (also: minus, times, divided by)",
  "Create annual salary from total salary",
  "Find average / sum / minimum / maximum / count of <column>",
  "Remove duplicate <column>",
  "Remove empty rows · Trim spaces",
  "Find rows with <column> greater than / less than / equal to <value>",
];

function resolveLoose(
  name,
  columns
) {
  const base =
    name.trim();

  const tries = [
    base,
    base.replace(
      /s$/,
      ""
    ),
    base.replace(
      /ids$/,
      "id"
    ),
    base.replace(
      /^(the|all)\s+/,
      ""
    ),
  ];

  for (const t of tries) {
    const c =
      resolveColumn(
        t,
        columns
      );

    if (c) return c;
  }

  return null;
}

function parseCommand(
  text,
  columns
) {
  const t = String(
    text || ""
  )
    .trim()
    .replace(
      /[.?!]+$/,
      ""
    );

  if (!t) {
    throw new AppError(
      "Please type a command.",
      400
    );
  }

  const l =
    t.toLowerCase();

  const col = (name) => {
    const c =
      resolveLoose(
        name,
        columns
      );

    if (!c) {
      throw new AppError(
        `I couldn't find a column called "${name.trim()}". Available columns: ${columns.join(
          ", "
        )}.`,
        400
      );
    }

    return c;
  };

  const opWords = {
    and: "+",
    plus: "+",
    minus: "-",
    times: "*",
    "multiplied by": "*",
    "divided by": "/",
  };

  let m = l.match(
    /^(?:calculate|create|compute|add|make)\s+(.+?)\s+(?:using|from)\s+(.+?)\s+(and|plus|minus|times|multiplied by|divided by)\s+(.+)$/
  );

  if (m) {
    return [
      {
        type: "arithmetic",
        left: col(m[2]),
        op: opWords[m[3]],
        right: col(m[4]),
        output:
          titleCase(m[1]),
      },
    ];
  }

  m = l.match(
    /^(?:calculate|create|compute|add|make)\s+(.+?)\s+from\s+(.+)$/
  );

  if (m) {
    if (
      /annual|yearly/.test(
        m[1]
      )
    ) {
      return [
        {
          type: "arithmetic",
          left: col(m[2]),
          op: "*",
          rightValue: 12,
          output:
            titleCase(m[1]),
        },
      ];
    }

    if (
      /monthly/.test(
        m[1]
      )
    ) {
      return [
        {
          type: "arithmetic",
          left: col(m[2]),
          op: "/",
          rightValue: 12,
          output:
            titleCase(m[1]),
        },
      ];
    }
  }

  m = l.match(
    /^remove\s+duplicates?\s*(?:based on|by|on)?\s*(.*)$/
  );

  if (m) {
    return [
      {
        type: "dedupe",
        columns: m[1].trim()
          ? [col(m[1])]
          : [],
      },
    ];
  }

  if (
    /^remove empty rows?$/.test(
      l
    )
  ) {
    return [
      {
        type: "clean",
        op: "removeEmptyRows",
      },
    ];
  }

  if (
    /^trim( spaces)?$/.test(
      l
    )
  ) {
    return [
      {
        type: "clean",
        op: "trim",
      },
    ];
  }

  m = l.match(
    /^(?:find|show|filter|get|list)\s+(?:\w+\s+)?(?:with|where)\s+(.+?)\s+(greater than or equal to|less than or equal to|greater than|more than|above|less than|below|not equal to|equal to|equals|contains|is|=|>=|<=|>|<)\s+(.+)$/
  );

  if (m) {
    const ops = {
      "greater than or equal to":
        ">=",

      "less than or equal to":
        "<=",

      "greater than": ">",

      "more than": ">",

      above: ">",

      "less than": "<",

      below: "<",

      "not equal to": "!=",

      "equal to": "=",

      equals: "=",

      is: "=",

      "=": "=",

      contains: "contains",

      ">": ">",

      "<": "<",

      ">=": ">=",

      "<=": "<=",
    };

    return [
      {
        type: "filter",
        column: col(m[1]),
        operator:
          ops[m[2]],
        value: m[3].trim(),
      },
    ];
  }

  m = l.match(
    /^(?:find|calculate|get|what is|show)?\s*(?:the\s+)?(average|avg|sum|total|minimum|min|lowest|maximum|max|highest|count)\s+(?:of\s+)?(.+)$/
  );

  if (m) {
    const fn = {
      average: "AVERAGE",
      avg: "AVERAGE",
      sum: "SUM",
      total: "SUM",
      minimum: "MIN",
      min: "MIN",
      lowest: "MIN",
      maximum: "MAX",
      max: "MAX",
      highest: "MAX",
      count: "COUNT",
    }[m[1]];

    return [
      {
        type: "stat",
        fn,
        column: col(m[2]),
        output: "",
      },
    ];
  }

  throw new AppError(
    `Sorry, I don't understand that command yet. Supported commands:\n• ${SUPPORTED_COMMANDS.join(
      "\n• "
    )}`,
    400
  );
}

export {
  runRules,
  assertRules,
  describeRule,
  parseCommand,
  parseDate,
  toNumber,
  isBlank,
  resolveColumn,
  sanitizeName,
  SUPPORTED_COMMANDS,
};