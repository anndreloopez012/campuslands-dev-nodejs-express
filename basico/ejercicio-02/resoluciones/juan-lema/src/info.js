import { readFile } from "node:fs/promises";

async function main() {
  const raw = await readFile(new URL("../package.json", import.meta.url), "utf-8");
  const pkg = JSON.parse(raw);

  console.log(`${pkg.name} v${pkg.version}`);
  console.log("\nScripts disponibles:");
  console.table(pkg.scripts);
}

main().catch((error) => {
  console.error(`Error leyendo package.json: ${error.message}`);
  process.exitCode = 1;
});
