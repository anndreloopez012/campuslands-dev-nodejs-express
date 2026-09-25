const express = require("express");

const {
  getMotorcycles,
  getMotorcycle,
  createMotorcycleController,
  updateMotorcycleController,
  deleteMotorcycleController
} = require("../controllers/motorcycles.controller");

const router = express.Router();

router.get("/", getMotorcycles);
router.get("/:id", getMotorcycle);
router.post("/", createMotorcycleController);
router.put("/:id", updateMotorcycleController);
router.delete("/:id", deleteMotorcycleController);

module.exports = router;