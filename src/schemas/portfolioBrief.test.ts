import { describe, expect, it } from "vitest";

import { portfolioBriefSchema } from "./portfolioBrief.js";

const validMover = {
  symbol: "NVDA",
  direction: "gain",
  dayChangeAmount: 32.55,
  dayChangePercent: 0.0133,
};

const validRiskSignal = {
  category: "concentration",
  severity: "high",
  title: "VOO is a concentrated holding",
  explanation: "VOO represents 40.63% of total portfolio value.",
  symbols: ["VOO"],
};

const validEvent = {
  type: "earnings",
  title: "NVIDIA quarterly earnings release",
  scheduledFor: "2026-08-26T20:00:00.000Z",
  symbols: ["NVDA"],
  source: "market-calendar",
  sourceUrl: "https://example.com/events/nvda-earnings",
};

const validPortfolioBrief = {
  generatedAt: "2026-07-19T21:00:00.000Z",
  snapshotAsOf: "2026-07-18T20:00:00.000Z",
  headline: "Portfolio finished higher",
  summary: "The portfolio gained 0.65% during the trading day.",
  performance: {
    totalValue: 10_539.96,
    holdingsValue: 9_289.96,
    cashBalance: 1_250,
    dayChangeAmount: 68.51,
    dayChangePercent: 0.0065,
  },
  topMovers: [validMover],
  riskSignals: [validRiskSignal],
  upcomingEvents: [validEvent],
  disclaimer: "This brief is informational and is not financial advice.",
};

describe("portfolioBriefSchema", () => {
  it("accepts a complete valid portfolio brief", () => {
    expect(portfolioBriefSchema.safeParse(validPortfolioBrief).success).toBe(
      true,
    );
  });

  it("accepts empty mover, risk, and event arrays", () => {
    const brief = {
      ...validPortfolioBrief,
      topMovers: [],
      riskSignals: [],
      upcomingEvents: [],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const brief: Record<string, unknown> = { ...validPortfolioBrief };
    delete brief.headline;

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an invalid generatedAt datetime", () => {
    const brief = { ...validPortfolioBrief, generatedAt: "not-a-date" };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an invalid event datetime", () => {
    const brief = {
      ...validPortfolioBrief,
      upcomingEvents: [{ ...validEvent, scheduledFor: "not-a-date" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an invalid mover direction", () => {
    const brief = {
      ...validPortfolioBrief,
      topMovers: [{ ...validMover, direction: "up" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an invalid risk severity", () => {
    const brief = {
      ...validPortfolioBrief,
      riskSignals: [{ ...validRiskSignal, severity: "critical" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an invalid event type", () => {
    const brief = {
      ...validPortfolioBrief,
      upcomingEvents: [{ ...validEvent, type: "conference" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an incorrect nested value type", () => {
    const brief = {
      ...validPortfolioBrief,
      performance: {
        ...validPortfolioBrief.performance,
        totalValue: "10539.96",
      },
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects whitespace-only required text", () => {
    const brief = { ...validPortfolioBrief, headline: "   " };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects a blank nested symbol", () => {
    const brief = {
      ...validPortfolioBrief,
      topMovers: [{ ...validMover, symbol: "" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("accepts an event without an optional source URL", () => {
    const { sourceUrl: _sourceUrl, ...eventWithoutUrl } = validEvent;
    const brief = {
      ...validPortfolioBrief,
      upcomingEvents: [eventWithoutUrl],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(true);
  });

  it("rejects an invalid source URL", () => {
    const brief = {
      ...validPortfolioBrief,
      upcomingEvents: [{ ...validEvent, sourceUrl: "not-a-url" }],
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an unknown top-level field", () => {
    const brief = { ...validPortfolioBrief, internalNotes: "private" };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });

  it("rejects an unknown nested field", () => {
    const brief = {
      ...validPortfolioBrief,
      performance: {
        ...validPortfolioBrief.performance,
        internalCalculation: true,
      },
    };

    expect(portfolioBriefSchema.safeParse(brief).success).toBe(false);
  });
});
