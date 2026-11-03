// catalogo de peliculas de miedo
// los datos internos tienen Date, Set y BigInt (como saldrian de una base de datos)
// y campos privados que NUNCA deben salir en una exportacion

const BASE = [
    ["El Conjuro", "sobrenatural", 2013, "James Wan"],
    ["Hereditary", "psicologico", 2018, "Ari Aster"],
    ["It", "sobrenatural", 2017, "Andy Muschietti"],
    ["La Bruja", "folk", 2015, "Robert Eggers"],
    ["Midsommar", "folk", 2019, "Ari Aster"],
    ["El Exorcista", "sobrenatural", 1973, "William Friedkin"],
    ["Alien", "ciencia ficcion", 1979, "Ridley Scott"],
    ["Scream", "slasher", 1996, "Wes Craven"],
    ["Halloween", "slasher", 1978, "John Carpenter"],
    ["La Llorona", "folk", 2019, "Jayro Bustamante"]
];

export function crearCatalogo({ copias = 200 } = {}) {
    const peliculas = [];
    let version = 1;

    // repito la base para tener varios miles y probar exportaciones grandes
    for (let i = 0; i < BASE.length * copias; i++) {
        const [titulo, subgenero, anio, director] = BASE[i % BASE.length];
        const vuelta = Math.floor(i / BASE.length);
        peliculas.push({
            id: i + 1,
            titulo: vuelta === 0 ? titulo : `${titulo} ${vuelta + 1}`,
            subgenero,
            anio: anio + (vuelta % 5),
            director,
            estreno: new Date(Date.UTC(anio, i % 12, 13)),
            etiquetas: new Set(["miedo", subgenero]),
            taquillaUsd: BigInt(1_000_000 + i * 12345),
            calificacion: Math.round((5 + ((i * 7) % 50) / 10) * 10) / 10,
            // privados
            costoProduccionUsd: 5_000_000 + i,
            notasInternas: "contrato confidencial"
        });
    }

    return {
        todas: () => peliculas,
        version: () => version,
        // cualquier cambio sube la version: asi cambia el ETag y las exportaciones viejas no sirven
        calificar(id, calificacion) {
            const pelicula = peliculas.find((p) => p.id === id);
            if (!pelicula) return null;
            pelicula.calificacion = calificacion;
            version++;
            return pelicula;
        }
    };
}
