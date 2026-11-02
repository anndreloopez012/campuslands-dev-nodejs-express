const fs = require("fs/promises");
const path = require("path");

const dataDirectory = path.join(__dirname, "../../data");
const motorcyclesFile = path.join(dataDirectory, "motorcycles.json");
const fichasDirectory = path.join(dataDirectory, "fichas");

async function getMotorcycles() {
  const fileContent = await fs.readFile(motorcyclesFile, "utf-8");

  return JSON.parse(fileContent);
}

async function getMotorcycleFicha(fileName) {
  if (!fileName || typeof fileName !== "string") {
    const error = new Error("Nombre de ficha invalido");
    error.statusCode = 400;
    throw error;
  }

  const safeFileName = path.basename(fileName);

  if (safeFileName !== fileName || safeFileName.includes("..")) {
    const error = new Error("Ruta de archivo no permitida");
    error.statusCode = 400;
    throw error;
  }

  const filePath = path.join(fichasDirectory, safeFileName);

  const fileContent = await fs.readFile(filePath, "utf-8");

  return {
    fileName: safeFileName,
    content: fileContent
  };
}

module.exports = {
  getMotorcycles,
  getMotorcycleFicha
};