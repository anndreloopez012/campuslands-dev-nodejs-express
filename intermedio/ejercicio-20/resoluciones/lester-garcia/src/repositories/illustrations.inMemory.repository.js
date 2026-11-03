const inMemoryIllustrations = [
  {
    id: "ART-01",
    title: "Samurái Neón Cibernético",
    artist: "Akira Takahashi",
    software: "Procreate",
    canvasResolution: "4096x4096",
    layersCount: 84,
    colorProfile: "Display P3",
    createdAt: "2026-10-10T18:20:00.000Z"
  },
  {
    id: "ART-02",
    title: "Bosque Bioluminiscente",
    artist: "Elena Ríos",
    software: "Clip Studio Paint",
    canvasResolution: "3840x2160",
    layersCount: 62,
    colorProfile: "sRGB",
    createdAt: "2026-10-14T11:15:00.000Z"
  }
];

export const findAllIllustrations = async () => [...inMemoryIllustrations];

export const findIllustrationById = async (id) => {
  const item = inMemoryIllustrations.find((i) => i.id === String(id));
  return item ? { ...item } : null;
};

export const saveIllustration = async (data) => {
  const newItem = { ...data };
  inMemoryIllustrations.push(newItem);
  return { ...newItem };
};
