import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.join(__dirname, '..', 'docs', 'openapi.json');

let tournaments = [
  { id: 1, nombre: 'Worlds Championship 2026', region: 'Internacional', premioUSD: 2225000, equiposParticipantes: 22 },
  { id: 2, nombre: 'Mid-Season Invitational (MSI)', region: 'Internacional', premioUSD: 250000, equiposParticipantes: 12 },
  { id: 3, nombre: 'LCK Split de Verano', region: 'Corea del Sur', premioUSD: 300000, equiposParticipantes: 10 }
];

export const getHealth = (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'documentacion de endpoints',
    docsEndpoint: '/api/docs'
  });
};

export const getOpenApiDocs = (_req, res) => {
  const fileData = fs.readFileSync(openApiPath, 'utf-8');
  return res.status(200).json(JSON.parse(fileData));
};

export const listTournaments = (_req, res) => {
  return res.status(200).json({
    ok: true,
    total: tournaments.length,
    data: tournaments
  });
};

export const createTournament = (req, res) => {
  const { nombre, region, premioUSD } = req.body;
  if (!nombre || !region || premioUSD === undefined) {
    return res.status(400).json({
      ok: false,
      message: 'Los campos nombre, region y premioUSD son obligatorios.'
    });
  }
  const nuevo = {
    id: tournaments.length + 1,
    nombre,
    region,
    premioUSD: Number(premioUSD),
    equiposParticipantes: 16
  };
  tournaments.push(nuevo);
  return res.status(201).json({
    ok: true,
    message: 'Torneo registrado en el calendario competitivo',
    data: nuevo
  });
};
