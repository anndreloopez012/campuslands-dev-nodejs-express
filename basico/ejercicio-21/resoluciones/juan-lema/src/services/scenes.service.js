const scenes = [
  { id: 1, name: "Intro espacial", frames: 240 },
  { id: 2, name: "Persecucion en ciudad", frames: 480 },
];
let nextId = 3;

function listScenes() {
  return scenes;
}

function getSceneById(id) {
  return scenes.find((s) => s.id === Number(id)) || null;
}

function createScene({ name, frames }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }

  const numericFrames = Number(frames);
  if (!frames || Number.isNaN(numericFrames) || numericFrames <= 0) {
    throw new Error("frames debe ser un numero mayor a 0");
  }

  const scene = { id: nextId++, name: name.trim(), frames: numericFrames };
  scenes.push(scene);
  return scene;
}

export { listScenes, getSceneById, createScene };
