import { LoadedRound } from "../../_types/global/GlobalTypes";

declare const LIGHTFOREST_CONFIG: LoadedRound;
export enum Rank {
  GOLD,
  SILVER,
  BRONZE,
  NONE,
}

export function getRank(
  time: number,
  ranks: {
    goldScore: number | undefined;
    silverScore: number | undefined;
    bronzeScore: number | undefined;
  }
): Rank {
  console.log(time, ranks);
  if (ranks.goldScore && time <= ranks.goldScore) return Rank.GOLD;
  else if (ranks.silverScore && time <= ranks.silverScore) return Rank.SILVER;
  else if (ranks.bronzeScore && time <= ranks.bronzeScore) return Rank.BRONZE;
  else return Rank.NONE;
}

export function calculateScore({
  time,
  moves,
}: {
  time: number | undefined;
  moves: number | undefined;
}): number {
  if (!time && !moves) throw new Error("score cannot be calculated");
  if (!time && moves) return moves;
  if (!moves && time) return time;
  if (moves && time) return scoreCalculation(time, moves);
  return 69;
}

function scoreCalculation(time: number, moves: number) {
  return Math.floor(
    time * LIGHTFOREST_CONFIG.round.TIME_WEIGHT -
      1000 / (moves * LIGHTFOREST_CONFIG.round.MOVE_WEIGHT)
  );
}
