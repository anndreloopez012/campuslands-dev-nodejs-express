const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findMovie(title, minutes) {
    if (!title || typeof title !== "string" || !title.trim()) {
        throw new Error("El titulo de la pelicula es obligatorio");
    }

    const duration = Number(minutes);
    if (!Number.isInteger(duration) || duration <= 0) {
        throw new Error("La duracion debe ser un numero entero de minutos mayor a 0");
    }

    await delay(300);
    return { title: title.trim(), duration };
}

async function getScareLevel(movie) {
    await delay(200);
    const level = movie.duration >= 120 ? "extremo" : movie.duration >= 90 ? "alto" : "moderado";
    return { scareLevel: level };
}

async function getShowtime(movie) {
    await delay(250);
    const endsAt = 22 * 60 + movie.duration;
    const hours = String(Math.floor(endsAt / 60) % 24).padStart(2, "0");
    const mins = String(endsAt % 60).padStart(2, "0");
    return { startsAt: "22:00", endsAt: `${hours}:${mins}` };
}

export { findMovie, getScareLevel, getShowtime };