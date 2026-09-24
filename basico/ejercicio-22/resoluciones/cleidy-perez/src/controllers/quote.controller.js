const { calculateQuote } = require('../services/quote.service');
function quote(url, res) { try { const value = calculateQuote({ floors: Number(url.searchParams.get('floors')), area: Number(url.searchParams.get('area')), complexity: url.searchParams.get('complexity') || 'standard' }); res.statusCode = 200; res.end(JSON.stringify({ ok: true, data: value })); } catch (error) { res.statusCode = 400; res.end(JSON.stringify({ ok: false, error: error.message })); } }
module.exports = { quote };
