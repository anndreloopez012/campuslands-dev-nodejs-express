// reglas del RPG (funciones puras, faciles de probar con tests unitarios)

export const CLASES = {
    guerrero: { vida: 120, ataque: 14, defensa: 8 },
    mago: { vida: 80, ataque: 20, defensa: 3 },
    arquero: { vida: 95, ataque: 16, defensa: 5 }
};

export const OBJETOS = {
    "espada-larga": { clases: ["guerrero"], ataque: 6 },
    "baculo-arcano": { clases: ["mago"], ataque: 9 },
    "arco-elfico": { clases: ["arquero"], ataque: 7 },
    "escudo-roble": { clases: ["guerrero", "arquero"], defensa: 5 },
    "tunica-runica": { clases: ["mago"], defensa: 3 }
};

export const MONSTRUOS = {
    slime: { vida: 30, ataque: 6, defensa: 1, xp: 40 },
    lobo: { vida: 55, ataque: 12, defensa: 4, xp: 90 },
    golem: { vida: 160, ataque: 22, defensa: 12, xp: 300 }
};

// xp que hace falta para pasar del nivel n al n+1
export const xpParaSubir = (nivel) => 100 * nivel;

// suma xp y sube los niveles que toque (puede subir varios de una)
export function ganarExperiencia(personaje, xp) {
    let { nivel, experiencia } = personaje;
    experiencia += xp;
    let subidas = 0;
    while (experiencia >= xpParaSubir(nivel)) {
        experiencia -= xpParaSubir(nivel);
        nivel++;
        subidas++;
    }
    return { ...personaje, nivel, experiencia, vidaMax: personaje.vidaMax + subidas * 10, ataque: personaje.ataque + subidas * 2 };
}

// stats con lo que tiene equipado
export function statsTotales(p) {
    return p.equipo.reduce((t, id) => ({ ataque: t.ataque + (OBJETOS[id].ataque ?? 0), defensa: t.defensa + (OBJETOS[id].defensa ?? 0) }), { ataque: p.ataque, defensa: p.defensa });
}

// dano = ataque + dado(0..5) - defensa, minimo 1
export const dano = (ataque, defensa, aleatorio) => Math.max(1, ataque + Math.floor(aleatorio() * 6) - defensa);

// pelea por turnos, el personaje pega primero. Maximo 50 turnos
export function pelear(personaje, monstruo, aleatorio = Math.random) {
    const stats = statsTotales(personaje);
    let vidaP = personaje.vidaMax;
    let vidaM = monstruo.vida;
    const turnos = [];
    for (let turno = 1; turno <= 50 && vidaP > 0 && vidaM > 0; turno++) {
        const golpe = dano(stats.ataque, monstruo.defensa, aleatorio);
        vidaM -= golpe;
        let recibido = 0;
        if (vidaM > 0) {
            recibido = dano(monstruo.ataque, stats.defensa, aleatorio);
            vidaP -= recibido;
        }
        turnos.push({ turno, golpe, recibido, vidaPersonaje: Math.max(0, vidaP), vidaMonstruo: Math.max(0, vidaM) });
    }
    return { gano: vidaM <= 0, turnos };
}
