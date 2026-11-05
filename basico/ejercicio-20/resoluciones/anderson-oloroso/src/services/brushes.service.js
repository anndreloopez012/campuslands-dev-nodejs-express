let nextId = 1;
const brushes = [];

export const list = () => brushes;

export const create = (name, size, opacity) => {
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("name es obligatorio");
  }

  if (size === undefined || typeof size !== "number" || size <= 0) {
    errors.push("size debe ser un número mayor a 0");
  }

  if (opacity === undefined || typeof opacity !== "number" || opacity < 0 || opacity > 1) {
    errors.push("opacity debe ser un número entre 0 y 1");
  }

  if (errors.length) return { errors };

  const brush = { id: nextId++, name: name.trim(), size, opacity };
  brushes.push(brush);
  return { data: brush };
};
