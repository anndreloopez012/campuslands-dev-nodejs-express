const foodService = require('../services/food.service');

const getFoods = (req, res) => {
  const foods = foodService.getFoods();

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      ok: true,
      message: 'Comidas obtenidas correctamente',
      topic: 'mini API HTTP nativa',
      data: foods
    })
  );
};

const getFoodById = (req, res, id) => {
  const foodId = Number(id);

  if (!Number.isInteger(foodId) || foodId <= 0) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');

    res.end(
      JSON.stringify({
        ok: false,
        message: 'El identificador debe ser un numero entero positivo'
      })
    );

    return;
  }

  const food = foodService.getFoodById(foodId);

  if (!food) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');

    res.end(
      JSON.stringify({
        ok: false,
        message: 'Comida no encontrada'
      })
    );

    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');

  res.end(
    JSON.stringify({
      ok: true,
      message: 'Comida obtenida correctamente',
      topic: 'mini API HTTP nativa',
      data: food
    })
  );
};

const createFood = (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const data = JSON.parse(body);

      const food = foodService.createFood(data);

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');

      res.end(
        JSON.stringify({
          ok: true,
          message: 'Comida creada correctamente',
          topic: 'mini API HTTP nativa',
          data: food
        })
      );
    } catch (error) {
      res.statusCode = error.statusCode || 500;
      res.setHeader('Content-Type', 'application/json');

      res.end(
        JSON.stringify({
          ok: false,
          message: error.message || 'Error interno del servidor'
        })
      );
    }
  });
};

module.exports = {
  getFoods,
  getFoodById,
  createFood
};