function healthRoutes(app) {
    app.get("/health", (req, res) => {
        res.json({
            ok: true,
            service: "sneaker-drops-api",
            uptime: `${process.uptime().toFixed(1)}s`,
            timestamp: new Date().toISOString(),
        });
    });
}

export { healthRoutes };