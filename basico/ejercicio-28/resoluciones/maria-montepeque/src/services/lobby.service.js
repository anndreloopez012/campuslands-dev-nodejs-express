function createLobbyService(config) {
    const squads = [];

    function describeMatch() {
        const phases = [100, 75, 50, 25, 10].map((radius, i) => ({ phase: i + 1, radius, closesInSeconds: config.ZONE_SHRINK_SECONDS * (i + 1) }));

        return {
            map: config.MAP_NAME,
            lobbySize: config.LOBBY_SIZE,
            regions: config.REGIONS,
            rankedEnabled: config.FEATURE_RANKED,
            zone: phases,
        };
    }

    function joinSquad(name, ranked) {
        if (ranked && !config.FEATURE_RANKED) return { disabled: "El modo ranked no esta habilitado en este entorno" };
        if (squads.length >= config.LOBBY_SIZE) return { full: `Lobby lleno (${config.LOBBY_SIZE} jugadores)` };

        const player = { slot: squads.length + 1, name, ranked: Boolean(ranked) };
        squads.push(player);
        return { player, remaining: config.LOBBY_SIZE - squads.length };
    }

    return { describeMatch, joinSquad };
}

export { createLobbyService };
