const RESOLUTIONS = ["720p", "1080p", "4k"];

const renders = [
  { id: 1, scene: "Nave espacial - despegue", frames: 240, resolution: "1080p", status: "done" },
  { id: 2, scene: "Dragon sobre la ciudad", frames: 480, resolution: "4k", status: "queued" },
];
let nextId = 3;

const listRenders = () => renders;
const getRenderById = (id) => renders.find((r) => r.id === Number(id)) || null;

function createRender({ scene, frames, resolution = "1080p" }) {
  if (!scene || typeof scene !== "string" || !scene.trim()) throw new Error("scene es obligatorio");

  const numericFrames = Number(frames);
  if (!Number.isInteger(numericFrames) || numericFrames < 1 || numericFrames > 100_000) throw new Error("frames debe ser un entero entre 1 y 100000");
  if (!RESOLUTIONS.includes(resolution)) throw new Error(`resolution debe ser una de: ${RESOLUTIONS.join(", ")}`);

  const render = { id: nextId++, scene: scene.trim(), frames: numericFrames, resolution, status: "queued" };
  renders.push(render);
  return render;
}

export { listRenders, getRenderById, createRender };
