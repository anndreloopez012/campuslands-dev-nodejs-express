const MAX_STORM_LEVEL = 6;

function calculateStormDamage(playersRemaining, stormLevel) {
    if (!Number.isInteger(playersRemaining) || playersRemaining < 0) {
        throw new Error("Los jugadores restantes deben ser un numero entero mayor o igual a 0");
    }
    if (!Number.isInteger(stormLevel) || stormLevel < 1 || stormLevel > MAX_STORM_LEVEL) {
        throw new Error(`El nivel de tormenta debe ser un entero entre 1 y ${MAX_STORM_LEVEL}`);
    }

    const damagePerTick = stormLevel * 2;

    let risk = "Bajo";
    if (stormLevel >= 5) risk = "Critico";
    else if (stormLevel >= 3) risk = "Alto";
    else if (stormLevel >= 2) risk = "Moderado";

    return { playersRemaining, stormLevel, damagePerTick, risk };
}

export { MAX_STORM_LEVEL, calculateStormDamage };
export default calculateStormDamage;