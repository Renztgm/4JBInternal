const prisma = require("../lib/prisma");
const { computePayslip, totals } = require("../services/payroll.service");

exports.createRun = async (req, res, next) => {
  try {
    const start = new Date(req.body.periodStart);
    const end = new Date(req.body.periodEnd);
    if (isNaN(start) || isNaN(end) || end < start) {
      return res.status(400).json({ error: "Valid periodStart and periodEnd are required" });
    }

    const employees = await prisma.employee.findMany({ where: { status: "ACTIVE" } });
    if (employees.length === 0) {
      return res.status(400).json({ error: "No active employees" });
    }

    const run = await prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: { periodStart: start, periodEnd: end, createdById: req.user.id },
      });
      for (const e of employees) {
        const { items, gross, totalDeductions, net } = computePayslip(e);
        await tx.payslip.create({
          data: {
            runId: run.id,
            employeeId: e.id,
            gross, totalDeductions, net,
            items: { create: items },
          },
        });
      }
      return run;
    });

    res.status(201).json(run);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A run for this period already exists" });
    }
    next(err);
  }
};

exports.listRuns = async (req, res, next) => {
  try {
    res.json(await prisma.payrollRun.findMany({ orderBy: { periodStart: "desc" } }));
  } catch (err) {
    next(err);
  }
};

exports.getRun = async (req, res, next) => {
  try {
    const run = await prisma.payrollRun.findUnique({
      where: { id: Number(req.params.id) },
      include: { payslips: { include: { employee: true, items: true } } },
    });
    if (!run) return res.status(404).json({ error: "Not found" });
    res.json(run);
  } catch (err) {
    next(err);
  }
};

exports.addItem = async (req, res, next) => {
  try {
    const { type, label, amount } = req.body;
    if (
      !["EARNING", "DEDUCTION"].includes(type) ||
      !label || !Number.isInteger(amount) || amount <= 0
    ) {
      return res.status(400).json({
        error: "type, label and a positive integer amount are required",
      });
    }

    const payslip = await prisma.payslip.findUnique({
      where: { id: Number(req.params.payslipId) },
      include: { run: true },
    });
    if (!payslip) return res.status(404).json({ error: "Not found" });
    if (payslip.run.status !== "DRAFT") {
      return res.status(409).json({ error: "Run is no longer editable" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.payslipItem.create({
        data: { payslipId: payslip.id, type, label, amount },
      });
      const items = await tx.payslipItem.findMany({ where: { payslipId: payslip.id } });
      return tx.payslip.update({
        where: { id: payslip.id },
        data: totals(items),
        include: { items: true },
      });
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

const transition = (from, to, extra = {}) => async (req, res, next) => {
  try {
    const r = await prisma.payrollRun.updateMany({
      where: { id: Number(req.params.id), status: from },
      data: { status: to, ...extra },
    });
    if (r.count === 0) {
      return res.status(409).json({ error: `Run must be ${from} to become ${to}` });
    }
    res.json({ status: to });
  } catch (err) {
    next(err);
  }
};

exports.approve = transition("DRAFT", "APPROVED");
exports.markPaid = (req, res, next) =>
  transition("APPROVED", "PAID", { paidAt: new Date() })(req, res, next);

exports.deleteDraft = async (req, res, next) => {
  try {
    const r = await prisma.payrollRun.deleteMany({
      where: { id: Number(req.params.id), status: "DRAFT" },
    });
    if (r.count === 0) {
      return res.status(409).json({ error: "Only draft runs can be deleted" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};