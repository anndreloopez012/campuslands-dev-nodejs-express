import { once } from "node:events";
import { SEED_USERS } from "../src/services/auth.service.js";

async function startApp(app) {
  const server = app.listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, { json, body, headers = {}, token } = {}) {
    const init = { method, headers: { ...headers } };

    if (json !== undefined) {
      init.body = JSON.stringify(json);
      init.headers["Content-Type"] ??= "application/json";
    } else if (body !== undefined) {
      init.body = body;
    }
    if (token) init.headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${baseUrl}${path}`, init);
    const text = await response.text();

    return { status: response.status, headers: response.headers, text, body: text ? JSON.parse(text) : undefined };
  }

  async function loginAs(username) {
    const { password } = SEED_USERS.find((user) => user.username === username);
    const { body } = await request("POST", "/auth/login", { json: { username, password } });
    return body.data.token;
  }

  async function close() {
    server.closeAllConnections();
    server.close();
    await once(server, "close");
  }

  return { baseUrl, request, loginAs, close };
}

export { startApp };
