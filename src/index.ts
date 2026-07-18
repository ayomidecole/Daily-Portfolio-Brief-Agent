import "dotenv/config";

import { portfolioBriefAgent } from "./agents/portfolioBriefAgent.js";
import { mockPortfolioSnapshot } from "./data/mockPortfolio.js";


const portfolioData = JSON.stringify(mockPortfolioSnapshot, null, 2);

const result = await portfolioBriefAgent.invoke({
  messages: [
    {
      role: "user",
      content: `Create a market-close portfolio brief using this snapshot:

${portfolioData}`,
    },
  ],
});

const finalMessage = result.messages.at(-1);

if (!finalMessage) {
  throw new Error("The portfolio brief agent returned no messages.");
}

console.log(finalMessage.content);
