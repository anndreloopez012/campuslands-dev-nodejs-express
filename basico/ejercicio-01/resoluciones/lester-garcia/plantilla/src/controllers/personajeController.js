import { obtenerPersonaje } from "../services/personajeService.js";

export function obtenerPersonajeController(req, res) {
  const personaje = obtenerPersonaje();

  res.json(personaje);
}
