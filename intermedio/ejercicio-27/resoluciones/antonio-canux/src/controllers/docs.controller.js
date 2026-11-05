import { endpointsDocs } from '../docs/endpoints.docs.js';

export const getDocs = (req, res) => {
  res.status(200).json({ ok: true, total: endpointsDocs.length, data: endpointsDocs });
};
