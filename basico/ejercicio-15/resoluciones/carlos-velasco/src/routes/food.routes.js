const foodController = require('../controllers/food.controller');

const handleRoutes = (req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host}`
  );

  if (req.method === 'GET' && url.pathname === '/health') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');

    res.end(
      JSON.stringify({
        ok: true,
        message: 'Servidor funcionando correctamente',
        topic: 'mini API HTTP nativa'
      })
    );

    return true;
  }

  if (
    req.method === 'GET' &&
    url.pathname === '/foods'
  ) {
    foodController.getFoods(req, res);

    return true;
  }

  if (
    req.method === 'GET' &&
    /^\/foods\/\d+$/.test(url.pathname)
  ) {
    const id = url.pathname.split('/')[2];

    foodController.getFoodById(req, res, id);

    return true;
  }

  if (
    req.method === 'POST' &&
    url.pathname === '/foods'
  ) {
    foodController.createFood(req, res);

    return true;
  }

  return false;
};

module.exports = handleRoutes;