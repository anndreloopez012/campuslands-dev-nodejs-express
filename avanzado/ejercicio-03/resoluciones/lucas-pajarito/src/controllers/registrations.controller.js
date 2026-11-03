import { listRegistrations, createRegistration } from "../services/registrations.service.js";

function getRegistrations(req, res) {
  res.status(200).json({ ok: true, data: listRegistrations() });
}

function postRegistration(req, res) {
  const created = createRegistration(req.validatedBody);
  res.status(201).json({ ok: true, data: created });
}

export { getRegistrations, postRegistration };
