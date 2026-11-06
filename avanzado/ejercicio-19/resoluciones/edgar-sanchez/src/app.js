import express from "express";

export function crearAplicacion() {
  const aplicacion = express();
  aplicacion.use(express.json());

  aplicacion.get("/health", (peticion, respuesta) => {
    respuesta.json({ ok: true, message: "ejercicio ejecutado correctamente", topic: "auditoria de acciones", level: "avanzado", exercise: 19 });
  });

  aplicacion.get("/api/recurso", (peticion, respuesta) => {
    respuesta.json({ ok: true, data: [{ id: "1", nombre: "elemento demo", tema: "auditoria de acciones" }] });
  });

  aplicacion.post("/api/recurso", (peticion, respuesta) => {
    const nombre = peticion.body?.nombre;
    if (!nombre) return respuesta.status(400).json({ ok: false, message: "nombre es obligatorio" });
    respuesta.status(201).json({ ok: true, data: { id: "2", nombre } });
  });

  return aplicacion;
}
