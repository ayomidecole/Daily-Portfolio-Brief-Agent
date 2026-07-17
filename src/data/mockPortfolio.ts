import type { PortfolioSnapshot } from "../domain/portfolio.js";

// Fictional data for local development and tests only.
export const mockPortfolioSnapshot: PortfolioSnapshot = {
  asOf: "2026-07-17T20:00:00.000Z",
  currency: "USD",
  cashBalance: 1_250,
  holdings: [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      assetType: "stock",
      quantity: 12,
      averageCost: 180.5,
      currentPrice: 211.18,
      previousClose: 209.95,
    },
    {
      symbol: "VOO",
      name: "Vanguard S&P 500 ETF",
      assetType: "etf",
      quantity: 8,
      averageCost: 480.25,
      currentPrice: 535.25,
      previousClose: 532.6,
    },
    {
      symbol: "NVDA",
      name: "NVIDIA Corporation",
      assetType: "stock",
      quantity: 15,
      averageCost: 120.75,
      currentPrice: 164.92,
      previousClose: 162.75,
    },
  ],
  upcomingEvents: [
    {
      type: "earnings",
      title: "Mock NVIDIA quarterly earnings release",
      scheduledFor: "2026-08-26T20:00:00.000Z",
      symbols: ["NVDA"],
      source: "mock-market-calendar",
    },
  ],
};
