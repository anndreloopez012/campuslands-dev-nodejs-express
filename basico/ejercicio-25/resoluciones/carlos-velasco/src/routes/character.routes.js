const express = require("express");
const characterController = require("../controllers/character.controller");

const router = express.Router();

router.get("/", characterController.getAllCharacters);
router.get("/:id", characterController.getCharacterById);
router.post("/", characterController.createCharacter);
router.put("/:id", characterController.updateCharacter);
router.delete("/:id", characterController.deleteCharacter);

module.exports = router;