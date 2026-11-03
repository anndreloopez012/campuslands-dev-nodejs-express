import { Router } from "express";
import { autenticar, permitir } from "../middlewares/autenticar.js";

// aqui solo se dice que ruta va a que controlador y quien puede entrar
export function crearRutas({ ordenesCtrl, tallerCtrl, auth }) {
    const api = Router();

    api.post("/auth/login", tallerCtrl.login);

    // de aqui para abajo todo pide token
    api.use(autenticar(auth));
    api.get("/auth/yo", tallerCtrl.yo);

    api.get("/motos", tallerCtrl.listarMotos);
    api.post("/motos", permitir("recepcion"), tallerCtrl.crearMoto);

    api.get("/repuestos", tallerCtrl.listarRepuestos);
    api.patch("/repuestos/:id/stock", permitir("admin"), tallerCtrl.ajustarStock);

    api.get("/ordenes", ordenesCtrl.listar);
    api.post("/ordenes", permitir("recepcion"), ordenesCtrl.crear);
    api.get("/ordenes/:id", ordenesCtrl.ver);
    api.get("/ordenes/:id/historial", ordenesCtrl.historial);
    // los permisos de cada cambio de estado los revisa el servicio (dependen del paso)
    api.post("/ordenes/:id/estado", ordenesCtrl.cambiarEstado);
    api.post("/ordenes/:id/repuestos", permitir("mecanico"), ordenesCtrl.agregarRepuesto);
    api.post("/ordenes/:id/mano-de-obra", permitir("mecanico"), ordenesCtrl.agregarManoDeObra);
    api.post("/ordenes/:id/pago", permitir("recepcion"), ordenesCtrl.pagar);

    return api;
}
