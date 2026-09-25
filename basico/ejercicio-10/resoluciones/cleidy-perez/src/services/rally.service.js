const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
async function playRally(player, delay) { await wait(delay); return { player, action: 'gol', points: 1, completedAt: new Date().toISOString() }; }
async function playMatch() { const [first, second] = await Promise.all([playRally('Ana', 40), playRally('Luis', 70)]); return { first, second, winner: first.completedAt < second.completedAt ? 'Ana' : 'Luis' }; }
module.exports = { playRally, playMatch };
