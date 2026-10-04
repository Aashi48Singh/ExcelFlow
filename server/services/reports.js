// const AppError = require('../utils/AppError');
// const { toNumber, isBlank } = require('./engine');

// const norm = (s) => String(s).toLowerCase().replace(/[\s_\-]+/g, '');
// function findCol(columns, aliases) {
//   for (const a of aliases) { const hit = columns.find((c) => norm(c) === a); if (hit) return hit; }
//   for (const a of aliases) { const hit = columns.find((c) => norm(c).includes(a)); if (hit) return hit; }
//   return null;
// }
// function requireCols(map, label) {
//   const missing = Object.entries(map).filter(([, v]) => !v).map(([k]) => k);
//   if (missing.length) throw new AppError(`The ${label} report needs these columns: ${missing.join(', ')}. Rename your columns or choose a different report.`, 400);
// }
// const r2 = (n) => Math.round(n * 100) / 100;
// const nums = (data, col) => data.map((r) => toNumber(r[col])).filter((n) => !isNaN(n));

// function groupSum(data, keyCol, valCol) {
//   const m = new Map();
//   data.forEach((r) => {
//     const k = String(r[keyCol] ?? '').trim();
//     if (!k) return;
//     const v = toNumber(r[valCol]);
//     const cur = m.get(k) || { sum: 0, count: 0 };
//     if (!isNaN(v)) cur.sum += v;
//     cur.count += 1;
//     m.set(k, cur);
//   });
//   return [...m.entries()].map(([key, v]) => ({ key, ...v }));
// }

// const builders = {
//   employee(columns, data) {
//     const c = { Salary: findCol(columns, ['totalsalary', 'salary', 'pay']), Department: findCol(columns, ['department', 'dept']) };
//     const nameCol = findCol(columns, ['employeename', 'name', 'employee']);
//     requireCols(c, 'Employee');
//     const sal = nums(data, c.Salary);
//     if (!sal.length) throw new AppError('No numeric salary values were found in the Salary column.', 400);
//     const rows = data.filter((r) => !isNaN(toNumber(r[c.Salary])));
//     const hi = rows.reduce((a, b) => (toNumber(b[c.Salary]) > toNumber(a[c.Salary]) ? b : a));
//     const lo = rows.reduce((a, b) => (toNumber(b[c.Salary]) < toNumber(a[c.Salary]) ? b : a));
//     const who = (r) => (nameCol && r[nameCol] ? ` (${r[nameCol]})` : '');
//     const depts = groupSum(data, c.Department, c.Salary);
//     return {
//       title: 'Employee Report',
//       metrics: [
//         { label: 'Total Employees', value: data.length },
//         { label: 'Average Salary', value: r2(sal.reduce((a, b) => a + b, 0) / sal.length) },
//         { label: 'Departments', value: depts.length },
//         { label: 'Highest Salary', value: `${toNumber(hi[c.Salary])}${who(hi)}` },
//         { label: 'Lowest Salary', value: `${toNumber(lo[c.Salary])}${who(lo)}` },
//       ],
//       tables: [{ title: 'By Department', rows: depts.map((d) => ({ Department: d.key, Employees: d.count, 'Average Salary': d.count ? r2(d.sum / d.count) : 0 })) }],
//     };
//   },
//   sales(columns, data) {
//     const c = { Amount: findCol(columns, ['totalsales', 'sales', 'revenue', 'amount', 'total']), Product: findCol(columns, ['product', 'item']) };
//     const personCol = findCol(columns, ['salesperson', 'salesman', 'seller', 'rep', 'employee']);
//     requireCols(c, 'Sales');
//     const vals = nums(data, c.Amount);
//     if (!vals.length) throw new AppError('No numeric values were found in the sales amount column.', 400);
//     const total = vals.reduce((a, b) => a + b, 0);
//     const byProduct = groupSum(data, c.Product, c.Amount).sort((a, b) => b.sum - a.sum);
//     const byPerson = personCol ? groupSum(data, personCol, c.Amount).sort((a, b) => b.sum - a.sum) : [];
//     const metrics = [
//       { label: 'Total Sales', value: r2(total) },
//       { label: 'Average Sale', value: r2(total / vals.length) },
//       { label: 'Top Product', value: byProduct[0]?.key ?? 'n/a' },
//     ];
//     if (personCol) metrics.push({ label: 'Top Salesperson', value: byPerson[0]?.key ?? 'n/a' });
//     const tables = [{ title: 'By Product', rows: byProduct.map((p) => ({ Product: p.key, Sales: r2(p.sum), Orders: p.count })) }];
//     if (personCol) tables.push({ title: 'By Salesperson', rows: byPerson.map((p) => ({ Salesperson: p.key, Sales: r2(p.sum), Orders: p.count })) });
//     return { title: 'Sales Report', metrics, tables };
//   },
//   inventory(columns, data) {
//     const c = { Stock: findCol(columns, ['stock', 'quantity', 'qty', 'onhand']), Product: findCol(columns, ['product', 'item', 'name']) };
//     requireCols(c, 'Inventory');
//     const reorder = findCol(columns, ['reorderlevel', 'minstock', 'reorder', 'threshold']);
//     const items = data.map((r) => ({ name: r[c.Product], stock: toNumber(r[c.Stock]), min: reorder ? toNumber(r[reorder]) : NaN })).filter((i) => !isNaN(i.stock));
//     const limit = (i) => (isNaN(i.min) ? 10 : i.min);
//     const out = items.filter((i) => i.stock <= 0);
//     const low = items.filter((i) => i.stock > 0 && i.stock <= limit(i));
//     return {
//       title: 'Inventory Report',
//       metrics: [
//         { label: 'Total Products', value: data.filter((r) => !isBlank(r[c.Product])).length },
//         { label: 'Low Stock Items', value: low.length },
//         { label: 'Out of Stock Items', value: out.length },
//       ],
//       tables: [
//         { title: 'Low Stock', rows: low.map((i) => ({ Product: i.name, Stock: i.stock, 'Reorder Level': limit(i) })) },
//         { title: 'Out of Stock', rows: out.map((i) => ({ Product: i.name, Stock: i.stock })) },
//       ],
//     };
//   },
// };

// function buildReport(type, columns, data) {
//   if (!builders[type]) throw new AppError('Please choose a report type.', 400);
//   if (!data.length) throw new AppError('The file has no rows to report on.', 400);
//   return builders[type](columns, data);
// }
// module.exports = { buildReport, REPORT_TYPES: Object.keys(builders) };
import AppError from "../utils/AppError.js";

import {
  toNumber,
  isBlank,
} from "./engine.js";

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[\s_\-]+/g, "");

function findCol(columns, aliases) {
  for (const a of aliases) {
    const hit = columns.find(
      (c) => norm(c) === a
    );

    if (hit) return hit;
  }

  for (const a of aliases) {
    const hit = columns.find(
      (c) => norm(c).includes(a)
    );

    if (hit) return hit;
  }

  return null;
}

function requireCols(map, label) {
  const missing = Object.entries(map)
    .filter(([, v]) => !v)
    .map(([k]) => k);

  if (missing.length) {
    throw new AppError(
      `The ${label} report needs these columns: ${missing.join(
        ", "
      )}. Rename your columns or choose a different report.`,
      400
    );
  }
}

const r2 = (n) =>
  Math.round(n * 100) / 100;

const nums = (data, col) =>
  data
    .map((r) => toNumber(r[col]))
    .filter((n) => !isNaN(n));

function groupSum(
  data,
  keyCol,
  valCol
) {
  const m = new Map();

  data.forEach((r) => {
    const k = String(
      r[keyCol] ?? ""
    ).trim();

    if (!k) return;

    const v = toNumber(r[valCol]);

    const cur =
      m.get(k) || {
        sum: 0,
        count: 0,
      };

    if (!isNaN(v)) {
      cur.sum += v;
    }

    cur.count += 1;

    m.set(k, cur);
  });

  return [...m.entries()].map(
    ([key, v]) => ({
      key,
      ...v,
    })
  );
}

const builders = {
  employee(columns, data) {
    const c = {
      Salary: findCol(
        columns,
        [
          "totalsalary",
          "salary",
          "pay",
        ]
      ),

      Department: findCol(
        columns,
        [
          "department",
          "dept",
        ]
      ),
    };

    const nameCol = findCol(
      columns,
      [
        "employeename",
        "name",
        "employee",
      ]
    );

    requireCols(c, "Employee");

    const sal = nums(
      data,
      c.Salary
    );

    if (!sal.length) {
      throw new AppError(
        "No numeric salary values were found in the Salary column.",
        400
      );
    }

    const rows = data.filter(
      (r) =>
        !isNaN(
          toNumber(
            r[c.Salary]
          )
        )
    );

    const hi = rows.reduce(
      (a, b) =>
        toNumber(b[c.Salary]) >
        toNumber(a[c.Salary])
          ? b
          : a
    );

    const lo = rows.reduce(
      (a, b) =>
        toNumber(b[c.Salary]) <
        toNumber(a[c.Salary])
          ? b
          : a
    );

    const who = (r) =>
      nameCol && r[nameCol]
        ? ` (${r[nameCol]})`
        : "";

    const depts = groupSum(
      data,
      c.Department,
      c.Salary
    );

    return {
      title: "Employee Report",

      metrics: [
        {
          label: "Total Employees",
          value: data.length,
        },

        {
          label: "Average Salary",
          value: r2(
            sal.reduce(
              (a, b) => a + b,
              0
            ) / sal.length
          ),
        },

        {
          label: "Departments",
          value: depts.length,
        },

        {
          label: "Highest Salary",
          value: `${toNumber(
            hi[c.Salary]
          )}${who(hi)}`,
        },

        {
          label: "Lowest Salary",
          value: `${toNumber(
            lo[c.Salary]
          )}${who(lo)}`,
        },
      ],

      tables: [
        {
          title: "By Department",

          rows: depts.map(
            (d) => ({
              Department: d.key,
              Employees: d.count,
              "Average Salary":
                d.count
                  ? r2(
                      d.sum /
                        d.count
                    )
                  : 0,
            })
          ),
        },
      ],
    };
  },

  sales(columns, data) {
    const c = {
      Amount: findCol(
        columns,
        [
          "totalsales",
          "sales",
          "revenue",
          "amount",
          "total",
        ]
      ),

      Product: findCol(
        columns,
        [
          "product",
          "item",
        ]
      ),
    };

    const personCol =
      findCol(columns, [
        "salesperson",
        "salesman",
        "seller",
        "rep",
        "employee",
      ]);

    requireCols(c, "Sales");

    const vals = nums(
      data,
      c.Amount
    );

    if (!vals.length) {
      throw new AppError(
        "No numeric values were found in the sales amount column.",
        400
      );
    }

    const total = vals.reduce(
      (a, b) => a + b,
      0
    );

    const byProduct =
      groupSum(
        data,
        c.Product,
        c.Amount
      ).sort(
        (a, b) =>
          b.sum - a.sum
      );

    const byPerson = personCol
      ? groupSum(
          data,
          personCol,
          c.Amount
        ).sort(
          (a, b) =>
            b.sum - a.sum
        )
      : [];

    const metrics = [
      {
        label: "Total Sales",
        value: r2(total),
      },

      {
        label: "Average Sale",
        value: r2(
          total / vals.length
        ),
      },

      {
        label: "Top Product",
        value:
          byProduct[0]?.key ??
          "n/a",
      },
    ];

    if (personCol) {
      metrics.push({
        label: "Top Salesperson",
        value:
          byPerson[0]?.key ??
          "n/a",
      });
    }

    const tables = [
      {
        title: "By Product",

        rows: byProduct.map(
          (p) => ({
            Product: p.key,
            Sales: r2(p.sum),
            Orders: p.count,
          })
        ),
      },
    ];

    if (personCol) {
      tables.push({
        title: "By Salesperson",

        rows: byPerson.map(
          (p) => ({
            Salesperson: p.key,
            Sales: r2(p.sum),
            Orders: p.count,
          })
        ),
      });
    }

    return {
      title: "Sales Report",
      metrics,
      tables,
    };
  },

  inventory(columns, data) {
    const c = {
      Stock: findCol(
        columns,
        [
          "stock",
          "quantity",
          "qty",
          "onhand",
        ]
      ),

      Product: findCol(
        columns,
        [
          "product",
          "item",
          "name",
        ]
      ),
    };

    requireCols(c, "Inventory");

    const reorder = findCol(
      columns,
      [
        "reorderlevel",
        "minstock",
        "reorder",
        "threshold",
      ]
    );

    const items = data
      .map((r) => ({
        name: r[c.Product],

        stock: toNumber(
          r[c.Stock]
        ),

        min: reorder
          ? toNumber(
              r[reorder]
            )
          : NaN,
      }))
      .filter(
        (i) => !isNaN(i.stock)
      );

    const limit = (i) =>
      isNaN(i.min)
        ? 10
        : i.min;

    const out = items.filter(
      (i) => i.stock <= 0
    );

    const low = items.filter(
      (i) =>
        i.stock > 0 &&
        i.stock <= limit(i)
    );

    return {
      title: "Inventory Report",

      metrics: [
        {
          label: "Total Products",
          value: data.filter(
            (r) =>
              !isBlank(
                r[c.Product]
              )
          ).length,
        },

        {
          label: "Low Stock Items",
          value: low.length,
        },

        {
          label:
            "Out of Stock Items",
          value: out.length,
        },
      ],

      tables: [
        {
          title: "Low Stock",

          rows: low.map(
            (i) => ({
              Product: i.name,
              Stock: i.stock,
              "Reorder Level":
                limit(i),
            })
          ),
        },

        {
          title: "Out of Stock",

          rows: out.map(
            (i) => ({
              Product: i.name,
              Stock: i.stock,
            })
          ),
        },
      ],
    };
  },
};

function buildReport(
  type,
  columns,
  data
) {
  if (!builders[type]) {
    throw new AppError(
      "Please choose a report type.",
      400
    );
  }

  if (!data.length) {
    throw new AppError(
      "The file has no rows to report on.",
      400
    );
  }

  return builders[type](
    columns,
    data
  );
}

const REPORT_TYPES =
  Object.keys(builders);

export {
  buildReport,
  REPORT_TYPES,
};