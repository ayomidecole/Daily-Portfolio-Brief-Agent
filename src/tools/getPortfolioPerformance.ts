import { tool } from "langchain";
import * as z from "zod";

import { calculatePortfolioPerformance } from "../analysis/portfolioMath.js";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";

export const getPortfolioPerformanceTool = tool(
  () => calculatePortfolioPerformance(mockPortfolioSnapshot),
  {
    name: "get_portfolio_performance",
    description:
      "Calculate deterministic total value, holdings value, cash balance, and daily performance for the current portfolio snapshot. Use this before summarizing portfolio performance.",
    schema: z.object({}),
  },
);
