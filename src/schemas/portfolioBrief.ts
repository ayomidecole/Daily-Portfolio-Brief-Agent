import * as z from "zod";

const nonEmptyStringSchema = z.string().trim().min(1);
const isoDateTimeSchema = z.string().datetime();

export const portfolioPerformanceSchema = z
  .object({
    totalValue: z.number(),
    holdingsValue: z.number(),
    cashBalance: z.number(),
    dayChangeAmount: z.number(),
    dayChangePercent: z.number(),
  })
  .strict();

export const holdingMoverSchema = z
  .object({
    symbol: nonEmptyStringSchema,
    direction: z.enum(["gain", "loss", "flat"]),
    dayChangeAmount: z.number(),
    dayChangePercent: z.number(),
  })
  .strict();

export const riskSignalSchema = z
  .object({
    category: z.enum([
      "concentration",
      "drawdown",
      "event",
      "data_quality",
    ]),
    severity: z.enum(["low", "medium", "high"]),
    title: nonEmptyStringSchema,
    explanation: nonEmptyStringSchema,
    symbols: z.array(nonEmptyStringSchema),
  })
  .strict();

export const marketEventSchema = z
  .object({
    type: z.enum([
      "earnings",
      "dividend",
      "company_news",
      "market_news",
    ]),
    title: nonEmptyStringSchema,
    scheduledFor: isoDateTimeSchema,
    symbols: z.array(nonEmptyStringSchema),
    source: nonEmptyStringSchema,
    sourceUrl: z.string().url().optional(),
  })
  .strict();

export const portfolioBriefSchema = z
  .object({
    generatedAt: isoDateTimeSchema,
    snapshotAsOf: isoDateTimeSchema,
    headline: nonEmptyStringSchema,
    summary: nonEmptyStringSchema,
    performance: portfolioPerformanceSchema,
    topMovers: z.array(holdingMoverSchema),
    riskSignals: z.array(riskSignalSchema),
    upcomingEvents: z.array(marketEventSchema),
    disclaimer: nonEmptyStringSchema,
  })
  .strict();
