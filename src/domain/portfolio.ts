export type Currency = "USD";

export type AssetType = "stock" | "etf";

export interface Holding {
  readonly symbol: string;
  readonly name: string;
  readonly assetType: AssetType;
  readonly quantity: number;
  readonly averageCost: number;
  readonly currentPrice: number;
  readonly previousClose: number;
}

export type MarketEventType =
  | "earnings"
  | "dividend"
  | "company_news"
  | "market_news";

export interface MarketEvent {
  readonly type: MarketEventType;
  readonly title: string;
  readonly scheduledFor: string;
  readonly symbols: readonly string[];
  readonly source: string;
  readonly sourceUrl?: string;
}

export interface PortfolioSnapshot {
  readonly asOf: string;
  readonly currency: Currency;
  readonly cashBalance: number;
  readonly holdings: readonly Holding[];
  readonly upcomingEvents: readonly MarketEvent[];
}

export interface PortfolioPerformance {
  readonly totalValue: number;
  readonly holdingsValue: number;
  readonly cashBalance: number;
  readonly dayChangeAmount: number;
  /** Decimal fraction: 0.025 means 2.5%. */
  readonly dayChangePercent: number;
}

export type MoverDirection = "gain" | "loss" | "flat";

export interface HoldingMover {
  readonly symbol: string;
  readonly direction: MoverDirection;
  readonly dayChangeAmount: number;
  /** Decimal fraction: -0.015 means -1.5%. */
  readonly dayChangePercent: number;
}

export type RiskCategory =
  | "concentration"
  | "drawdown"
  | "event"
  | "data_quality";

export type RiskSeverity = "low" | "medium" | "high";

export interface RiskSignal {
  readonly category: RiskCategory;
  readonly severity: RiskSeverity;
  readonly title: string;
  readonly explanation: string;
  readonly symbols: readonly string[];
}

export interface PortfolioBrief {
  readonly generatedAt: string;
  readonly snapshotAsOf: string;
  readonly headline: string;
  readonly summary: string;
  readonly performance: PortfolioPerformance;
  readonly topMovers: readonly HoldingMover[];
  readonly riskSignals: readonly RiskSignal[];
  readonly upcomingEvents: readonly MarketEvent[];
  readonly disclaimer: string;
}
