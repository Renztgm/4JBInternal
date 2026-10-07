const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/payslip.controller");

router.get("/me", auth, c.mine);

module.exports = router;