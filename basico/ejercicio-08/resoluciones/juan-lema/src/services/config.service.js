function loadConfig() {
  const trackName = process.env.TRACK_NAME;
  const maxSpeed = Number(process.env.MAX_SPEED);

  if (!trackName || !trackName.trim()) {
    throw new Error("TRACK_NAME es obligatorio");
  }
  if (!process.env.MAX_SPEED || Number.isNaN(maxSpeed) || maxSpeed <= 0) {
    throw new Error("MAX_SPEED debe ser un numero mayor a 0");
  }

  return { trackName: trackName.trim(), maxSpeed };
}

export { loadConfig };
