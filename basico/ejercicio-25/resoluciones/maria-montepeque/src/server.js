import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3025;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`RPG Guild API escuchando en http://localhost:${PORT}`);
});
