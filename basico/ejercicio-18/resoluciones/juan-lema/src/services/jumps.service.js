const jumps = [];
let nextId = 1;

function listJumps() {
  return jumps;
}

function createJump({ diverName, altitude }) {
  if (!diverName || typeof diverName !== "string" || !diverName.trim()) {
    throw new Error("diverName es obligatorio");
  }

  const numericAltitude = Number(altitude);
  if (!altitude || Number.isNaN(numericAltitude) || numericAltitude <= 0) {
    throw new Error("altitude debe ser un numero mayor a 0");
  }

  const jump = { id: nextId++, diverName: diverName.trim(), altitude: numericAltitude };
  jumps.push(jump);
  return jump;
}

export { listJumps, createJump };
