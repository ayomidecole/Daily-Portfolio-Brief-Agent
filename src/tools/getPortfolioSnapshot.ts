import { tool } from "langchain";
import * as z from "zod";
import { mockPortfolioSnapshot } from "../data/mockPortfolio.js";

export const getPortfolioSnapshotTool = tool(() => mockPortfolioSnapshot, {
    name: "get_portfolio_snapshot",
    description:
      "Retrieve the current portfolio snapshot, including holdings, quantities, current and previous prices, cash balance, and upcoming events. Use this before creating a portfolio brief.",
    schema: z.object({}),
});
