const JUMP_TYPES = ['tandem', 'solo', 'aff', 'wingsuit'];

const jumps = [
  { id: 1, jumper: 'Carla Mendez', type: 'tandem', altitudeFt: 13000, createdAt: '2026-01-10T15:00:00.000Z' },
];

function validateJump(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['El cuerpo debe ser un objeto JSON'];
  if (typeof data.jumper !== 'string' || data.jumper.trim().length < 2) errors.push('jumper debe tener al menos 2 caracteres');
  if (!JUMP_TYPES.includes(data.type)) errors.push(`type debe ser uno de: ${JUMP_TYPES.join(', ')}`);
  if (!Number.isInteger(data.altitudeFt) || data.altitudeFt < 3000 || data.altitudeFt > 18000) {
    errors.push('altitudeFt debe ser un entero entre 3000 y 18000');
  }
  return errors;
}

const listJumps = () => jumps;
const getJump = (id) => jumps.find((jump) => jump.id === id) || null;

function createJump(data) {
  const jump = {
    id: jumps.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    jumper: data.jumper.trim(),
    type: data.type,
    altitudeFt: data.altitudeFt,
    createdAt: new Date().toISOString(),
  };
  jumps.push(jump);
  return jump;
}

module.exports = { JUMP_TYPES, validateJump, listJumps, getJump, createJump };
