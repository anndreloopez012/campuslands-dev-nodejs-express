import { MAX_RADIUS, shrinkZone } from "./zone.service.js";

try {
  const zone = shrinkZone(process.argv[2] ?? MAX_RADIUS);
  console.log(
    JSON.stringify(
      { ok: true, topic: "modulos ES Modules", ...zone },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}