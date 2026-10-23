import http from "node:http";
import { handleRequest } from "./app.js";

const PORT = process.env.PORT || 3018;

http.createServer(handleRequest).listen(PORT, () => {
    console.log(`Skydive Bookings API escuchando en http://localhost:${PORT}`);
});