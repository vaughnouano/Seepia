import React from "react";
import styles from "./CalendarDay.module.css";

const STATE_CLASS = {
  empty: styles.empty,
  unavailable: styles.unavailable,
  returnDay: styles.returnDay,
  available: styles.available,
  today: styles.today,
  selected: styles.selected,
  hoverRequired: styles.hoverRequired,
  hoverOptional: styles.hoverOptional,
};

export default function CalendarDay({
  day,
  state = "available",
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  if (state === "empty") {
    return <div className={`${styles.day} ${styles.empty}`} />;
  }

  return (
    <button
      type="button"
      className={`${styles.day} ${STATE_CLASS[state] ?? styles.available}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      disabled={state === "unavailable"}
    >
      {day}
    </button>
  );
}
