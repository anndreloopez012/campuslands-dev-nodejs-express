import { players } from '../data/players.data.js';

const SORTABLE = ['name', 'ranking', 'wins'];

export const list = (req, res) => {
  const { sortBy = 'ranking', order = 'asc' } = req.query;

  if (!SORTABLE.includes(sortBy) || !['asc', 'desc'].includes(order)) {
    return res.status(400).json({ ok: false, message: "sortBy debe ser name, ranking o wins; order asc o desc" });
  }

  const factor = order === 'asc' ? 1 : -1;
  const sorted = [...players].sort((a, b) =>
    typeof a[sortBy] === 'string' ? a[sortBy].localeCompare(b[sortBy]) * factor : (a[sortBy] - b[sortBy]) * factor
  );

  res.status(200).json({ ok: true, sortBy, order, data: sorted });
};
