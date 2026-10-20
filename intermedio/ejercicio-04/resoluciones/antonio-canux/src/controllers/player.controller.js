import { players } from '../data/players.data.js';
import { RankCalculatorService } from '../services/rank-calculator.service.js';

export const getPlayerProfile = (req, res) => {
  const { id } = req.params;
  const player = players.find(p => p.id === Number(id));

  if (!player) {
    return res.status(404).json({
      ok: false,
      message: `Jugador con ID ${id} no encontrado`
    });
  }

  // Reutilizamos el servicio para calcular estadísticas en tiempo real
  const kdRatio = RankCalculatorService.calculateKd(player.totalKills, player.totalDeaths);
  const tier = RankCalculatorService.determineTier(player.points);

  res.status(200).json({
    ok: true,
    data: {
      ...player,
      kdRatio,
      currentTier: tier
    }
  });
};