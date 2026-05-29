# Portfolio Brief Agent

A TypeScript agent that generates a concise market-close portfolio briefing.

The agent is designed to review portfolio data after the trading day, summarize daily performance, identify notable movers, flag concentration or risk signals, and prepare a short digest suitable for SMS or email delivery.

## What It Does

- Summarizes portfolio value, daily change, and notable performance shifts
- Highlights top gainers and losers
- Flags concentration, drawdown, and risk signals
- Checks for relevant earnings, news, and watchlist context
- Produces structured briefing output for downstream delivery
- Supports dry-run notification flows before sending real messages

## Stack

- TypeScript
- LangChain for models, tools, agents, and structured output
- LangGraph for stateful workflow orchestration
- LangSmith for tracing, evaluation, and observability
- MCP for connecting external portfolio data tools

## Safety Boundary

This project is read-only by design. It does not place trades, modify brokerage data, or automate investment decisions.

Any portfolio integration should use least-privilege access, local secrets, and privacy-conscious tracing. The generated brief is informational and should not be treated as financial advice.

## Planned Integration Path

The first implementation uses mock portfolio data. Later versions can connect to a local read-only MCP server, then optionally to a trusted read-only portfolio provider such as a Robinhood MCP.

Notification delivery will start in dry-run mode before adding SMS or email delivery.
