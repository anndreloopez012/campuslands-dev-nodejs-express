import { findMission } from "./services/mission.service.js";

try {
  const mission = findMission(process.argv[2] ?? "Odisea");
  console.log(
    JSON.stringify(
      { ok: true, topic: "manejo de errores", mission },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        topic: "manejo de errores",
        error: {
          name: error.name,
          code: error.code ?? "INTERNAL_ERROR",
          message: error.message,
        },
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
