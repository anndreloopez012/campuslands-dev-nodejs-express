import { readService } from "./services/service.service.js";

try {
  const service = await readService(process.argv[2] ?? "service-01");
  console.log(
    JSON.stringify(
      { ok: true, topic: "path y rutas seguras", service },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error al leer la ruta: ${error.message}`);
  process.exitCode = 1;
}
