const controller = require('../controllers/dishes.controller');
const { sendJson } = require('../utils/http');

// Sin Express no hay router: definimos una tabla de rutas y la recorremos nosotros.
const routes = [
  { method: 'GET', path: '/health', handler: (req, res) => sendJson(res, 200, { ok: true, status: 'up' }) },
  { method: 'GET', path: '/basico/ejercicio-15', handler: controller.info },
  { method: 'GET', path: '/dishes', handler: controller.list },
  { method: 'GET', path: '/dishes/:id', handler: controller.detail },
  { method: 'POST', path: '/dishes', handler: controller.create },
];

// '/dishes/:id' -> { regex: /^\/dishes\/([^/]+)$/, keys: ['id'] }
function compile(path) {
  const keys = [];
  const pattern = path.replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  return { regex: new RegExp(`^${pattern}$`), keys };
}

const compiled = routes.map((route) => ({ ...route, ...compile(route.path) }));

function match(method, pathname) {
  const allowed = new Set();
  for (const route of compiled) {
    const result = route.regex.exec(pathname);
    if (!result) continue;
    if (route.method !== method) {
      allowed.add(route.method);
      continue;
    }
    const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(result[i + 1])]));
    return { handler: route.handler, params };
  }
  return { allowed: [...allowed] };
}

module.exports = { match };
