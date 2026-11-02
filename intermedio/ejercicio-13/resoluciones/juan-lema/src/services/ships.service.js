import { getCaptainById } from "./captains.service.js";

const TYPES = ["carguero", "explorador", "caza", "crucero"];

const ships = [
  { id: 1, name: "Horizonte", type: "explorador", captainId: 1 },
  { id: 2, name: "Titan Gris", type: "carguero", captainId: 1 },
  { id: 3, name: "Aguja Solar", type: "caza", captainId: 2 },
];
let nextId = 4;

const withCaptain = (ship) => ({ ...ship, captain: getCaptainById(ship.captainId) });

const listShips = () => ships.map(withCaptain);
const listShipsByCaptain = (captainId) => ships.filter((s) => s.captainId === Number(captainId));

function getShipById(id) {
  const ship = ships.find((s) => s.id === Number(id));
  return ship ? withCaptain(ship) : null;
}

function createShip({ name, type, captainId }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!type || !TYPES.includes(type)) throw new Error(`type debe ser uno de: ${TYPES.join(", ")}`);
  if (!Number.isInteger(Number(captainId)) || !getCaptainById(captainId)) throw new Error(`captainId ${captainId} no corresponde a un capitan existente`);

  const ship = { id: nextId++, name: name.trim(), type, captainId: Number(captainId) };
  ships.push(ship);
  return withCaptain(ship);
}

export { listShips, listShipsByCaptain, getShipById, createShip };
