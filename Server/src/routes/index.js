const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/employees", require("./employee.routes"));
router.use("/payroll", require("./payroll.routes"));
router.use("/payslips", require("./payslip.routes"));

module.exports = router;