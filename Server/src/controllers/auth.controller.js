const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { jwtSecret, jwtExpiresIn } = require("../config/env");

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // same message for both cases so attackers can't tell which was wrong
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token: signToken(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};