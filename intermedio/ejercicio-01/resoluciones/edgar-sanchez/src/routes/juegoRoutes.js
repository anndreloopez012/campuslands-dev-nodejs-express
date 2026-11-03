import { Router } from "express";
import { controladorJuegos } from "../controllers/juegoController.js";

export function crearEnrutadorJuegos() {
  const enrutador = Router();
  enrutador.get("/", controladorJuegos.listar);
  enrutador.get("/:id", controladorJuegos.obtenerPorId);
  enrutador.post("/", controladorJuegos.crear);
  enrutador.put("/:id", controladorJuegos.actualizar);
  enrutador.delete("/:id", controladorJuegos.eliminar);
  return enrutador;
}
