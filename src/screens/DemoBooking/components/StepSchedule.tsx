import React, { useMemo } from "react";
import { loadBookings } from "../persistence";
import { buildMockSlots } from "../mockAvailability";
import {
  buildMonthGrid,
  formatMonthTitle,
  formatSlotTime,
  formatTimeZoneOffsetLabel,
  isPastDateKey,
  todayDateKey,
  weekdayShortLabels,
} from "../time";
import type { DemoBookingController } from "../useDemoBooking";

export const StepSchedule: React.FC<{ flow: DemoBookingController }> = ({ flow }) => {
  const offsetLabel = formatTimeZoneOffsetLabel(flow.timeZone);
  const todayKey = todayDateKey(flow.timeZone);
  const cells = useMemo(
    () => buildMonthGrid(flow.monthCursor.year, flow.monthCursor.month),
    [flow.monthCursor.month, flow.monthCursor.year],
  );
  const currentMonthPrefix = `${flow.monthCursor.year}-${String(flow.monthCursor.month + 1).padStart(2, "0")}`;
  const [todayYear, todayMonthNumber] = todayKey.split("-").map(Number);
  const todayMonth = todayMonthNumber - 1;
  const canGoPrevious =
    flow.monthCursor.year > todayYear ||
    (flow.monthCursor.year === todayYear && flow.monthCursor.month > todayMonth);
  const bookings = loadBookings().filter((item) => item.id !== flow.booking?.id);

  const isSelectable = (dateKey: string): boolean => {
    if (isPastDateKey(dateKey, flow.timeZone)) return false;
    return buildMockSlots(dateKey, flow.timeZone, bookings).some((slot) => slot.available);
  };

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, dateKey: string) => {
    const index = cells.indexOf(dateKey);
    if (index < 0) return;
    const move = (delta: number) => {
      let nextIndex = index + delta;
      while (nextIndex >= 0 && nextIndex < cells.length) {
        const button = event.currentTarget.querySelector<HTMLButtonElement>(
          `[data-date="${cells[nextIndex]}"]`,
        );
        if (button && !button.disabled) {
          button.focus();
          return;
        }
        nextIndex += delta > 0 ? 1 : -1;
      }
    };
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      move(7);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(-7);
    }
  };

  return (
    <div className="dbk-step">
      <p className="sai-eyebrow">Let&apos;s talk</p>
      <h1 ref={flow.headingRef} className="dbk-title" tabIndex={-1}>
        Choose a time for your demo.
      </h1>
      <p className="sai-lede dbk-lede">
        Select a time that works for you. The call is about 30 minutes.
      </p>

      <div className="dbk-schedule">
        <div className="dbk-calendar">
          <div className="dbk-calendar__header">
            <h2 className="dbk-calendar__title">
              {formatMonthTitle(flow.monthCursor.year, flow.monthCursor.month, flow.timeZone)}
            </h2>
            <div className="dbk-calendar__nav">
              <button
                type="button"
                className="dbk-icon-button"
                aria-label="Previous month"
                disabled={!canGoPrevious}
                onClick={() => flow.shiftVisibleMonth(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                className="dbk-icon-button"
                aria-label="Next month"
                onClick={() => flow.shiftVisibleMonth(1)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="dbk-calendar__weekdays" aria-hidden="true">
            {weekdayShortLabels().map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div
            className="dbk-calendar__grid"
            role="grid"
            aria-label="Choose a date"
            onKeyDown={(event) => {
              const target = event.target as HTMLElement;
              const dateKey = target.getAttribute("data-date");
              if (dateKey) onGridKeyDown(event, dateKey);
            }}
          >
            {cells.map((dateKey) => {
              const inMonth = dateKey.startsWith(currentMonthPrefix);
              const selected = dateKey === flow.selectedDateKey;
              const today = dateKey === todayKey;
              const selectable = isSelectable(dateKey);
              const day = Number(dateKey.slice(-2));
              return (
                <button
                  key={dateKey}
                  type="button"
                  role="gridcell"
                  data-date={dateKey}
                  className={`dbk-day${selected ? " is-selected" : ""}${today ? " is-today" : ""}${inMonth ? "" : " is-outside"}`}
                  aria-selected={selected}
                  aria-current={today ? "date" : undefined}
                  aria-hidden={!inMonth}
                  tabIndex={selected ? 0 : -1}
                  disabled={!inMonth || !selectable}
                  onClick={() => flow.setDate(dateKey)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="dbk-times">
          <h2 className="dbk-times__title">
            {flow.selectedDateKey ? "Available times" : "Select a date"}
          </h2>
          {flow.availabilityLoading ? (
            <p className="dbk-hint">Checking availability…</p>
          ) : (
            <div className="dbk-times__list" role="radiogroup" aria-label="Available times" id="dbk-slot">
              {flow.availability.filter((slot) => slot.available).length === 0 ? (
                <p className="dbk-hint">No times available this day. Choose another date.</p>
              ) : (
                flow.availability.filter((slot) => slot.available).map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    role="radio"
                    aria-checked={flow.selectedSlot?.id === slot.id}
                    className={`dbk-time${flow.selectedSlot?.id === slot.id ? " is-selected" : ""}`}
                    disabled={!slot.available}
                    onClick={() => flow.setSlot(slot)}
                  >
                    {formatSlotTime(slot.startIso, flow.timeZone)}
                  </button>
                ))
              )}
            </div>
          )}
          {flow.errors.slot ? (
            <p className="dbk-error" role="alert">
              {flow.errors.slot}
            </p>
          ) : null}
        </div>
      </div>

      <p className="dbk-caption">
        Times are in your local timezone ({offsetLabel}).
      </p>
    </div>
  );
};
