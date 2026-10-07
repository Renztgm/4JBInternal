require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env variable: ${key}`);
}

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};