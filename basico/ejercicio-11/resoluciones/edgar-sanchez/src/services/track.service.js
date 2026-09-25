function loadTrack(title) {
  return new Promise((resolve, reject) => {
    if (typeof title !== "string" || !title.trim()) {
      reject(new Error("El titulo de la cancion es obligatorio"));
      return;
    }

    setTimeout(() => {
      resolve({ title: title.trim(), status: "lista para reproducir" });
    }, 25);
  });
}

export { loadTrack };
