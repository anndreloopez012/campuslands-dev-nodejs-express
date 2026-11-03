const express = require('express');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const app = express();
app.get('/players', async (_req, res, next) => {
  try {
    const csv = await readFile(path.join(__dirname, '../data/players.csv'), 'utf8');
    const [, ...rows] = csv.trim().split(/\r?\n/);
    res.json(rows.map((row) => {
      const [name, wins] = row.split(',');
      return { name, wins: Number(wins) };
    }));
  } catch (error) {
    next(error);
  }
});
module.exports = app;
