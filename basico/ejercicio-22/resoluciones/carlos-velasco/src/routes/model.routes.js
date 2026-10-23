const express = require("express");
const {
  getModels,
  getModelById,
  createModel
} = require("../controllers/model.controller");

const router = express.Router();

router.get("/", getModels);
router.get("/:id", getModelById);
router.post("/", createModel);

module.exports = router;