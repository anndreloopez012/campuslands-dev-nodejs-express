let nextId = 1;
const jumps = [];

export const list = () => jumps;

export const add = (diverName, altitude) => {
  const errors = [];

  if (!diverName || typeof diverName !== "string" || !diverName.trim()) {
    errors.push("diverName es obligatorio");
  }

  if (altitude === undefined || typeof altitude !== "number" || altitude <= 0) {
    errors.push("altitude debe ser un número mayor a 0");
  }

  if (errors.length) return { errors };

  const jump = { id: nextId++, diverName: diverName.trim(), altitude, date: new Date().toISOString() };
  jumps.push(jump);
  return { data: jump };
};
