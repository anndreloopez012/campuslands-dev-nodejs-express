import { analyzeFormula, checkBalance } from "../services/chemistry.service.js";

const postFormulaAnalysis = (req, res) => res.json({ ok: true, data: analyzeFormula(req.body?.formula) });

const postReactionCheck = (req, res) => res.json({ ok: true, data: checkBalance(req.body?.equation) });

export { postFormulaAnalysis, postReactionCheck };
