import { playRally } from "./services/rally.service.js";

try {
  const rally = await playRally(process.argv[2] ?? "Invitado");
  console.log(
    JSON.stringify(
      { ok: true, topic: "funciones asincronas", rally },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
