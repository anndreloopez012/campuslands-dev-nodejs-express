import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3023;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Weld Stock API escuchando en http://localhost:${PORT}`);
});
