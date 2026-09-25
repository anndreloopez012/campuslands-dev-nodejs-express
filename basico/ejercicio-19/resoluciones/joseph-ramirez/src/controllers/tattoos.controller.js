const tattoosService = require("../services/tattoos.service");

function getTattoos(req, res) {
  const { estilo, artista, zona } = req.query;

  const tattoos = tattoosService.searchTattoos({
    estilo,
    artista,
    zona
  });

  res.status(200).json({
    ok: true,
    message: "Tatuajes obtenidos correctamente",
    total: tattoos.length,
    filtros: {
      estilo: estilo || null,
      artista: artista || null,
      zona: zona || null
    },
    data: tattoos
  });
}

function getTattooById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un numero entero positivo"
    });
  }

  const tattoo = tattoosService.getTattooById(id);

  if (!tattoo) {
    return res.status(404).json({
      ok: false,
      message: "Tatuaje no encontrado"
    });
  }

  res.status(200).json({
    ok: true,
    message: "Tatuaje encontrado correctamente",
    data: tattoo
  });
}

module.exports = {
  getTattoos,
  getTattooById
};