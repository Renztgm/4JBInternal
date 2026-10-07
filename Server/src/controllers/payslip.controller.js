const prisma = require("../lib/prisma");

exports.mine = async (req, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { userId: req.user.id } });
    if (!employee) return res.json([]);

    const payslips = await prisma.payslip.findMany({
      where: { employeeId: employee.id, run: { status: { in: ["APPROVED", "PAID"] } } },
      include: { items: true, run: true },
      orderBy: { run: { periodStart: "desc" } },
    });
    res.json(payslips);
  } catch (err) { next(err); }
};