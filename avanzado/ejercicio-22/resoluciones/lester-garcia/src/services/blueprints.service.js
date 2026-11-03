import * as repo from "../repositories/blueprints.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
import crypto from "node:crypto";

const webhookDeliveries = [];

export const dispatchSimulatedWebhook = (eventType, data) => {
  const secret = process.env.WEBHOOK_SECRET || "bim_arch3d_secret_key_2026";
  const bodyString = JSON.stringify({ eventType, data });
  const signature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");

  const delivery = {
    deliveryId: `WH-0${webhookDeliveries.length + 1}`,
    targetUrl: "https://render-cloud.arquitectura3d.local/webhooks/bim",
    eventType,
    headers: {
      "Content-Type": "application/json",
      "X-BIM-Webhook-Signature": `sha256=${signature}`
    },
    payload: data,
    deliveredAt: new Date().toISOString()
  };
  webhookDeliveries.push(delivery);
  return delivery;
};

export const listItemsService = async () => ({
  blueprints: await repo.findAll(),
  webhookDeliveries: [...webhookDeliveries]
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El modelo arquitectónico 3D '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (!payload.project || !payload.format) {
    throw new BadRequestError("Se requiere 'project' y 'format' (ej. IFC4, RVT, DWG).");
  }
  const all = await repo.findAll();
  const saved = await repo.save({
    id: `BIM-0${all.length + 1}`,
    project: payload.project.trim(),
    format: payload.format.trim().toUpperCase(),
    structuralStatus: payload.structuralStatus || "APPROVED"
  });
  const webhookReceipt = dispatchSimulatedWebhook("bim.blueprint.approved", saved);
  return { blueprint: saved, webhookReceipt };
};
