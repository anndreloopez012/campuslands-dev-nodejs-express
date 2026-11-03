const express = require("express");
const animationController = require("../controllers/animation.controller");

const router = express.Router();

router.get("/", animationController.getAnimations);
router.get("/:id", animationController.getAnimationById);
router.post("/", animationController.createAnimation);

module.exports = router;