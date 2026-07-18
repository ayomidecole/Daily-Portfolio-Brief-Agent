import "dotenv/config";

import { portfolioBriefAgent } from "./agents/portfolioBriefAgent.js";

const result = await portfolioBriefAgent.invoke({
  messages: [
    {
      role: "user",
      content: `Create a market-close portfolio brief using the current portfolio snapshot.`,
    },
  ],
});

const finalMessage = result.messages.at(-1);

if (!finalMessage) {
  throw new Error("The portfolio brief agent returned no messages.");
}

console.log(finalMessage.content);
