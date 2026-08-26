const brushes = [];
let nextId = 1;

function createBrush({ name, size }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }

  const numericSize = Number(size);
  if (!size || Number.isNaN(numericSize) || numericSize <= 0) {
    throw new Error("size debe ser un numero mayor a 0");
  }

  const brush = { id: nextId++, name: name.trim(), size: numericSize };
  brushes.push(brush);
  return brush;
}

export { createBrush };
