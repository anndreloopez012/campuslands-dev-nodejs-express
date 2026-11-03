import { matches } from '../data/matches.data.js';
import { players } from '../data/players.data.js';
import { RankCalculatorService } from '../services/rank-calculator.service.js';

export const recordMatch = (req, res) => {
  const { playerId, kills, placement, damage } = req.body;

  if (!playerId || kills === undefined || !placement || damage === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Faltan campos requeridos: playerId, kills, placement, damage"
    });
  }

  const player = players.find(p => p.id === Number(playerId));
  if (!player) {
    return res.status(404).json({
      ok: false,
      message: `Jugador con ID ${playerId} no existe`
    });
  }

  // Uso del servicio reutilizable para computar el puntaje
  const earnedScore = RankCalculatorService.computeMatchScore(kills, placement, damage);

  // Actualización de estado
  player.totalKills += kills;
  if (placement > 1) player.totalDeaths += 1;
  player.points += earnedScore;

  const newMatch = {
    id: `BR-${Date.now().toString().slice(-4)}`,
    playerId: Number(playerId),
    kills: Number(kills),
    placement: Number(placement),
    damage: Number(damage),
    pointsEarned: earnedScore
  };

  matches.push(newMatch);

  res.status(201).json({
    ok: true,
    message: "Partida registrada exitosamente",
    data: {
      match: newMatch,
      playerUpdatedPoints: player.points,
      newTier: RankCalculatorService.determineTier(player.points)
    }
  });
};