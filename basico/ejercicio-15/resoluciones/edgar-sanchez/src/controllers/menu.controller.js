import { findMenuItem, getMenu } from "../services/menu.service.js";
import { sendJson } from "../utils/http-response.js";

export function getRoot(_request, response) {
  sendJson(response, 200, {
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "mini API HTTP nativa"
  });
}

export function getHealth(_request, response) {
  sendJson(response, 200, {
    ok: true,
    message: "API de comida urbana activa"
  });
}

export async function listMenu(_request, response) {
  const menu = await getMenu();
  sendJson(response, 200, { ok: true, data: menu });
}

export async function getMenuItem(request, response, rawId) {
  const id = Number(rawId);

  if (!/^\d+$/.test(rawId) || !Number.isSafeInteger(id) || id < 1) {
    sendJson(response, 400, {
      ok: false,
      message: "El id debe ser un entero positivo"
    });
    return;
  }

  const item = await findMenuItem(id);

  if (!item) {
    sendJson(response, 404, {
      ok: false,
      message: "Producto no encontrado"
    });
    return;
  }

  sendJson(response, 200, { ok: true, data: item });
}