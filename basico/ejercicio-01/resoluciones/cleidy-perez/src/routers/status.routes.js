const { Router } = require("express");
const { getStatus, getHealth } = require("../controllers/status.controller");

const router = Router();

// Ruta de diagnóstico básica
router.get("/health", getHealth);

// Ruta principal del ejercicio
router.get("/status", getStatus);

module.exports = router;