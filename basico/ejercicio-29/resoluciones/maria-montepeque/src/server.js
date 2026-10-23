import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3029;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Liga Barrio API escuchando en http://localhost:${PORT}`);
});
