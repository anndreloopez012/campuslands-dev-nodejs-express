const heroes = [
    { nombre: 'Ghost', rol: 'Attacker', dificultad: 'Media' },
    { nombre: 'Reaper', rol: 'Attacker', dificultad: 'Media' },
    { nombre: 'Urban', rol: 'Medic', dificultad: 'Alta' },
    { nombre: 'Angel', rol: 'Defender', dificultad: 'Baja' },
    { nombre: 'Carnage', rol: 'Defender', dificultad: 'Alta' }
];

function getChampion(teamName) {
    if (!teamName || typeof teamName !== 'string' || teamName.trim() === '') {
        throw new Error('Nombre de equipo requerido');
    }

    const selectedHero = heroes[Math.floor(Math.random() * heroes.length)];

    return {
        equipo: teamName.trim(),
        campeon: selectedHero.nombre,
        posicion: selectedHero.rol,
        dificultad: selectedHero.dificultad,
        fase: 'Draft Fase 1'
    };
}

module.exports = {
    getChampion,
    heroes
};
