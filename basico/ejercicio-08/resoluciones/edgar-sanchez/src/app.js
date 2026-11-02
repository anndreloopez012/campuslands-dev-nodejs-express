try {
  const model = (process.env.HYPERCAR_MODEL ?? "Apex R").trim();
  const year = Number(process.env.HYPERCAR_YEAR ?? 2025);
  const price = Number(process.env.HYPERCAR_PRICE ?? 250000);

  if (!model) {
    throw new Error("HYPERCAR_MODEL no puede estar vacio");
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error("HYPERCAR_YEAR debe ser un entero entre 2000 y 2100");
  }
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("HYPERCAR_PRICE debe ser un numero mayor que 0");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        topic: "variables de entorno",
        hypercar: { model, year, price },
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
