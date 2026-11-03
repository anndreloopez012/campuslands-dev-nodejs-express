import * as archivosService from "../services/archivos.service.js";

function listProyectos(req, res) {
    const data = archivosService.findProyectos();
    res.json({ ok: true, total: data.length, data });
}

// multer ya dejo los archivos en req.files
function subir(req, res) {
    const data = archivosService.guardar(Number(req.params.id), req.files);
    res.status(201).json({ ok: true, total: data.length, data });
}

function listArchivos(req, res) {
    const data = archivosService.findDelProyecto(Number(req.params.id));
    res.json({ ok: true, total: data.length, data });
}

function verInfo(req, res) {
    const archivo = archivosService.findArchivo(Number(req.params.id));
    res.json({ ok: true, data: archivosService.info(archivo) });
}

// devuelve el contenido tal cual se subio
function descargar(req, res) {
    const archivo = archivosService.findArchivo(Number(req.params.id));
    res.attachment(archivo.nombre);
    res.type(archivo.mimetype);
    res.send(archivo.buffer);
}

function borrar(req, res) {
    archivosService.remove(Number(req.params.id));
    res.status(204).send();
}

export { listProyectos, subir, listArchivos, verInfo, descargar, borrar };
