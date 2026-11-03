const inMemoryRenderJobs = [
  {
    id: "RND-01",
    sceneName: "Mecha_Hangar_Explosion_v4.blend",
    animator: "Diego Villalobos",
    renderEngine: "Cycles",
    totalFrames: 240,
    samplesPerPixel: 512,
    status: "Renderizando",
    createdAt: "2026-10-12T09:00:00.000Z"
  },
  {
    id: "RND-02",
    sceneName: "Character_WalkCycle_Final.ma",
    animator: "Lucía Pineda",
    renderEngine: "Arnold",
    totalFrames: 120,
    samplesPerPixel: 256,
    status: "Completado",
    createdAt: "2026-10-13T15:30:00.000Z"
  }
];

export const findAllRenderJobs = async () => [...inMemoryRenderJobs];

export const findRenderJobById = async (id) => {
  const job = inMemoryRenderJobs.find((r) => r.id === String(id));
  return job ? { ...job } : null;
};

export const saveRenderJob = async (data) => {
  const newJob = { ...data };
  inMemoryRenderJobs.push(newJob);
  return { ...newJob };
};
