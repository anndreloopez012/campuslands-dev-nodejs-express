import { players } from '../data/players.js';
export function listPlayers() { return players.map((player) => ({ ...player })); }
export function findPlayer(id) { return listPlayers().find((player) => player.id === Number(id)); }
