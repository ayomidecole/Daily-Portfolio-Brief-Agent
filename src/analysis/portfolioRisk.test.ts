import { describe, expect, it } from "vitest";

import type { Holding, PortfolioSnapshot } from "../domain/portfolio.js";
import { calculateConcentrationRisks } from "./portfolioRisk.js";

const baseHolding: Holding = {
  symbol: "TEST",
  name: "Test Holding",
  assetType: "stock",
  quantity: 1,
  averageCost: 100,
  currentPrice: 100,
  previousClose: 100,
};

function createSnapshot(
  holdings: readonly Holding[],
  cashBalance = 0,
): PortfolioSnapshot {
  return {
    asOf: "2026-07-18T20:00:00.000Z",
    currency: "USD",
    cashBalance,
    holdings,
    upcomingEvents: [],
  };
}

describe("calculateConcentrationRisks", () => {
  it("flags a holding that meets the threshold exactly", () => {
    const snapshot = createSnapshot([baseHolding], 300);

    const risks = calculateConcentrationRisks(snapshot, 0.25);

    expect(risks).toHaveLength(1);
    expect(risks[0]).toMatchObject({
      category: "concentration",
      severity: "medium",
      symbols: ["TEST"],
    });
    expect(risks[0]?.explanation).toContain("25%");
  });

  it("does not flag a holding below the threshold", () => {
    const snapshot = createSnapshot([baseHolding], 301);

    expect(calculateConcentrationRisks(snapshot, 0.25)).toEqual([]);
  });

  it("assigns low, medium, and high severity at the agreed boundaries", () => {
    const snapshot = createSnapshot([
      { ...baseHolding, symbol: "HIGH", currentPrice: 400 },
      { ...baseHolding, symbol: "MEDIUM", currentPrice: 250 },
      { ...baseHolding, symbol: "LOW", currentPrice: 100 },
    ], 250);

    const risks = calculateConcentrationRisks(snapshot, 0.1);

    expect(risks).toEqual([
      expect.objectContaining({ severity: "high", symbols: ["HIGH"] }),
      expect.objectContaining({ severity: "medium", symbols: ["MEDIUM"] }),
      expect.objectContaining({ severity: "low", symbols: ["LOW"] }),
    ]);
  });

  it("sorts risks from highest concentration to lowest", () => {
    const snapshot = createSnapshot([
      { ...baseHolding, symbol: "LOWER", currentPrice: 300 },
      { ...baseHolding, symbol: "HIGHER", currentPrice: 500 },
    ], 200);

    expect(
      calculateConcentrationRisks(snapshot, 0.25).map(
        (risk) => risk.symbols[0],
      ),
    ).toEqual(["HIGHER", "LOWER"]);
  });

  it("includes cash when calculating portfolio weights", () => {
    const snapshot = createSnapshot([baseHolding], 900);

    expect(calculateConcentrationRisks(snapshot, 0.25)).toEqual([]);
  });

  it("ignores holdings with zero quantity", () => {
    const snapshot = createSnapshot([
      { ...baseHolding, symbol: "NOT_HELD", quantity: 0, currentPrice: 1_000 },
      { ...baseHolding, symbol: "HELD" },
    ]);

    expect(
      calculateConcentrationRisks(snapshot, 0.25).map(
        (risk) => risk.symbols[0],
      ),
    ).toEqual(["HELD"]);
  });

  it("returns no risks for a zero-value portfolio", () => {
    expect(calculateConcentrationRisks(createSnapshot([]), 0.25)).toEqual([]);
  });

  it.each([0, -0.1, 1.1, Number.NaN])(
    "rejects the invalid threshold %s",
    (threshold) => {
      expect(() =>
        calculateConcentrationRisks(createSnapshot([baseHolding]), threshold),
      ).toThrow(RangeError);
    },
  );
});
