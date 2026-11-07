const express = require("express");
const controller = require("../controllers/character.controller");

const v1Router = express.Router();
const v2Router = express.Router();

v1Router.use(controller.registerVersion);
v2Router.use(controller.registerVersion);

v1Router.get("/characters", controller.getCharacters);
v1Router.get("/characters/:id", controller.getCharacterById);

v2Router.get("/characters", controller.getCharacters);
v2Router.get("/characters/:id", controller.getCharacterById);

module.exports = { v1Router, v2Router };
