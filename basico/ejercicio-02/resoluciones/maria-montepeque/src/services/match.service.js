const REQUIRED_SCRIPTS = ["start", "dev", "info"];

function calculateMatchStats(killsArg, deathsArg) {
    const kills = Number(killsArg);
    const deaths = Number(deathsArg);

    if (!Number.isFinite(kills) || !Number.isFinite(deaths) || kills < 0 || deaths < 0) {
        throw new Error("Kills y deaths deben ser numeros mayores o iguales a 0");
    }

    const kd = deaths === 0 ? kills : kills / deaths;

    let rank = "Necesita practica";
    if (kd >= 3) rank = "Elite";
    else if (kd >= 1.5) rank = "Competitivo";
    else if (kd >= 1) rank = "Balanceado";

    return { kills, deaths, kd: Number(kd.toFixed(2)), rank };
}

function findMissingScripts(scripts = {}) {
    return REQUIRED_SCRIPTS.filter((name) => !scripts[name]);
}

export { calculateMatchStats, findMissingScripts };