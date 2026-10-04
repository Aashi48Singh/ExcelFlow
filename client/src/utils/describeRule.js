// const sym = { '*': '×', '/': '÷' };
// export function describeRule(r) {
//   const up = (s) => String(s || '').toUpperCase();
//   switch (r.type) {
//     case 'arithmetic': return r.op === '%' ? `${r.left} × ${r.right || r.rightValue}% → ${r.output}` : `${r.left} ${sym[r.op] || r.op} ${r.right || r.rightValue} → ${r.output}`;
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
const sym = {
  "*": "×",
  "/": "÷",
};

export function describeRule(r) {
  const up = (s) => String(s || "").toUpperCase();

  switch (r.type) {
    case "arithmetic":
      return r.op === "%"
        ? `${r.left} × ${r.right || r.rightValue}% → ${r.output}`
        : `${r.left} ${sym[r.op] || r.op} ${
            r.right || r.rightValue
          } → ${r.output}`;

    case "stat": {
      const fn = up(r.fn);

      const labels = {
        SUM: "Total",
        AVERAGE: "Average",
        COUNT: "Count",
        MIN: "Minimum",
        MAX: "Maximum",
      };

      const label = labels[fn] || fn;

      return `${fn}(${r.column}) → ${label} ${r.column}`;
    }

    case "text":
      return `${up(r.fn)}(${(r.columns || [r.column]).join(
        ", "
      )}) → ${r.output || r.column}`;

    case "if":
      return `IF ${r.column} ${r.operator} "${r.value}" THEN "${r.thenValue}" ELSE "${r.elseValue ?? ""}" → ${r.output}`;

    case "date":
      return `${up(r.fn)}(${r.column}${
        r.column2 ? `, ${r.column2}` : ""
      }${r.days ? `, ${r.days}` : ""}) → ${r.output}`;

    case "round":
      return `${up(r.fn)}(${r.column}, ${
        r.digits ?? 0
      }) → ${r.output || r.column}`;

    case "dedupe":
      return `Remove duplicates by ${
        r.columns?.length
          ? r.columns.join(", ")
          : "all columns"
      }`;

    case "filter":
      return `Keep rows where ${r.column} ${r.operator} ${r.value}`;

    case "clean":
      return `Clean: ${r.op}${
        r.mode ? ` (${r.mode})` : ""
      }`;

    case "validate":
      return `Validate ${r.check}${
        r.column ? ` on ${r.column}` : ""
      }`;

    default:
      return r.type;
  }
}