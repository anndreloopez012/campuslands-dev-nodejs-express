let ships = [
  { id: 1, nombre: 'USS Enterprise NCC-1701', clase: 'Constitución', faccion: 'Federación Unida de Planetas' },
  { id: 2, nombre: 'Millennium Falcon', clase: 'Carguero YT-1300', faccion: 'Alianza Rebelde' }
];

let crewMembers = [
  { id: 1, shipId: 1, nombre: 'James T. Kirk', rango: 'Capitán', especie: 'Humano' },
  { id: 2, shipId: 1, nombre: 'Spock', rango: 'Primer Oficial / Científico', especie: 'Vulcano' },
  { id: 3, shipId: 2, nombre: 'Han Solo', rango: 'Capitán / Contrabandista', especie: 'Humano' },
  { id: 4, shipId: 2, nombre: 'Chewbacca', rango: 'Copiloto / Mecánico', especie: 'Wookiee' }
];

export const getAllShips = () => {
  return ships.map(ship => ({
    ...ship,
    totalTripulantes: crewMembers.filter(c => c.shipId === ship.id).length
  }));
};

export const getShipWithCrew = (shipId) => {
  const ship = ships.find(s => s.id === Number(shipId));
  if (!ship) {
    const err = new Error(`Nave con ID ${shipId} no existe en los registros galácticos.`);
    err.statusCode = 404;
    throw err;
  }
  const crew = crewMembers.filter(c => c.shipId === Number(shipId));
  return { ...ship, tripulacion: crew };
};

export const assignCrewMember = (shipId, { nombre, rango, especie }) => {
  const ship = ships.find(s => s.id === Number(shipId));
  if (!ship) {
    const err = new Error(`Nave con ID ${shipId} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  const newMember = {
    id: crewMembers.length + 1,
    shipId: Number(shipId),
    nombre,
    rango: rango || 'Tripulante',
    especie: especie || 'Humano'
  };
  crewMembers.push(newMember);
  return newMember;
};
