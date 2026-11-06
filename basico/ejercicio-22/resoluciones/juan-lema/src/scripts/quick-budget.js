import { calculateRenderBudget } from "../services/render-budget.service.js";

// Demuestra que el servicio es reutilizable fuera de Express (sin req/res).
try {
  const budget = calculateRenderBudget({ width: 1920, height: 1080, complexity: "alta" });
  console.log("Presupuesto calculado desde script:");
  console.table(budget);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
