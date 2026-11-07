"use strict";
const app = require("./app");
const server = app.listen(process.env.PORT || 3000);
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  process.env.APP_DRAINING = "true";
  const timeout = setTimeout(() => process.exit(1), 10000);
  timeout.unref();
  server.close(() => {
    clearTimeout(timeout);
    process.exit(0);
  });
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
