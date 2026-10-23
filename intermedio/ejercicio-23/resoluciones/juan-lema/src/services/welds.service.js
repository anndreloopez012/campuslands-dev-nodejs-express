import { PROCESS_NAMES, MATERIAL_NAMES, STATUSES, MIN_THICKNESS_MM, MAX_THICKNESS_MM, recommendParameters, canTransition } from "./welding-rules.js";

const welds = [{ id: 1, client: "Taller Ferrer", process: "MIG", material: "acero", thicknessMm: 3, amperage: 120, passes: 1, status: "pendiente" }];
let nextId = 2;

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}

const listWelds = () => welds;

function getWeldById(id) {
  if (!Number.isInteger(Number(id))) fail(400, "id debe ser numerico");

  const weld = welds.find((w) => w.id === Number(id));
  if (!weld) fail(404, `Soldadura con id ${id} no encontrada`);

  return weld;
}

function createWeld({ client, process, material, thicknessMm }) {
  if (typeof client !== "string" || !client.trim()) fail(400, "client es obligatorio");
  if (!PROCESS_NAMES.includes(process)) fail(400, `process debe ser uno de: ${PROCESS_NAMES.join(", ")}`);
  if (!MATERIAL_NAMES.includes(material)) fail(400, `material debe ser uno de: ${MATERIAL_NAMES.join(", ")}`);
  if (typeof thicknessMm !== "number" || !(thicknessMm >= MIN_THICKNESS_MM && thicknessMm <= MAX_THICKNESS_MM)) fail(400, `thicknessMm debe ser un numero entre ${MIN_THICKNESS_MM} y ${MAX_THICKNESS_MM}`);

  const weld = { id: nextId++, client: client.trim(), process, material, thicknessMm, ...recommendParameters({ process, material, thicknessMm }), status: "pendiente" };
  welds.push(weld);
  return weld;
}

function changeWeldStatus(id, status) {
  const weld = getWeldById(id);
  if (!STATUSES.includes(status)) fail(400, `status debe ser uno de: ${STATUSES.join(", ")}`);
  if (!canTransition(weld.status, status)) fail(409, `No se puede pasar de ${weld.status} a ${status}`);

  weld.status = status;
  return weld;
}

export { listWelds, getWeldById, createWeld, changeWeldStatus };
