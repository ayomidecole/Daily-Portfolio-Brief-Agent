import { describe, expect, it } from "vitest";

import type { Holding, PortfolioSnapshot } from "../domain/portfolio.js";
import {
  calculateHoldingMarketValue,
  calculatePortfolioPerformance,
} from "./portfolioMath.js";

const baseHolding: Holding = {
  symbol: "TEST",
  name: "Test Holding",
  assetType: "stock",
  quantity: 10,
  averageCost: 100,
  currentPrice: 125.5,
  previousClose: 124,
};

describe("calculateHoldingMarketValue", () => {
  it("calculates the value of whole shares", () => {
    expect(calculateHoldingMarketValue(baseHolding)).toBeCloseTo(1_255, 2);
  });

  it("calculates the value of fractional shares", () => {
    const fractionalHolding: Holding = {
      ...baseHolding,
      quantity: 1.5,
      currentPrice: 123.45,
    };

    expect(calculateHoldingMarketValue(fractionalHolding)).toBeCloseTo(
      185.175,
      3,
    );
  });

  it("returns zero when no shares are held", () => {
    const emptyHolding: Holding = {
      ...baseHolding,
      quantity: 0,
    };

    expect(calculateHoldingMarketValue(emptyHolding)).toBe(0);
  });
});

describe("calculatePortfolioPerformance", () => {
  it("calculates portfolio totals and daily performance", () => {
    const snapshot: PortfolioSnapshot = {
      asOf: "2026-07-18T20:00:00.000Z",
      currency: "USD",
      cashBalance: 1_000,
      holdings: [
        {
          ...baseHolding,
          symbol: "GAIN",
          quantity: 2,
          currentPrice: 110,
          previousClose: 100,
        },
        {
          ...baseHolding,
          symbol: "LOSS",
          quantity: 1,
          currentPrice: 190,
          previousClose: 200,
        },
      ],
      upcomingEvents: [],
    };

    const performance = calculatePortfolioPerformance(snapshot);

    expect(performance.holdingsValue).toBeCloseTo(410, 2);
    expect(performance.totalValue).toBeCloseTo(1_410, 2);
    expect(performance.cashBalance).toBe(1_000);
    expect(performance.dayChangeAmount).toBeCloseTo(10, 2);
    expect(performance.dayChangePercent).toBeCloseTo(10 / 1_400, 8);
  });

  it("returns zero performance for an empty portfolio", () => {
    const emptySnapshot: PortfolioSnapshot = {
      asOf: "2026-07-18T20:00:00.000Z",
      currency: "USD",
      cashBalance: 0,
      holdings: [],
      upcomingEvents: [],
    };

    expect(calculatePortfolioPerformance(emptySnapshot)).toEqual({
      totalValue: 0,
      holdingsValue: 0,
      cashBalance: 0,
      dayChangeAmount: 0,
      dayChangePercent: 0,
    });
  });
});
