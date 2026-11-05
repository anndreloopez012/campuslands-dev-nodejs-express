// Servicio reutilizable para simulación de suministros
const LEGENDARY_WEAPONS = ['AWM Sniper .300 Magnum', 'Groza 7.62mm', 'Mk14 EBR', 'M249 LMG'];
const GEAR = ['Casco Nivel 3 (Spetsnaz)', 'Chaleco Táctico Nivel 3', 'Mochila Militar Nivel 3'];
const MEDICALS = ['Kit de Primeros Auxilios', 'Jeringa de Adrenalina', 'Bebida Energética x2'];

export function generateAirdrop(coordX, coordY) {
  if (coordX === undefined || coordY === undefined) {
    const error = new Error('Las coordenadas X e Y son requeridas para lanzar el airdrop.');
    error.statusCode = 400;
    throw error;
  }

  const weapon = LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)];
  const gear = GEAR[Math.floor(Math.random() * GEAR.length)];
  const medical = MEDICALS[Math.floor(Math.random() * MEDICALS.length)];

  return {
    idCaja: `DROP-${Math.floor(1000 + Math.random() * 9000)}`,
    ubicacion: { x: Number(coordX), y: Number(coordY) },
    humo: 'Rojo bengala activo',
    botin: {
      armaMitica: weapon,
      armadura: gear,
      suministroMedico: medical
    },
    tiempoDespliegue: new Date().toISOString()
  };
}
