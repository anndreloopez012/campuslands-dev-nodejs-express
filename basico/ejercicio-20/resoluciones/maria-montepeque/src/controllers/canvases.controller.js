import { listCanvases, createCanvas, addLayer } from "../services/canvases.service.js";

function getCanvases(req, res) {
    const data = listCanvases();
    res.json({ ok: true, count: data.length, data });
}

function postCanvas(req, res) {
    const { errors, canvas } = createCanvas(req.body);
    if (errors) return res.status(400).json({ ok: false, message: "Lienzo invalido", errors });

    res.status(201).json({ ok: true, data: canvas });
}

function postLayer(req, res) {
    const { notFound, errors, canvas, layer } = addLayer(req.params.id, req.body);

    if (notFound) return res.status(404).json({ ok: false, message: `No existe el lienzo ${req.params.id}` });
    if (errors) return res.status(400).json({ ok: false, message: "Capa invalida", errors });

    res.status(201).json({ ok: true, canvas: canvas.title, totalLayers: canvas.layers.length, data: layer });
}

export { getCanvases, postCanvas, postLayer };
