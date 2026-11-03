export const requestLogger = (req, res, next)=>{
    const start = Date.now();
    res.on("finish", ()=>{
        const duration = Date.now() - start;
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} -> Status: ${res.statusCode}(${duration}ms)`);
    });
    next();
};