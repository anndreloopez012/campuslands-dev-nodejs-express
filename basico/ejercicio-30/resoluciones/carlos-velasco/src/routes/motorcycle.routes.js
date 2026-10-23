const express = require("express");
const motorcycleController = require("../controllers/motorcycle.controller");

const router = express.Router();

router.get("/", motorcycleController.getAll);
router.get("/:id", motorcycleController.getById);
router.post("/", motorcycleController.create);
router.put("/:id", motorcycleController.update);
router.delete("/:id", motorcycleController.remove);

module.exports = router;