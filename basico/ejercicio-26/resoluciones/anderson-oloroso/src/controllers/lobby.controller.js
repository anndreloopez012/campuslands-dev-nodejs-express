import * as lobbyService from '../services/lobby.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'codigos de estado' });

export const listLobbies = (_req, res) => res.status(200).json({ ok: true, total: lobbyService.getLobbies().length, data: lobbyService.getLobbies() });

export const createLobby = (req, res) => {
  const { mapa, maxJugadores } = req.body;
  if (!mapa) return res.status(400).json({ ok: false, message: 'El campo mapa es obligatorio (400 Bad Request).' });
  const lobby = lobbyService.createLobby({ mapa, maxJugadores });
  return res.status(201).json({ ok: true, message: 'Lobby creado exitosamente (201 Created)', data: lobby });
};

export const joinPlayer = (req, res) => {
  try {
    const { jugador } = req.body;
    if (!jugador) return res.status(400).json({ ok: false, message: 'El campo jugador es requerido.' });
    const lobby = lobbyService.joinLobby(req.params.id, jugador);
    return res.status(200).json({ ok: true, message: 'Jugador unido al lobby', data: lobby });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const removeLobby = (req, res) => {
  try {
    lobbyService.deleteLobby(req.params.id);
    return res.status(204).send(); // 204 No Content
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
