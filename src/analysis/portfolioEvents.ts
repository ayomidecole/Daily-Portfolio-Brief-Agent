import type { MarketEvent, PortfolioSnapshot } from "../domain/portfolio.js";

export function selectUpcomingEvents(
  snapshot: PortfolioSnapshot,
  referenceTime: string,
  limit: number,
): MarketEvent[] {
  if (!Number.isInteger(limit) || limit <= 0) {
    throw new RangeError("Event limit must be a positive integer.");
  }

  const referenceTimestamp = parseTimestamp(
    referenceTime,
    "Reference time must be a valid date.",
  );

  return snapshot.upcomingEvents
    .map((event) => ({
      event,
      timestamp: parseTimestamp(
        event.scheduledFor,
        `Event "${event.title}" must have a valid scheduledFor date.`,
      ),
    }))
    .filter(({ timestamp }) => timestamp >= referenceTimestamp)
    .sort((first, second) => first.timestamp - second.timestamp)
    .slice(0, limit)
    .map(({ event }) => event);
}

function parseTimestamp(value: string, errorMessage: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new RangeError(errorMessage);
  }

  return timestamp;
}
