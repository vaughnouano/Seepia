"use client";

import React, { useState } from "react";
import PreviousArrowIcon from "../icons/PreviousArrowIcon";
import NextArrowIcon from "../icons/NextArrowIcon";
import IconButton from "../ui/button/IconButton/IconButton";
import CalendarDay from "../ui/calendarDay/CalendarDay";
import { getMonthGrid, formatDateKey } from "../../lib/calendarHelpers";
import styles from "./Calendar.module.css";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar({
  cameraId,
  unavailableDates = new Set(),
  returnDates = new Map(),
  selectedDates = [],
  onSelectDate,
  getHoverState,
  onHoverDate,
  onHoverEnd,
  bookedDatesClickable = false, // new: lets admin click booked dates
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  // Captured once on mount — used to know whether "Previous" should be
  // disabled (i.e., are we back at the month the calendar started on?)
  const [initialYear] = useState(today.getFullYear());
  const [initialMonth] = useState(today.getMonth());

  const isAtEarliestMonth =
    viewYear === initialYear && viewMonth === initialMonth;

  const cells = getMonthGrid(viewYear, viewMonth);
  const todayKey = formatDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  function goToPreviousMonth() {
    if (isAtEarliestMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((year) => year - 1);
    } else {
      setViewMonth((month) => month - 1);
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((year) => year + 1);
    } else {
      setViewMonth((month) => month + 1);
    }
  }

  function getDayState(day) {
    const dateKey = formatDateKey(viewYear, viewMonth, day);
    if (unavailableDates.has(dateKey)) return "unavailable";
    if (returnDates.has(dateKey)) return "returnDay";
    if (selectedDates.includes(dateKey)) return "selected";

    const hover = getHoverState?.(dateKey);
    if (hover === "required") return "hoverRequired";
    if (hover === "optional") return "hoverOptional";

    if (dateKey === todayKey) return "today";
    return "available";
  }

  return (
    <div className={styles.card}>
      <div className={styles.calendar}>
        <div className={styles.header}>
          <div className={styles.monthYear}>
            <h2 className={styles.month}>{MONTH_NAMES[viewMonth]}</h2>
            <p className={styles.year}>{viewYear}</p>
          </div>

          <div className={styles.navButtons}>
            <IconButton
              iconContent={<PreviousArrowIcon />}
              onClick={goToPreviousMonth}
              buttonState={isAtEarliestMonth ? "disabled" : "active"}
              disabled={isAtEarliestMonth}
            />
            <IconButton
              iconContent={<NextArrowIcon />}
              onClick={goToNextMonth}
            />
          </div>
        </div>

        <div className={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className={styles.weekdayLabel}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.grid_container}>
          <div className={styles.grid} onMouseLeave={() => onHoverEnd?.()}>
            {cells.map((day, index) => {
              if (day === null) {
                return <CalendarDay key={`empty-${index}`} state="empty" />;
              }
              const dateKey = formatDateKey(viewYear, viewMonth, day);
              return (
                <CalendarDay
                  key={dateKey}
                  day={day}
                  state={getDayState(day)}
                  onClick={() => onSelectDate?.(dateKey)}
                  onMouseEnter={() => onHoverDate?.(dateKey)}
                  forceClickable={bookedDatesClickable}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
