import { tool } from "langchain";
import * as z from "zod";

import { calculateTopMovers } from "../analysis/portfolioMath.js";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";
import type { HoldingMover } from "../domain/portfolio.js";

export const getPortfolioMoversTool = tool(
  ({ limit }): HoldingMover[] =>
    calculateTopMovers(mockPortfolioSnapshot, limit),
  {
    name: "get_portfolio_movers",
    description:
      "Deterministically identify the portfolio holdings with the largest daily percentage gains or losses before writing a portfolio brief.",
    schema: z.object({
      limit: z
        .number()
        .int()
        .positive()
        .max(10)
        .default(3)
        .describe("Maximum number of portfolio movers to return."),
    }),
  },
);
