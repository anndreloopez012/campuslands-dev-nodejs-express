const express = require("express");
const playerRoutes = require("../modules/players/player.routes");
const matchRoutes = require("../modules/matches/match.controller");

const router = express.Router();

// Registro de modulos: para agregar capacidad nueva basta sumar un modulo
// a esta lista (routes + service + store propios) sin tocar el resto.
const registeredModules = [
  { name: "players", mount: playerRoutes },
  { name: "matches", mount: matchRoutes },
];

const apiRouter = express.Router();

for (const { name, mount } of registeredModules) {
  apiRouter.use((req, res, next) => {
    req.moduleName = name;
    next();
  });
  apiRouter.use(`/api/${name}`, mount);
}

module.exports = { apiRouter, registeredModules };
