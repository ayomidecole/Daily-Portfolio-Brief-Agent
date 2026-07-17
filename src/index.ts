import { ChatOpenAI } from "@langchain/openai"
import "dotenv/config";

const llm = new ChatOpenAI({
    model: "gpt-5.6-sol",
    temperature: 1
})

const input = "In one sentence, explain what a daily portfolio brief should tell an investor."

const result = await llm.invoke(input)
console.log(result.content)

