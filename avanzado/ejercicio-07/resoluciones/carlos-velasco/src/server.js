"use strict";
const app = require("./app");
const server = app.listen(process.env.PORT || 3000);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
