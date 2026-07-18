import { describe, expect, it } from "vitest";

import type { Holding, PortfolioSnapshot } from "../domain/portfolio.js";
import {
  calculateHoldingMarketValue,
  calculatePortfolioPerformance,
  calculateTopMovers,
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

describe("calculateTopMovers", () => {
  const createSnapshot = (
    holdings: readonly Holding[],
  ): PortfolioSnapshot => ({
    asOf: "2026-07-18T20:00:00.000Z",
    currency: "USD",
    cashBalance: 0,
    holdings,
    upcomingEvents: [],
  });

  it("assigns gain, loss, and flat directions", () => {
    const snapshot = createSnapshot([
      {
        ...baseHolding,
        symbol: "GAIN",
        currentPrice: 110,
        previousClose: 100,
      },
      {
        ...baseHolding,
        symbol: "LOSS",
        currentPrice: 90,
        previousClose: 100,
      },
      {
        ...baseHolding,
        symbol: "FLAT",
        currentPrice: 100,
        previousClose: 100,
      },
    ]);

    const movers = calculateTopMovers(snapshot, 3);
    const directions = Object.fromEntries(
      movers.map((mover) => [mover.symbol, mover.direction]),
    );

    expect(directions).toEqual({
      GAIN: "gain",
      LOSS: "loss",
      FLAT: "flat",
    });
  });

  it("calculates dollar and percentage changes without rounding", () => {
    const snapshot = createSnapshot([
      {
        ...baseHolding,
        symbol: "CALC",
        quantity: 2.5,
        currentPrice: 101,
        previousClose: 99,
      },
    ]);

    const [mover] = calculateTopMovers(snapshot, 1);

    expect(mover?.dayChangeAmount).toBeCloseTo(5, 12);
    expect(mover?.dayChangePercent).toBeCloseTo(2 / 99, 12);
  });

  it("sorts by absolute percentage change from largest to smallest", () => {
    const snapshot = createSnapshot([
      {
        ...baseHolding,
        symbol: "SMALL_GAIN",
        currentPrice: 102,
        previousClose: 100,
      },
      {
        ...baseHolding,
        symbol: "LARGE_LOSS",
        currentPrice: 85,
        previousClose: 100,
      },
      {
        ...baseHolding,
        symbol: "MEDIUM_GAIN",
        currentPrice: 108,
        previousClose: 100,
      },
    ]);

    expect(
      calculateTopMovers(snapshot, 3).map((mover) => mover.symbol),
    ).toEqual(["LARGE_LOSS", "MEDIUM_GAIN", "SMALL_GAIN"]);
  });

  it("returns no more than the requested limit", () => {
    const snapshot = createSnapshot([
      { ...baseHolding, symbol: "ONE", currentPrice: 110, previousClose: 100 },
      { ...baseHolding, symbol: "TWO", currentPrice: 120, previousClose: 100 },
      { ...baseHolding, symbol: "THREE", currentPrice: 130, previousClose: 100 },
    ]);

    const movers = calculateTopMovers(snapshot, 2);

    expect(movers).toHaveLength(2);
    expect(movers.map((mover) => mover.symbol)).toEqual(["THREE", "TWO"]);
  });

  it("ignores holdings with zero quantity", () => {
    const snapshot = createSnapshot([
      {
        ...baseHolding,
        symbol: "NOT_HELD",
        quantity: 0,
        currentPrice: 150,
        previousClose: 100,
      },
      {
        ...baseHolding,
        symbol: "HELD",
        quantity: 1,
        currentPrice: 105,
        previousClose: 100,
      },
    ]);

    expect(
      calculateTopMovers(snapshot, 3).map((mover) => mover.symbol),
    ).toEqual(["HELD"]);
  });

  it("returns an empty array for a non-positive limit", () => {
    const snapshot = createSnapshot([baseHolding]);

    expect(calculateTopMovers(snapshot, 0)).toEqual([]);
    expect(calculateTopMovers(snapshot, -1)).toEqual([]);
  });

  it("returns an empty array for an empty portfolio", () => {
    const snapshot: PortfolioSnapshot = {
      asOf: "2026-07-18T20:00:00.000Z",
      currency: "USD",
      cashBalance: 0,
      holdings: [],
      upcomingEvents: [],
    };

    expect(calculateTopMovers(snapshot, 3)).toEqual([]);
  });
});
