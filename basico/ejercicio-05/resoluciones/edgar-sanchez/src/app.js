import { getPlayerById } from "./services/players.service.js";

try {
  const player = await getPlayerById(process.argv[2] ?? 1);
  console.log(
    JSON.stringify(
      { ok: true, topic: "fs para leer archivos", player },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error al leer jugadores: ${error.message}`);
  process.exitCode = 1;
}