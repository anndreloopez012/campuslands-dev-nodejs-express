import express from "express";
import { crearEnrutadorJuegos } from "./routes/juegoRoutes.js";
import { manejarErrorGlobal } from "./middlewares/errorMiddleware.js";

export function crearAplicacion() {
  const aplicacion = express();
  aplicacion.use(express.json());

  aplicacion.get("/health", (peticion, respuesta) => {
    respuesta.json({ ok: true, message: "servicio activo", topic: "arquitectura por capas" });
  });

  aplicacion.use("/api/juegos", crearEnrutadorJuegos());

  aplicacion.use(manejarErrorGlobal);
  return aplicacion;
}
