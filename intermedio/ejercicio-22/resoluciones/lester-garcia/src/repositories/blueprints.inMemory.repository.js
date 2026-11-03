const inMemoryBlueprints = [
  {
    id: "BIM-01",
    projectName: "Torre Bioclimática Horizonte",
    architect: "Arq. Alejandro Aravena",
    scale: "1:100",
    fileMetadata: {
      originalName: "torre_horizonte_estructural.ifc",
      storedFileName: "1728900000000-torre-horizonte-estructural.ifc",
      extension: ".ifc",
      mimeType: "application/x-step",
      sizeBytes: 15728640,
      sizeMb: 15,
      checksumSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      storageUrl: "https://cdn.bim-arch3d.studio/models/1728900000000-torre-horizonte-estructural.ifc"
    },
    uploadedAt: "2026-10-14T10:00:00.000Z"
  }
];

export const findAllBlueprints = async () => [...inMemoryBlueprints];

export const findBlueprintById = async (id) => {
  const item = inMemoryBlueprints.find((b) => b.id === String(id));
  return item ? { ...item } : null;
};

export const saveBlueprint = async (data) => {
  const newItem = { ...data };
  inMemoryBlueprints.push(newItem);
  return { ...newItem };
};
