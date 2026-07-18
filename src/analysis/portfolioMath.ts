import type { Holding } from "../domain/portfolio.js";

export function calculateHoldingMarketValue(holding: Holding): number {
  return holding.quantity * holding.currentPrice;
}
