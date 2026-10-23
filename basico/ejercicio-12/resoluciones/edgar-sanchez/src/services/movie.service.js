const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function getMovie(title) {
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("El titulo de la pelicula es obligatorio");
  }

  await wait(25);

  return {
    title: title.trim(),
    genre: "terror",
    status: "disponible",
  };
}

export { getMovie };
