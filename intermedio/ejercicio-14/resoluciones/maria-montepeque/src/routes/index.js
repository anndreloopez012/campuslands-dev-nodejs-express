import { Router } from "express";
import authRoutes from "./auth.routes.js";
import librosRoutes from "./libros.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/auth", "/api/libros"] });
});

router.use("/auth", authRoutes);
router.use("/libros", librosRoutes);

export default router;
