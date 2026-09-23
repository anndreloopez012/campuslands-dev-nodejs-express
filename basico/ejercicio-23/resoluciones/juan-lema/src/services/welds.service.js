// Datos en memoria: viven solo mientras el proceso este activo.
// Se pierden al reiniciar el servidor (no hay persistencia a disco ni base de datos).
const welds = [
  { id: 1, material: "acero al carbono", technique: "MIG" },
  { id: 2, material: "aluminio", technique: "TIG" },
];
let nextId = 3;

function listWelds() {
  return welds;
}

function addWeld({ material, technique }) {
  if (!material || typeof material !== "string" || !material.trim()) {
    throw new Error("material es obligatorio");
  }
  if (!technique || typeof technique !== "string" || !technique.trim()) {
    throw new Error("technique es obligatorio");
  }

  const weld = { id: nextId++, material: material.trim(), technique: technique.trim() };
  welds.push(weld);
  return weld;
}

function removeWeld(id) {
  const index = welds.findIndex((w) => w.id === Number(id));
  if (index === -1) {
    return false;
  }
  welds.splice(index, 1);
  return true;
}

export { listWelds, addWeld, removeWeld };
