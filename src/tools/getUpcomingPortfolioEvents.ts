import { tool } from "langchain";
import * as z from "zod";

import { selectUpcomingEvents } from "../analysis/portfolioEvents.js";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";
import type { MarketEvent } from "../domain/portfolio.js";

export const getUpcomingPortfolioEventsTool = tool(
  ({ limit }): MarketEvent[] =>
    selectUpcomingEvents(
      mockPortfolioSnapshot,
      mockPortfolioSnapshot.asOf,
      limit,
    ),
  {
    name: "get_upcoming_portfolio_events",
    description:
      "Deterministically return portfolio events at or after the current snapshot time, sorted from nearest to latest. Use this before describing upcoming portfolio events.",
    schema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .max(10)
        .default(5)
        .describe("Maximum number of upcoming portfolio events to return."),
    }),
  },
);
