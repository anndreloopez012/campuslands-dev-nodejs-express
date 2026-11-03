import { parseArgs } from "node:util";

try {
  const { values } = parseArgs({
    options: {
      model: { type: "string", short: "m", default: "Aurora GT" },
      year: { type: "string", short: "y", default: "2024" },
    },
  });

  const model = values.model.trim();
  const year = Number(values.year);

  if (!model) {
    throw new Error("El modelo no puede estar vacio");
  }
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("El año debe ser un entero entre 1900 y 2100");
  }

  console.log(
    JSON.stringify(
      { ok: true, topic: "process.argv y CLI", car: { model, year } },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
