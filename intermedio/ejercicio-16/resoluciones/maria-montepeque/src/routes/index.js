import { Router } from "express";
import publicasRoutes from "./publicas.routes.js";
import carritoRoutes from "./carrito.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({
        ok: true,
        publicas: ["POST /api/auth/login", "GET /api/sneakers"],
        conLogin: ["/api/carrito"],
        soloAdmin: ["/api/admin"]
    });
});

router.use("/", publicasRoutes);
router.use("/carrito", carritoRoutes);
router.use("/admin", adminRoutes);

export default router;
