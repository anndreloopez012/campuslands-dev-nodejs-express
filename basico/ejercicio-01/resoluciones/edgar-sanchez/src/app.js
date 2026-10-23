import { getRuntimeInfo, logExpedition } from "./services/runtime.service.js";

console.table(getRuntimeInfo());

try {
  console.table(logExpedition(process.argv[2] || 5));
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}