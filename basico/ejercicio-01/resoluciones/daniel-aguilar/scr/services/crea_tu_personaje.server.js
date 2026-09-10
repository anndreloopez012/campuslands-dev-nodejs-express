const razas = ["negro", "indio", "judio", "latino", "alien"]
const clases = ["Mago", "Arquero", "minero", "espia", "caballero"]


const bonosPorClase = {
  Mago:      { inteligencia: 5, salud: 0 },
  Arquero:   { destreza: 5, salud: 0 },
  Minero:    { fuerza: 5, salud: 5 },
  Espía:     { destreza: 3, suerte: 2 },
  Caballero: { fuerza: 3, salud: 20 },
};

function statsBase() {
  return { fuerza: 5, destreza: 5, inteligencia: 5, suerte: 5, salud: 80 };
}




function crearPersonaje(nombre, raza, clase) {
  if (!nombre || typeof nombre !== "string") {
    throw new Error("El personaje necesita un nombre válido.");
  }
  if (!razas.includes(raza)) {
    throw new Error(`Raza no válida. Elige entre: ${razas.join(", ")}`);
  }
  if (!clases.includes(clase)) {
    throw new Error(`Clase no válida. Elige entre: ${clases.join(", ")}`);
  }

  


  const stats = statsBase();
  const bono = bonosPorClase[clase] || {};
  for (const key in bono) {
    stats[key] = (stats[key] || 0) + bono[key];
  }

  return {
    nombre,
    raza,
    clase,
    nivel: 1,
    experiencia: 0,
    stats,
  };
}

function crearPersonajeAleatorio(nombre) {
  const raza = razas[Math.floor(Math.random() * razas.length)];
  const clase = clases[Math.floor(Math.random() * clases.length)];
  return crearPersonaje(nombre, raza, clase);
}


export {crearPersonaje, crearPersonajeAleatorio};


