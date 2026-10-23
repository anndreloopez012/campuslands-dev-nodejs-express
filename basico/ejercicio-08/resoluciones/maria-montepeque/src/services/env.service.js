function loadRaceConfig() {
    const teamName = process.env.TEAM_NAME;
    if (!teamName || !teamName.trim()) {
        throw new Error("TEAM_NAME es obligatorio");
    }

    const topSpeed = Number(process.env.TOP_SPEED_KMH);
    if (!process.env.TOP_SPEED_KMH || !Number.isFinite(topSpeed) || topSpeed <= 0) {
        throw new Error("TOP_SPEED_KMH debe ser un numero mayor a 0");
    }

    const turboRaw = (process.env.TURBO_ENABLED || "").trim().toLowerCase();
    if (turboRaw !== "true" && turboRaw !== "false") {
        throw new Error("TURBO_ENABLED debe ser 'true' o 'false'");
    }
    const turboEnabled = turboRaw === "true";

    let category = "GT";
    if (topSpeed >= 400) category = "Hipercar";
    else if (topSpeed >= 300) category = "Superdeportivo";

    return { teamName: teamName.trim(), topSpeed, turboEnabled, category };
}

export { loadRaceConfig };