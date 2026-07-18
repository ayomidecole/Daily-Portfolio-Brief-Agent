import { describe, expect, it } from "vitest";

import type { Holding } from "../domain/portfolio.js";
import { calculateHoldingMarketValue } from "./portfolioMath.js";

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
