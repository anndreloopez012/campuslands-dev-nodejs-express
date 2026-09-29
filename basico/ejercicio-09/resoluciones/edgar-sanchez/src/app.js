import { addFighter, listFighters } from "./services/fighters.service.js";

try {
  const [name, weight] = process.argv.slice(2);
  const created = name === undefined ? null : await addFighter({ name, weight });
  const fighters = await listFighters();

  console.log(
    JSON.stringify(
      { ok: true, topic: "JSON y persistencia simple", created, fighters },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error de persistencia: ${error.message}`);
  process.exitCode = 1;
}
