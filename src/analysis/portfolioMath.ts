import type {
  Holding,
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
