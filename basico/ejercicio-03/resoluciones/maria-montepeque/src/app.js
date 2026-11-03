const { evaluatePlayer } = require("./services/draft.service");

try {
    console.table(evaluatePlayer(process.argv[2] || 55, process.argv[3] || 25));
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
}