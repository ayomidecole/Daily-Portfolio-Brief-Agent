import { tool } from "langchain";
import * as z from "zod";

import { calculateConcentrationRisks } from "../analysis/portfolioRisk.js";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";
import type { RiskSignal } from "../domain/portfolio.js";

export const getPortfolioConcentrationRisksTool = tool(
  ({ threshold }): RiskSignal[] =>
    calculateConcentrationRisks(mockPortfolioSnapshot, threshold),
  {
    name: "get_portfolio_concentration_risks",
    description:
      "Deterministically identify holdings whose value meets a concentration threshold as a share of total portfolio value, including cash. Use this before describing portfolio concentration risk.",
    schema: z.object({
      threshold: z
        .number()
        .positive()
        .max(1)
        .default(0.25)
        .describe(
          "Minimum portfolio weight to flag as a decimal fraction; 0.25 means 25%.",
        ),
    }),
  },
);
