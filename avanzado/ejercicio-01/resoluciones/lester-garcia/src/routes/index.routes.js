import { Router } from "express";
import heroesV1Router from "./v1/heroes.v1.routes.js";
import heroesV2Router from "./v2/heroes.v2.routes.js";
import { apiVersionHeader } from "../middlewares/apiVersion.middleware.js";

const router = Router();

const sunsetDate = process.env.SUNSET_V1_DATE || "Wed, 31 Dec 2026 23:59:59 GMT";

// Montaje de API v1 (Marcada como Deprecada con cabeceras RFC 8594 Sunset)
router.use(
  "/v1/heroes",
  apiVersionHeader("v1", {
    deprecated: true,
    sunsetDate,
    successorPath: "/api/v2/heroes"
  }),
  heroesV1Router
);

// Montaje de API v2 (Versión estable actual)
router.use("/v2/heroes", apiVersionHeader("v2"), heroesV2Router);

export default router;
