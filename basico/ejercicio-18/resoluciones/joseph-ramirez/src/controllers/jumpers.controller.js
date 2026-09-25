const jumpersService = require("../services/jumpers.service");

function getJumpers(req, res) {
  const jumpers = jumpersService.getAllJumpers();

  res.status(200).json({
    ok: true,
    message: "Paracaidistas obtenidos correctamente",
    total: jumpers.length,
    data: jumpers
  });
}

function createJumper(req, res) {
  const { nombre, edad, experiencia, saltos, apto } = req.body;

  if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "El nombre es obligatorio y debe ser un texto"
    });
  }

  if (!Number.isInteger(edad) || edad <= 0) {
    return res.status(400).json({
      ok: false,
      message: "La edad debe ser un numero entero positivo"
    });
  }

  if (!experiencia || typeof experiencia !== "string" || experiencia.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "La experiencia es obligatoria y debe ser un texto"
    });
  }

  if (!Number.isInteger(saltos) || saltos < 0) {
    return res.status(400).json({
      ok: false,
      message: "La cantidad de saltos debe ser un numero entero mayor o igual a cero"
    });
  }

  if (typeof apto !== "boolean") {
    return res.status(400).json({
      ok: false,
      message: "El campo apto debe ser booleano"
    });
  }

  const newJumper = jumpersService.createJumper({
    nombre: nombre.trim(),
    edad,
    experiencia: experiencia.trim(),
    saltos,
    apto
  });

  res.status(201).json({
    ok: true,
    message: "Paracaidista creado correctamente",
    data: newJumper
  });
}

module.exports = {
  getJumpers,
  createJumper
};