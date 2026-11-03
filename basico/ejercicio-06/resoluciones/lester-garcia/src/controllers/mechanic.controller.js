import { getManualByModelService } from "../services/mechanic.service.js";

export const getManualController = async (req, res) => {
  try {
    const { model } = req.params;

    if (!model || model.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "El parámetro de modelo es obligatorio."
      });
    }

    // Aseguramos la extensión .json
    const filename = model.endsWith(".json") ? model : `${model}.json`;
    const manualData = await getManualByModelService(filename);

    return res.status(200).json({
      status: "success",
      data: manualData
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        status: "error",
        message: "El manual técnico del modelo especificado no existe."
      });
    }

    if (error.code === "FORBIDDEN") {
      return res.status(403).json({
        status: "error",
        message: error.message
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Error interno al procesar la ruta del archivo."
    });
  }
};