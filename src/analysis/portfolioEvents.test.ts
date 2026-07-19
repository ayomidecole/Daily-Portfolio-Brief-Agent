import { describe, expect, it } from "vitest";

import type { MarketEvent, PortfolioSnapshot } from "../domain/portfolio.js";
import { selectUpcomingEvents } from "./portfolioEvents.js";

const referenceTime = "2026-07-18T20:00:00.000Z";

const baseEvent: MarketEvent = {
  type: "earnings",
  title: "Test earnings event",
  scheduledFor: "2026-07-20T20:00:00.000Z",
  symbols: ["TEST"],
  source: "test-calendar",
};

function createSnapshot(
  upcomingEvents: readonly MarketEvent[],
): PortfolioSnapshot {
  return {
    asOf: referenceTime,
    currency: "USD",
    cashBalance: 0,
    holdings: [],
    upcomingEvents,
  };
}

describe("selectUpcomingEvents", () => {
  it("returns future events in chronological order", () => {
    const snapshot = createSnapshot([
      {
        ...baseEvent,
        title: "Later event",
        scheduledFor: "2026-07-22T20:00:00.000Z",
      },
      {
        ...baseEvent,
        title: "Earlier event",
        scheduledFor: "2026-07-19T20:00:00.000Z",
      },
    ]);

    expect(
      selectUpcomingEvents(snapshot, referenceTime, 5).map(
        (event) => event.title,
      ),
    ).toEqual(["Earlier event", "Later event"]);
  });

  it("excludes events before the reference time", () => {
    const snapshot = createSnapshot([
      {
        ...baseEvent,
        title: "Past event",
        scheduledFor: "2026-07-17T20:00:00.000Z",
      },
      baseEvent,
    ]);

    expect(selectUpcomingEvents(snapshot, referenceTime, 5)).toEqual([
      baseEvent,
    ]);
  });

  it("includes an event scheduled exactly at the reference time", () => {
    const eventAtReferenceTime: MarketEvent = {
      ...baseEvent,
      scheduledFor: referenceTime,
    };

    expect(
      selectUpcomingEvents(
        createSnapshot([eventAtReferenceTime]),
        referenceTime,
        5,
      ),
    ).toEqual([eventAtReferenceTime]);
  });

  it("returns no more than the requested limit", () => {
    const snapshot = createSnapshot([
      baseEvent,
      {
        ...baseEvent,
        title: "Second event",
        scheduledFor: "2026-07-21T20:00:00.000Z",
      },
    ]);

    expect(selectUpcomingEvents(snapshot, referenceTime, 1)).toEqual([
      baseEvent,
    ]);
  });

  it("returns an empty array when there are no events", () => {
    expect(selectUpcomingEvents(createSnapshot([]), referenceTime, 5)).toEqual(
      [],
    );
  });

  it("rejects an invalid reference time", () => {
    expect(() =>
      selectUpcomingEvents(createSnapshot([baseEvent]), "not-a-date", 5),
    ).toThrow("Reference time must be a valid date.");
  });

  it("rejects an event with an invalid scheduled date", () => {
    const invalidEvent: MarketEvent = {
      ...baseEvent,
      scheduledFor: "not-a-date",
    };

    expect(() =>
      selectUpcomingEvents(
        createSnapshot([invalidEvent]),
        referenceTime,
        5,
      ),
    ).toThrow(`Event "${invalidEvent.title}" must have a valid scheduledFor date.`);
  });

  it.each([0, -1, 1.5])("rejects the invalid limit %s", (limit) => {
    expect(() =>
      selectUpcomingEvents(createSnapshot([baseEvent]), referenceTime, limit),
    ).toThrow(RangeError);
  });
});
