// el controlador recibe el service de su app
function crearPersonajesController(service) {
    function list(req, res) {
        const data = service.findAll({ clase: req.query.clase });
        res.json({ ok: true, total: data.length, data });
    }

    function getOne(req, res) {
        const data = service.findById(Number(req.params.id));
        res.json({ ok: true, data });
    }

    function create(req, res) {
        const data = service.create(req.body);
        // Location dice donde quedo el recurso nuevo
        res.status(201).location(`/api/personajes/${data.id}`).json({ ok: true, data });
    }

    function subirNivel(req, res) {
        const data = service.subirNivel(Number(req.params.id));
        res.json({ ok: true, data });
    }

    function agregarItem(req, res) {
        const data = service.agregarItem(Number(req.params.id), req.body);
        res.status(201).json({ ok: true, data });
    }

    function remove(req, res) {
        service.remove(Number(req.params.id));
        res.status(204).send();
    }

    return { list, getOne, create, subirNivel, agregarItem, remove };
}

export { crearPersonajesController };
