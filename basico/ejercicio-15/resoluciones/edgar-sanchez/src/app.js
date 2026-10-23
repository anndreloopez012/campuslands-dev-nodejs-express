import { resolveRoute } from "./routes/index.js";
import {
  sendInternalError,
  sendJson,
  sendMethodNotAllowed,
  sendNotFound
} from "./utils/http-response.js";

function normalizePath(pathname) {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

function getPathname(request) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  return normalizePath(requestUrl.pathname);
}

export function createApp() {
  return async function requestHandler(request, response) {
    let pathname;

    try {
      pathname = getPathname(request);
    } catch {
      sendJson(response, 400, {
        ok: false,
        message: "La URL solicitada no es válida"
      });
      return;
    }

    try {
      const method = (request.method ?? "GET").toUpperCase();
      const route = resolveRoute(method, pathname);

      if (!route) {
        sendNotFound(response, pathname);
        return;
      }

      if (!route.allowedMethods.includes(method)) {
        sendMethodNotAllowed(response, route.allowedMethods);
        return;
      }

      await route.handler(request, response, ...(route.args ?? []));
    } catch (error) {
      if (error instanceof URIError) {
        sendJson(response, 400, {
          ok: false,
          message: "La URL solicitada contiene caracteres no válidos"
        });
        return;
      }

      sendInternalError(response, error);
    }
  };
}

const app = createApp();

export default app;