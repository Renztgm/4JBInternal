const router = require("express").Router();
const auth = require("../middleware/auth");
const role = require("../middleware/roles");
const c = require("../controllers/employee.controller");

router.use(auth, role("ADMIN", "HR"));
router.get("/", c.list);
router.post("/", c.create);
router.patch("/:id", c.update);

module.exports = router;