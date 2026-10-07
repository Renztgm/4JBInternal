const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");

exports.create = async (req, res, next) => {
  try {
    const {
      email, tempPassword, employeeNo, firstName, lastName,
      position, department, baseSalary, hireDate,
      tin, sssNo, philhealthNo, pagibigNo,
    } = req.body;

    if (
      !email || !tempPassword || tempPassword.length < 8 || !employeeNo ||
      !firstName || !lastName || !Number.isInteger(baseSalary) || baseSalary <= 0
    ) {
      return res.status(400).json({
        error: "Missing or invalid fields (baseSalary must be an integer in centavos)",
      });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeNo, firstName, lastName,
        position: position || "",
        department: department || "",
        baseSalary,
        hireDate: new Date(hireDate || Date.now()),
        tin, sssNo, philhealthNo, pagibigNo,
        user: {
          create: {
            email,
            password: await bcrypt.hash(tempPassword, 10),
            role: "EMPLOYEE",
          },
        },
      },
    });
    res.status(201).json(employee);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Email or employee number already exists" });
    }
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    res.json(await prisma.employee.findMany({ orderBy: { lastName: "asc" } }));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const {
      position, department, baseSalary, status,
      tin, sssNo, philhealthNo, pagibigNo,
    } = req.body;

    const employee = await prisma.employee.update({
      where: { id: Number(req.params.id) },
      data: { position, department, baseSalary, status, tin, sssNo, philhealthNo, pagibigNo },
    });
    res.json(employee);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
    next(err);
  }
};