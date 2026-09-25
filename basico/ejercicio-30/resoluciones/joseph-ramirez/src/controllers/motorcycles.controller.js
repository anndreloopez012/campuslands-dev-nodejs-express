const {
    getAllMotorcycles,
    getMotorcycleById,
    createMotorcycle,
    updateMotorcycle,
    deleteMotorcycle
  } = require("../services/motorcycles.service");
  
  const validTypes = [
    "Naked",
    "Deportiva",
    "Adventure",
    "Cruiser",
    "Scooter"
  ];
  
  const validStates = [
    "disponible",
    "en_mantenimiento"
  ];
  
  function validateMotorcycleData(data) {
    const {
      marca,
      modelo,
      anio,
      cilindrada,
      tipo,
      estado
    } = data;
  
    if (
      typeof marca !== "string" ||
      marca.trim() === ""
    ) {
      return "La marca es obligatoria";
    }
  
    if (
      typeof modelo !== "string" ||
      modelo.trim() === ""
    ) {
      return "El modelo es obligatorio";
    }
  
    if (
      !Number.isInteger(anio) ||
      anio < 1900
    ) {
      return "El anio debe ser un numero entero valido";
    }
  
    if (
      !Number.isInteger(cilindrada) ||
      cilindrada <= 0
    ) {
      return "La cilindrada debe ser un numero entero positivo";
    }
  
    if (!validTypes.includes(tipo)) {
      return "El tipo de moto no es valido";
    }
  
    if (!validStates.includes(estado)) {
      return "El estado de la moto no es valido";
    }
  
    return null;
  }
  
  function getMotorcycles(req, res) {
    const motorcycles = getAllMotorcycles();
  
    return res.status(200).json({
      ok: true,
      data: motorcycles
    });
  }
  
  function getMotorcycle(req, res) {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "El ID debe ser un numero entero positivo"
      });
    }
  
    const motorcycle = getMotorcycleById(id);
  
    if (!motorcycle) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Moto no encontrada"
      });
    }
  
    return res.status(200).json({
      ok: true,
      data: motorcycle
    });
  }
  
  function createMotorcycleController(req, res) {
    const error = validateMotorcycleData(req.body);
  
    if (error) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: error
      });
    }
  
    const motorcycle = createMotorcycle(req.body);
  
    return res.status(201).json({
      ok: true,
      message: "Moto creada correctamente",
      data: motorcycle
    });
  }
  
  function updateMotorcycleController(req, res) {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "El ID debe ser un numero entero positivo"
      });
    }
  
    const existingMotorcycle = getMotorcycleById(id);
  
    if (!existingMotorcycle) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Moto no encontrada"
      });
    }
  
    const updatedData = {
      ...existingMotorcycle,
      ...req.body
    };
  
    const error = validateMotorcycleData(updatedData);
  
    if (error) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: error
      });
    }
  
    const motorcycle = updateMotorcycle(id, req.body);
  
    return res.status(200).json({
      ok: true,
      message: "Moto actualizada correctamente",
      data: motorcycle
    });
  }
  
  function deleteMotorcycleController(req, res) {
    const id = Number(req.params.id);
  
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        status: 400,
        message: "El ID debe ser un numero entero positivo"
      });
    }
  
    const motorcycle = deleteMotorcycle(id);
  
    if (!motorcycle) {
      return res.status(404).json({
        ok: false,
        status: 404,
        message: "Moto no encontrada"
      });
    }
  
    return res.status(200).json({
      ok: true,
      message: "Moto eliminada correctamente",
      data: motorcycle
    });
  }
  
  module.exports = {
    getMotorcycles,
    getMotorcycle,
    createMotorcycleController,
    updateMotorcycleController,
    deleteMotorcycleController
  };