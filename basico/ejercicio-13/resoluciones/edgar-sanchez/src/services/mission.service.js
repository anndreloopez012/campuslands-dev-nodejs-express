class MissionError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "MissionError";
    this.code = code;
  }
}

function findMission(name) {
  if (typeof name !== "string" || !name.trim()) {
    throw new MissionError("El nombre de la mision es obligatorio", "INVALID_NAME");
  }

  if (name.trim().toLowerCase() === "desconocida") {
    throw new MissionError("La mision no existe", "MISSION_NOT_FOUND");
  }

  return {
    name: name.trim(),
    destination: "Marte",
    status: "en curso",
  };
}

export { findMission };
