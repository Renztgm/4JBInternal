// ---- Government contribution rules (verify yearly) ----
const SSS = {
  employeeRate: 0.05,
  employerRate: 0.10,
  minMSC: 500000,       // ₱5,000
  maxMSC: 3500000,      // ₱35,000
  step: 50000,          // ₱500
  ecLow: 1000,          // ₱10 employer EC when MSC < ₱15,000
  ecHigh: 3000,         // ₱30 when MSC >= ₱15,000
};

const PHILHEALTH = {
  rate: 0.05,           // split 50/50
  minBase: 1000000,     // ₱10,000
  maxBase: 10000000,    // ₱100,000
};

const PAGIBIG = {
  rate: 0.02,           // employee and employer each
  maxBase: 1000000,     // ₱10,000 fund salary cap -> max ₱200
};

// TRAIN annual brackets (centavos); applied monthly by dividing by 12
const ANNUAL_TAX_BRACKETS = [
  { upTo: 25000000,   rate: 0 },     // up to ₱250,000
  { upTo: 40000000,   rate: 0.15 },  // to ₱400,000
  { upTo: 80000000,   rate: 0.20 },  // to ₱800,000
  { upTo: 200000000,  rate: 0.25 },  // to ₱2,000,000
  { upTo: 800000000,  rate: 0.30 },  // to ₱8,000,000
  { upTo: Infinity,   rate: 0.35 },
];
// --------------------------------------------------------

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function sssShares(gross) {
  // nearest ₱500 step, then clamp to the MSC range
  const rounded = Math.floor((gross + SSS.step / 2) / SSS.step) * SSS.step;
  const msc = clamp(rounded, SSS.minMSC, SSS.maxMSC);
  const ec = msc < 1500000 ? SSS.ecLow : SSS.ecHigh;
  return {
    employee: Math.round(msc * SSS.employeeRate),
    employer: Math.round(msc * SSS.employerRate) + ec,
  };
}

function philhealthShares(gross) {
  const base = clamp(gross, PHILHEALTH.minBase, PHILHEALTH.maxBase);
  const half = Math.round((base * PHILHEALTH.rate) / 2);
  return { employee: half, employer: half };
}

function pagibigShares(gross) {
  const amount = Math.round(Math.min(gross, PAGIBIG.maxBase) * PAGIBIG.rate);
  return { employee: amount, employer: amount };
}

function withholdingTax(monthlyTaxable) {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of ANNUAL_TAX_BRACKETS) {
    const upper = upTo / 12;
    if (monthlyTaxable > lower) {
      tax += (Math.min(monthlyTaxable, upper) - lower) * rate;
    }
    lower = upper;
    if (monthlyTaxable <= upper) break;
  }
  return Math.round(tax);
}

function totals(items) {
  const sum = (type) =>
    items.filter((i) => i.type === type).reduce((s, i) => s + i.amount, 0);
  const gross = sum("EARNING");
  const totalDeductions = sum("DEDUCTION");
  return { gross, totalDeductions, net: gross - totalDeductions };
}

function computePayslip(employee) {
  const gross = employee.baseSalary;

  const sss = sssShares(gross);
  const ph = philhealthShares(gross);
  const hdmf = pagibigShares(gross);

  // Employee contributions are deducted BEFORE computing withholding tax
  const contributions = sss.employee + ph.employee + hdmf.employee;
  const tax = withholdingTax(gross - contributions);

  const items = [
    { type: "EARNING",   label: "Basic salary",     amount: gross },
    { type: "DEDUCTION", label: "SSS",              amount: sss.employee },
    { type: "DEDUCTION", label: "PhilHealth",       amount: ph.employee },
    { type: "DEDUCTION", label: "Pag-IBIG",         amount: hdmf.employee },
    { type: "DEDUCTION", label: "Withholding tax",  amount: tax },
    // Employer shares: stored for remittance reports, excluded from net pay
    { type: "EMPLOYER",  label: "SSS (employer + EC)", amount: sss.employer },
    { type: "EMPLOYER",  label: "PhilHealth (employer)", amount: ph.employer },
    { type: "EMPLOYER",  label: "Pag-IBIG (employer)", amount: hdmf.employer },
  ];

  return { items, ...totals(items) };
}

module.exports = { computePayslip, totals };