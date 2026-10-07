const { computePayslip } = require("./src/services/payroll.service");

const slip = computePayslip({ baseSalary: 3000000 }); // ₱30,000

for (const i of slip.items) {
  console.log(i.type.padEnd(10), i.label.padEnd(24), (i.amount / 100).toFixed(2));
}
console.log("Total deductions:", (slip.totalDeductions / 100).toFixed(2));
console.log("Net pay:         ", (slip.net / 100).toFixed(2));