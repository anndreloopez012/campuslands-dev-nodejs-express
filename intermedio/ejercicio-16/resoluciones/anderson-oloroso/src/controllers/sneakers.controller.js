import * as sneakerService from '../services/sneakers.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'rutas protegidas' });

export const getDrops = (_req, res) => res.status(200).json({ ok: true, tipo: 'Lanzamientos Públicos', total: sneakerService.getPublicDrops().length, data: sneakerService.getPublicDrops() });

export const getVault = (_req, res) => res.status(200).json({ ok: true, tipo: 'Bóveda Exclusiva VIP Protegida', total: sneakerService.getVaultExclusives().length, data: sneakerService.getVaultExclusives() });
