const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/roles");
const c = require("../controllers/payroll.controller");

router.use(auth);

router.get("/runs", role("ADMIN", "HR"), c.listRuns);
router.post("/runs", role("ADMIN", "HR"), c.createRun);
router.get("/runs/:id", role("ADMIN", "HR"), c.getRun);
router.delete("/runs/:id", role("ADMIN", "HR"), c.deleteDraft);
router.post("/payslips/:payslipId/items", role("ADMIN", "HR"), c.addItem);

// Separation of duties: only ADMIN approves and pays
router.post("/runs/:id/approve", role("ADMIN"), c.approve);
router.post("/runs/:id/pay", role("ADMIN"), c.markPaid);

module.exports = router;