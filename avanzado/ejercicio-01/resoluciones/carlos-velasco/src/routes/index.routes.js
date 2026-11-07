const express = require("express");
const { v1Router, v2Router } = require("./character.routes");

const router = express.Router();

router.use("/v1", v1Router);
router.use("/v2", v2Router);

// Documentacion de versiones disponibles.
router.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    apiVersions: {
      v1: {
        status: "estable",
        sunsetting: false,
        endpoints: ["/api/v1/characters", "/api/v1/characters/:id"],
        responseStyle: "campos en espanol, forma plana",
      },
      v2: {
        status: "actual",
        sunsetting: false,
        endpoints: ["/api/v2/characters", "/api/v2/characters/:id"],
        responseStyle: "ingles, enriquecido con powerScore, HATEOAS y metadatos",
      },
    },
    strategy: "versionado por URI (/api/v1, /api/v2)",
  });
});

module.exports = router;
