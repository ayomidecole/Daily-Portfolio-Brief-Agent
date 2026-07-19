import { describe, expect, it } from "vitest";

import { selectUpcomingEvents } from "../analysis/portfolioEvents.js";
import {
  calculatePortfolioPerformance,
  calculateTopMovers,
} from "../analysis/portfolioMath.js";
import { calculateConcentrationRisks } from "../analysis/portfolioRisk.js";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";
import { getPortfolioConcentrationRisksTool } from "./getPortfolioConcentrationRisks.js";
import { getPortfolioMoversTool } from "./getPortfolioMovers.js";
import { getPortfolioPerformanceTool } from "./getPortfolioPerformance.js";
import { getPortfolioSnapshotTool } from "./getPortfolioSnapshot.js";
import { getUpcomingPortfolioEventsTool } from "./getUpcomingPortfolioEvents.js";

describe("getPortfolioSnapshotTool", () => {
  it("exposes the expected tool name", () => {
    expect(getPortfolioSnapshotTool.name).toBe("get_portfolio_snapshot");
  });

  it("returns the mock portfolio snapshot", async () => {
    const result = await getPortfolioSnapshotTool.invoke({});

    expect(result).toEqual(mockPortfolioSnapshot);
  });
});

describe("getPortfolioPerformanceTool", () => {
  it("exposes the expected tool name", () => {
    expect(getPortfolioPerformanceTool.name).toBe(
      "get_portfolio_performance",
    );
  });

  it("returns structured performance for the mock portfolio", async () => {
    const result = await getPortfolioPerformanceTool.invoke({});
    const expected = calculatePortfolioPerformance(mockPortfolioSnapshot);

    expect(result).toEqual(expected);
  });
});

describe("getPortfolioMoversTool", () => {
  it("exposes the expected tool name", () => {
    expect(getPortfolioMoversTool.name).toBe("get_portfolio_movers");
  });

  it("applies the default limit of three", async () => {
    const result = await getPortfolioMoversTool.invoke({});
    const expected = calculateTopMovers(mockPortfolioSnapshot, 3);

    expect(result).toEqual(expected);
  });

  it("accepts an explicit limit", async () => {
    const result = await getPortfolioMoversTool.invoke({ limit: 1 });
    const expected = calculateTopMovers(mockPortfolioSnapshot, 1);

    expect(result).toEqual(expected);
  });

  it.each([0, 11, 1.5])("rejects the invalid limit %s", async (limit) => {
    await expect(getPortfolioMoversTool.invoke({ limit })).rejects.toThrow();
  });
});

describe("getPortfolioConcentrationRisksTool", () => {
  it("exposes the expected tool name", () => {
    expect(getPortfolioConcentrationRisksTool.name).toBe(
      "get_portfolio_concentration_risks",
    );
  });

  it("applies the default threshold of 25 percent", async () => {
    const result = await getPortfolioConcentrationRisksTool.invoke({});
    const expected = calculateConcentrationRisks(mockPortfolioSnapshot, 0.25);

    expect(result).toEqual(expected);
  });

  it("accepts an explicit threshold", async () => {
    const result = await getPortfolioConcentrationRisksTool.invoke({
      threshold: 0.5,
    });
    const expected = calculateConcentrationRisks(mockPortfolioSnapshot, 0.5);

    expect(result).toEqual(expected);
  });

  it.each([0, 1.1, Number.NaN])(
    "rejects the invalid threshold %s",
    async (threshold) => {
      await expect(
        getPortfolioConcentrationRisksTool.invoke({ threshold }),
      ).rejects.toThrow();
    },
  );
});

describe("getUpcomingPortfolioEventsTool", () => {
  it("exposes the expected tool name", () => {
    expect(getUpcomingPortfolioEventsTool.name).toBe(
      "get_upcoming_portfolio_events",
    );
  });

  it("applies the default limit of five", async () => {
    const result = await getUpcomingPortfolioEventsTool.invoke({});
    const expected = selectUpcomingEvents(
      mockPortfolioSnapshot,
      mockPortfolioSnapshot.asOf,
      5,
    );

    expect(result).toEqual(expected);
  });

  it("accepts an explicit limit", async () => {
    const result = await getUpcomingPortfolioEventsTool.invoke({ limit: 1 });
    const expected = selectUpcomingEvents(
      mockPortfolioSnapshot,
      mockPortfolioSnapshot.asOf,
      1,
    );

    expect(result).toEqual(expected);
  });

  it.each([0, 11, 1.5])("rejects the invalid limit %s", async (limit) => {
    await expect(
      getUpcomingPortfolioEventsTool.invoke({ limit }),
    ).rejects.toThrow();
  });
});
