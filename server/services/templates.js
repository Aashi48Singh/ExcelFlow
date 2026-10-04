// Predefined automation templates. Column names are matched case/space-insensitively when applied.
// const add = (left, right, output) => ({ type: 'arithmetic', left, op: '+', right, output });
// const mul = (left, op, right, output) => ({ type: 'arithmetic', left, op, [typeof right === 'number' ? 'rightValue' : 'right']: right, output });
// const clean = (op, extra = {}) => ({ type: 'clean', op, ...extra });

// module.exports = [
//   { id: 'employee-payroll', name: 'Employee Payroll', description: 'Total and annual salary with email and ID checks.', expects: ['Employee ID', 'Salary', 'Bonus', 'Email'],
//     rules: [{ type: 'dedupe', columns: ['Employee ID'] }, { type: 'validate', check: 'email', column: 'Email' }, add('Salary', 'Bonus', 'Total Salary'), mul('Total Salary', '*', 12, 'Annual Salary')] },
//   { id: 'employee-cleaning', name: 'Employee Data Cleaning', description: 'Trim, standardize names, remove duplicates and empty rows.', expects: ['Name'],
//     rules: [clean('removeEmptyRows'), clean('trim'), clean('case', { mode: 'title', columns: ['Name'] }), clean('removeDuplicates')] },
//   { id: 'sales-report', name: 'Sales Report', description: 'Line totals from quantity and price, rounded to 2 decimals.', expects: ['Quantity', 'Price'],
//     rules: [clean('toNumber'), mul('Quantity', '*', 'Price', 'Line Total'), { type: 'round', fn: 'ROUND', column: 'Line Total', digits: 2, output: 'Line Total' }] },
//   { id: 'inventory', name: 'Inventory Management', description: 'Stock value and low stock flag.', expects: ['Stock', 'Price'],
//     rules: [clean('toNumber'), mul('Stock', '*', 'Price', 'Stock Value'), { type: 'if', column: 'Stock', operator: '<=', value: '10', thenValue: 'Reorder', elseValue: 'OK', output: 'Stock Status' }] },
//   { id: 'customer-db', name: 'Customer Database', description: 'Clean contacts, validate email, remove duplicate customers.', expects: ['Name', 'Email'],
//     rules: [clean('trim'), clean('case', { mode: 'title', columns: ['Name'] }), { type: 'validate', check: 'email', column: 'Email' }, { type: 'dedupe', columns: ['Email'] }] },
//   { id: 'attendance', name: 'Attendance Report', description: 'Attendance percentage and status.', expects: ['Days Present', 'Working Days'],
//     rules: [clean('toNumber'), mul('Days Present', '/', 'Working Days', 'Attendance Ratio'), mul('Attendance Ratio', '*', 100, 'Attendance %'), { type: 'round', fn: 'ROUND', column: 'Attendance %', digits: 1, output: 'Attendance %' }, { type: 'if', column: 'Attendance %', operator: '>=', value: '75', thenValue: 'Eligible', elseValue: 'Shortage', output: 'Status' }] },
//   { id: 'expense', name: 'Expense Report', description: 'Totals expenses with tax and extracts month.', expects: ['Amount', 'Tax', 'Date'],
//     rules: [clean('toNumber'), add('Amount', 'Tax', 'Total Expense'), { type: 'date', fn: 'MONTH', column: 'Date', order: 'DMY', output: 'Month' }] },
//   { id: 'invoice', name: 'Invoice Data', description: 'Invoice totals and due dates.', expects: ['Subtotal', 'Tax', 'Invoice Date'],
//     rules: [clean('toNumber'), add('Subtotal', 'Tax', 'Invoice Total'), { type: 'date', fn: 'ADD_DAYS', column: 'Invoice Date', days: 30, order: 'DMY', output: 'Due Date' }] },
//   { id: 'financial-summary', name: 'Monthly Financial Summary', description: 'Net amount from revenue and expenses with margin.', expects: ['Revenue', 'Expenses'],
//     rules: [clean('toNumber'), mul('Revenue', '-', 'Expenses', 'Net'), mul('Net', '/', 'Revenue', 'Margin Ratio'), mul('Margin Ratio', '*', 100, 'Margin %'), { type: 'round', fn: 'ROUND', column: 'Margin %', digits: 1, output: 'Margin %' }] },
// ];
// Predefined automation templates. Column names are matched case/space-insensitively when applied.

const add = (left, right, output) => ({
  type: "arithmetic",
  left,
  op: "+",
  right,
  output,
});

const mul = (left, op, right, output) => ({
  type: "arithmetic",
  left,
  op,
  [typeof right === "number" ? "rightValue" : "right"]: right,
  output,
});

const clean = (op, extra = {}) => ({
  type: "clean",
  op,
  ...extra,
});

const templates = [
  {
    id: "employee-payroll",
    name: "Employee Payroll",
    description: "Total and annual salary with email and ID checks.",
    expects: ["Employee ID", "Salary", "Bonus", "Email"],
    rules: [
      { type: "dedupe", columns: ["Employee ID"] },
      { type: "validate", check: "email", column: "Email" },
      add("Salary", "Bonus", "Total Salary"),
      mul("Total Salary", "*", 12, "Annual Salary"),
    ],
  },

  {
    id: "employee-cleaning",
    name: "Employee Data Cleaning",
    description:
      "Trim, standardize names, remove duplicates and empty rows.",
    expects: ["Name"],
    rules: [
      clean("removeEmptyRows"),
      clean("trim"),
      clean("case", { mode: "title", columns: ["Name"] }),
      clean("removeDuplicates"),
    ],
  },

  {
    id: "sales-report",
    name: "Sales Report",
    description:
      "Line totals from quantity and price, rounded to 2 decimals.",
    expects: ["Quantity", "Price"],
    rules: [
      clean("toNumber"),
      mul("Quantity", "*", "Price", "Line Total"),
      {
        type: "round",
        fn: "ROUND",
        column: "Line Total",
        digits: 2,
        output: "Line Total",
      },
    ],
  },

  {
    id: "inventory",
    name: "Inventory Management",
    description: "Stock value and low stock flag.",
    expects: ["Stock", "Price"],
    rules: [
      clean("toNumber"),
      mul("Stock", "*", "Price", "Stock Value"),
      {
        type: "if",
        column: "Stock",
        operator: "<=",
        value: "10",
        thenValue: "Reorder",
        elseValue: "OK",
        output: "Stock Status",
      },
    ],
  },

  {
    id: "customer-db",
    name: "Customer Database",
    description:
      "Clean contacts, validate email, remove duplicate customers.",
    expects: ["Name", "Email"],
    rules: [
      clean("trim"),
      clean("case", { mode: "title", columns: ["Name"] }),
      {
        type: "validate",
        check: "email",
        column: "Email",
      },
      {
        type: "dedupe",
        columns: ["Email"],
      },
    ],
  },

  {
    id: "attendance",
    name: "Attendance Report",
    description: "Attendance percentage and status.",
    expects: ["Days Present", "Working Days"],
    rules: [
      clean("toNumber"),
      mul(
        "Days Present",
        "/",
        "Working Days",
        "Attendance Ratio"
      ),
      mul(
        "Attendance Ratio",
        "*",
        100,
        "Attendance %"
      ),
      {
        type: "round",
        fn: "ROUND",
        column: "Attendance %",
        digits: 1,
        output: "Attendance %",
      },
      {
        type: "if",
        column: "Attendance %",
        operator: ">=",
        value: "75",
        thenValue: "Eligible",
        elseValue: "Shortage",
        output: "Status",
      },
    ],
  },

  {
    id: "expense",
    name: "Expense Report",
    description:
      "Totals expenses with tax and extracts month.",
    expects: ["Amount", "Tax", "Date"],
    rules: [
      clean("toNumber"),
      add("Amount", "Tax", "Total Expense"),
      {
        type: "date",
        fn: "MONTH",
        column: "Date",
        order: "DMY",
        output: "Month",
      },
    ],
  },

  {
    id: "invoice",
    name: "Invoice Data",
    description: "Invoice totals and due dates.",
    expects: ["Subtotal", "Tax", "Invoice Date"],
    rules: [
      clean("toNumber"),
      add("Subtotal", "Tax", "Invoice Total"),
      {
        type: "date",
        fn: "ADD_DAYS",
        column: "Invoice Date",
        days: 30,
        order: "DMY",
        output: "Due Date",
      },
    ],
  },

  {
    id: "financial-summary",
    name: "Monthly Financial Summary",
    description:
      "Net amount from revenue and expenses with margin.",
    expects: ["Revenue", "Expenses"],
    rules: [
      clean("toNumber"),
      mul("Revenue", "-", "Expenses", "Net"),
      mul("Net", "/", "Revenue", "Margin Ratio"),
      mul("Margin Ratio", "*", 100, "Margin %"),
      {
        type: "round",
        fn: "ROUND",
        column: "Margin %",
        digits: 1,
        output: "Margin %",
      },
    ],
  },
];

export default templates;