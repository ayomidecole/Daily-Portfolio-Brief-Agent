import { calculateHoldingMarketValue } from "./portfolioMath.js";
import type {
  PortfolioSnapshot,
  RiskSeverity,
  RiskSignal,
} from "../domain/portfolio.js";

const HIGH_CONCENTRATION_THRESHOLD = 0.4;
const MEDIUM_CONCENTRATION_THRESHOLD = 0.25;

interface WeightedRiskSignal {
  readonly weight: number;
  readonly signal: RiskSignal;
}

export function calculateConcentrationRisks(
  snapshot: PortfolioSnapshot,
  threshold: number,
): RiskSignal[] {
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    throw new RangeError("Concentration threshold must be greater than 0 and at most 1.");
  }

  const holdingsValue = snapshot.holdings.reduce(
    (total, holding) => total + calculateHoldingMarketValue(holding),
    0,
  );
  const totalValue = holdingsValue + snapshot.cashBalance;

  if (totalValue === 0) {
    return [];
  }

  return snapshot.holdings
    .filter((holding) => holding.quantity > 0)
    .map<WeightedRiskSignal | undefined>((holding) => {
      const weight = calculateHoldingMarketValue(holding) / totalValue;

      if (weight < threshold) {
        return undefined;
      }

      const severity: RiskSeverity =
        weight >= HIGH_CONCENTRATION_THRESHOLD
          ? "high"
          : weight >= MEDIUM_CONCENTRATION_THRESHOLD
            ? "medium"
            : "low";

      return {
        weight,
        signal: {
          category: "concentration",
          severity,
          title: `${holding.symbol} is a concentrated holding`,
          explanation: `${holding.symbol} represents ${formatPercent(weight)} of total portfolio value, meeting the ${formatPercent(threshold)} concentration threshold.`,
          symbols: [holding.symbol],
        },
      };
    })
    .filter((risk): risk is WeightedRiskSignal => risk !== undefined)
    .sort((first, second) => second.weight - first.weight)
    .map(({ signal }) => signal);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}
