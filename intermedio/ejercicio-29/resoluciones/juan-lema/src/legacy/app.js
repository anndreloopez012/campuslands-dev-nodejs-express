import express from "express";

function createLegacyApp() {
  const app = express();
  app.use(express.json());

  let matches = [];
  let nextId = 1;

  app.get("/health", (req, res) => {
    res.json({ ok: true, message: "API de futbol activa" });
  });

  app.get("/matches", (req, res) => {
    let result = matches;

    if (req.query.modality !== undefined) {
      if (req.query.modality !== "futbol" && req.query.modality !== "futbol_sala") {
        res.status(400).json({ ok: false, code: "INVALID_QUERY", message: "modality debe ser una de: futbol, futbol_sala" });
        return;
      }
      const filtered = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].modality === req.query.modality) filtered.push(result[i]);
      }
      result = filtered;
    }

    if (req.query.status !== undefined) {
      if (req.query.status !== "programado" && req.query.status !== "en_juego" && req.query.status !== "finalizado") {
        res.status(400).json({ ok: false, code: "INVALID_QUERY", message: "status debe ser uno de: programado, en_juego, finalizado" });
        return;
      }
      const filtered2 = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].status === req.query.status) filtered2.push(result[i]);
      }
      result = filtered2;
    }

    const copies = [];
    for (let i = 0; i < result.length; i++) copies.push(Object.assign({}, result[i]));
    res.json({ ok: true, data: copies });
  });

  app.get("/matches/:id", (req, res) => {
    if (!/^[1-9][0-9]*$/.test(req.params.id)) {
      res.status(400).json({ ok: false, code: "INVALID_ID", message: "id debe ser un entero positivo" });
      return;
    }
    let found = null;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].id === Number(req.params.id)) found = matches[i];
    }
    if (!found) {
      res.status(404).json({ ok: false, code: "NOT_FOUND", message: "Partido " + req.params.id + " no encontrado" });
      return;
    }
    res.json({ ok: true, data: Object.assign({}, found) });
  });

  app.post("/matches", (req, res) => {
    const body = req.body || {};

    if (typeof body.homeTeam !== "string" || body.homeTeam.trim().length < 2 || body.homeTeam.trim().length > 40) {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "homeTeam debe tener entre 2 y 40 caracteres" });
      return;
    }
    if (typeof body.awayTeam !== "string" || body.awayTeam.trim().length < 2 || body.awayTeam.trim().length > 40) {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "awayTeam debe tener entre 2 y 40 caracteres" });
      return;
    }
    if (body.homeTeam.trim() === body.awayTeam.trim()) {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "homeTeam y awayTeam no pueden ser el mismo equipo" });
      return;
    }
    if (body.modality !== "futbol" && body.modality !== "futbol_sala") {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "modality debe ser una de: futbol, futbol_sala" });
      return;
    }

    const match = {
      id: nextId,
      homeTeam: body.homeTeam.trim(),
      awayTeam: body.awayTeam.trim(),
      modality: body.modality,
      status: "programado",
      homeScore: null,
      awayScore: null,
    };
    nextId = nextId + 1;
    matches.push(match);
    res.status(201);
    res.location("/matches/" + match.id);
    res.json({ ok: true, data: Object.assign({}, match) });
  });

  app.patch("/matches/:id/start", (req, res) => {
    if (!/^[1-9][0-9]*$/.test(req.params.id)) {
      res.status(400).json({ ok: false, code: "INVALID_ID", message: "id debe ser un entero positivo" });
      return;
    }
    let found = null;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].id === Number(req.params.id)) found = matches[i];
    }
    if (!found) {
      res.status(404).json({ ok: false, code: "NOT_FOUND", message: "Partido " + req.params.id + " no encontrado" });
      return;
    }
    if (found.status !== "programado") {
      res.status(409).json({ ok: false, code: "INVALID_TRANSITION", message: "Solo un partido programado puede iniciar" });
      return;
    }
    found.status = "en_juego";
    found.homeScore = 0;
    found.awayScore = 0;
    res.json({ ok: true, data: Object.assign({}, found) });
  });

  app.patch("/matches/:id/score", (req, res) => {
    if (!/^[1-9][0-9]*$/.test(req.params.id)) {
      res.status(400).json({ ok: false, code: "INVALID_ID", message: "id debe ser un entero positivo" });
      return;
    }
    let found = null;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].id === Number(req.params.id)) found = matches[i];
    }
    if (!found) {
      res.status(404).json({ ok: false, code: "NOT_FOUND", message: "Partido " + req.params.id + " no encontrado" });
      return;
    }
    if (found.status !== "en_juego") {
      res.status(409).json({ ok: false, code: "INVALID_TRANSITION", message: "Solo se puede anotar en un partido en_juego" });
      return;
    }
    const body = req.body || {};
    if (!Number.isInteger(body.homeScore) || body.homeScore < 0) {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "homeScore debe ser un entero mayor o igual a 0" });
      return;
    }
    if (!Number.isInteger(body.awayScore) || body.awayScore < 0) {
      res.status(400).json({ ok: false, code: "INVALID_BODY", message: "awayScore debe ser un entero mayor o igual a 0" });
      return;
    }
    found.homeScore = body.homeScore;
    found.awayScore = body.awayScore;
    res.json({ ok: true, data: Object.assign({}, found) });
  });

  app.patch("/matches/:id/finish", (req, res) => {
    if (!/^[1-9][0-9]*$/.test(req.params.id)) {
      res.status(400).json({ ok: false, code: "INVALID_ID", message: "id debe ser un entero positivo" });
      return;
    }
    let found = null;
    for (let i = 0; i < matches.length; i++) {
      if (matches[i].id === Number(req.params.id)) found = matches[i];
    }
    if (!found) {
      res.status(404).json({ ok: false, code: "NOT_FOUND", message: "Partido " + req.params.id + " no encontrado" });
      return;
    }
    if (found.status !== "en_juego") {
      res.status(409).json({ ok: false, code: "INVALID_TRANSITION", message: "Solo se puede finalizar un partido en_juego" });
      return;
    }
    found.status = "finalizado";
    res.json({ ok: true, data: Object.assign({}, found) });
  });

  app.use((req, res) => {
    res.status(404).json({ ok: false, code: "ROUTE_NOT_FOUND", message: "Ruta no encontrada" });
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    if (err && err.type === "entity.parse.failed") {
      res.status(400).json({ ok: false, code: "INVALID_JSON", message: "El cuerpo no es un JSON valido" });
      return;
    }
    console.error(err);
    res.status(500).json({ ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
  });

  return app;
}

export { createLegacyApp };
