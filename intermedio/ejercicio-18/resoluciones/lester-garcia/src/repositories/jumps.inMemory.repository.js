const inMemoryJumps = [
  {
    id: "1",
    jumpNumber: 1042,
    dropzone: "Dropzone Valle Bravo",
    exitAltitudeFeet: 15000,
    freefallSeconds: 60,
    parachuteModel: "Icarus Safire 3 149",
    skydiverId: "USR-SKYDIVER-01",
    createdAt: "2026-04-12T10:30:00.000Z"
  }
];

export const findAllJumps = async () => [...inMemoryJumps];

export const findJumpsBySkydiverId = async (skydiverId) => {
  return inMemoryJumps.filter((j) => j.skydiverId === String(skydiverId));
};

export const saveJump = async (jumpData) => {
  const newJump = { ...jumpData };
  inMemoryJumps.push(newJump);
  return { ...newJump };
};