import type {
  Holding,
  HoldingMover,
  PortfolioPerformance,
  PortfolioSnapshot,
} from "../domain/portfolio.js";

export function calculateHoldingMarketValue(holding: Holding): number {
  return holding.quantity * holding.currentPrice;
}

export function calculatePortfolioPerformance(
  snapshot: PortfolioSnapshot,
): PortfolioPerformance {
  const holdingsValue = snapshot.holdings.reduce(
    (total, holding) => total + calculateHoldingMarketValue(holding),
    0,
  );

  const previousHoldingsValue = snapshot.holdings.reduce(
    (total, holding) => total + holding.quantity * holding.previousClose,
    0,
  );

  const totalValue = holdingsValue + snapshot.cashBalance;
  const previousTotalValue = previousHoldingsValue + snapshot.cashBalance;
  const dayChangeAmount = holdingsValue - previousHoldingsValue;
  const dayChangePercent =
    previousTotalValue === 0 ? 0 : dayChangeAmount / previousTotalValue;

  return {
    totalValue,
    holdingsValue,
    cashBalance: snapshot.cashBalance,
    dayChangeAmount,
    dayChangePercent,
  };
}

export function calculateTopMovers(
  snapshot: PortfolioSnapshot,
  limit: number,
): HoldingMover[] {
  if (limit <= 0) {
    return [];
  }

  return snapshot.holdings
    .filter((holding) => holding.quantity !== 0)
    .map<HoldingMover>((holding) => {
      const priceChange = holding.currentPrice - holding.previousClose;
      const dayChangeAmount = holding.quantity * priceChange;
      const dayChangePercent = priceChange / holding.previousClose;
      const direction =
        priceChange > 0 ? "gain" : priceChange < 0 ? "loss" : "flat";

      return {
        symbol: holding.symbol,
        direction,
        dayChangeAmount,
        dayChangePercent,
      };
    })
    .sort(
      (first, second) =>
        Math.abs(second.dayChangePercent) -
        Math.abs(first.dayChangePercent),
    )
    .slice(0, limit);
}
