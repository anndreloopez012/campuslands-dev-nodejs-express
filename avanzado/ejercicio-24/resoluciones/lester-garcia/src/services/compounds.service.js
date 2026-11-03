import * as repo from "../repositories/compounds.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "API Laboratorio de Fórmulas Químicas",
    version: "1.0.0",
    description: "Especificación OpenAPI 3.0 construida manualmente para el registro estequiométrico de compuestos."
  },
  paths: {
    "/api/v1/compounds": {
      get: {
        summary: "Listar compuestos químicos e incluir especificación OpenAPI",
        responses: { "200": { description: "Catálogo de fórmulas químicas y documento OpenAPI" } }
      },
      post: {
        summary: "Registrar nueva fórmula química",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["formula", "iupacName", "molarMassGmol"],
                properties: {
                  formula: { type: "string", example: "NaCl" },
                  iupacName: { type: "string", example: "Cloruro de sodio" },
                  molarMassGmol: { type: "number", example: 58.44 }
                }
              }
            }
          }
        },
        responses: { "201": { description: "Compuesto registrado" }, "400": { description: "Error de validación" } }
      }
    }
  }
};

export const listItemsService = async () => ({
  openApiDocument: openApiSpec,
  compounds: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El compuesto químico '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.formula || !payload.iupacName || payload.molarMassGmol === undefined) {
    throw new BadRequestError("Se requiere 'formula', 'iupacName' y 'molarMassGmol' según el contrato OpenAPI 3.0.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `CHM-0${all.length + 1}`,
    formula: payload.formula.trim(),
    iupacName: payload.iupacName.trim(),
    molarMassGmol: Number(payload.molarMassGmol),
    hazardClass: payload.hazardClass || "Estándar"
  });
};
