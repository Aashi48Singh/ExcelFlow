const assert = require('assert');
const e = require('../services/engine');
const cols = ['Employee ID', 'Name', 'Email', 'Salary', 'Bonus', 'Department', 'Joined'];
const data = [
  { 'Employee ID': 1, Name: ' rahul sharma ', Email: 'abc@gmail.com', Salary: 30000, Bonus: 5000, Department: 'IT', Joined: '01/10/2026' },
  { 'Employee ID': 2, Name: 'PRIYA', Email: 'abc@gmail', Salary: '40,000', Bonus: 2000, Department: 'HR', Joined: '2026-10-01' },
  { 'Employee ID': 2, Name: 'PRIYA', Email: 'abc@gmail', Salary: '40,000', Bonus: 2000, Department: 'HR', Joined: '2026-10-01' },
];
let r = e.runRules(cols, data, [
  { type: 'clean', op: 'toNumber' },
  { type: 'dedupe', columns: ['employee id'] },
  { type: 'arithmetic', left: 'Salary', op: '+', right: 'Bonus', output: 'Total Salary' },
  { type: 'arithmetic', left: 'Total Salary', op: '*', rightValue: 12, output: 'Annual Salary' },
  { type: 'if', column: 'Department', operator: '=', value: 'IT', thenValue: 'Technology', elseValue: 'Other', output: 'Dept Label' },
  { type: 'clean', op: 'trim' }, { type: 'clean', op: 'case', mode: 'title', columns: ['Name'] },
  { type: 'clean', op: 'normalizeDates', columns: ['Joined'] },
  { type: 'date', fn: 'MONTH', column: 'Joined', output: 'Month' },
  { type: 'stat', fn: 'AVERAGE', column: 'Total Salary' },
  { type: 'validate', check: 'email', column: 'Email' },
]);
assert.strictEqual(r.data.length, 2);
assert.strictEqual(r.data[0]['Total Salary'], 35000);
assert.strictEqual(r.data[1]['Annual Salary'], 504000);
assert.strictEqual(r.data[0]['Dept Label'], 'Technology');
assert.strictEqual(r.data[0].Name, 'Rahul Sharma');
assert.strictEqual(r.data[0].Joined, '2026-10-01');
assert.strictEqual(r.data[1].Joined, '2026-10-01');
assert.strictEqual(r.data[0].Month, 10);
assert.strictEqual(r.results[0].value, 38500);
assert.strictEqual(r.issues.length, 1);
assert.strictEqual(e.parseDate('25/12/2026', 'MDY'), '2026-12-25');
assert.strictEqual(e.parseDate('31/02/2026'), null);
assert.throws(() => e.runRules(cols, data, [{ type: 'arithmetic', left: 'Nope', op: '+', right: 'Bonus', output: 'X' }]), /not found/);
assert.throws(() => e.runRules(cols, data, [{ type: 'eval', code: 'process.exit()' }]), /not a supported/);
const p = (t) => e.parseCommand(t, cols)[0];
assert.deepStrictEqual(p('Calculate total salary using salary and bonus'), { type: 'arithmetic', left: 'Salary', op: '+', right: 'Bonus', output: 'Total Salary' });
assert.strictEqual(p('Find average salary').fn, 'AVERAGE');
assert.deepStrictEqual(p('Remove duplicate employee IDs').columns, ['Employee ID']);
assert.deepStrictEqual(p('Find employees with salary greater than 50000'), { type: 'filter', column: 'Salary', operator: '>', value: '50000' });
assert.throws(() => e.parseCommand('make me coffee', cols), /Supported commands/);
console.log('engine tests passed');
