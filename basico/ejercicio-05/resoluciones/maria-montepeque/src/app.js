import { getTeamStats } from "./services/teams.service.js";

try {
    console.table(getTeamStats(process.argv[2] || "Los Halcones"));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}