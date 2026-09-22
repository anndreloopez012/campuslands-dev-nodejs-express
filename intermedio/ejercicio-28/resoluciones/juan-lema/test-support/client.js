import { once } from "node:events";

async function startApp(app) {
  const server = app.listen(0);
  await once(server, "listening");
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, { json, body, headers = {} } = {}) {
    const init = { method, headers: { ...headers } };

    if (json !== undefined) {
      init.body = JSON.stringify(json);
      init.headers["Content-Type"] ??= "application/json";
    } else if (body !== undefined) {
      init.body = body;
    }

    const response = await fetch(`${baseUrl}${path}`, init);
    const text = await response.text();
    const isJson = response.headers.get("content-type")?.includes("application/json") ?? false;

    return { status: response.status, headers: response.headers, text, body: isJson ? JSON.parse(text) : text };
  }

  async function close() {
    server.closeAllConnections();
    server.close();
    await once(server, "close");
  }

  return { baseUrl, request, close };
}

export { startApp };
