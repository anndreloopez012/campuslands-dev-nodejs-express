const logger = (req, res, next) => {
    const fecha = new Date().toISOString();

    console.log(
        `[${fecha}] ${req.method} ${req.url}`
    );

    next();
};

export default logger;