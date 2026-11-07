const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const booksController = require('../controllers/books.controller');
const adminController = require('../controllers/admin.controller');

const router = Router();

// Publico
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Protegido: requiere sesion valida (Bearer token)
router.get('/libros', booksController.listarLibros);

// Protegido por rol: la verificacion del rol vive en el servicio
router.post('/libros', adminController.registrarLibro);

module.exports = router;
