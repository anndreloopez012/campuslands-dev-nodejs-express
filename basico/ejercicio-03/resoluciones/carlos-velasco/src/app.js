const express = require("express");

const teamRoutes = require("./routes/team.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "API funcionando correctamente",
        topic: "Modulos CommonJS"
    });
});

app.use("/api/teams", teamRoutes);

module.exports = app;