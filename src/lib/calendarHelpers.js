export function getMonthGrid(year, month) {
  // month is 0-indexed (January = 0), matches JS Date behavior
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null); // empty leading cells before day 1
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return cells;
}

// Returns a Map of 'YYYY-MM-DD' -> return_time, for the single day
// immediately after each active booking's end_date.
export function formatTime12Hour(time24) {
  if (!time24) return null;
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // 0 becomes 12, 13 becomes 1, etc.
  return `${hour}:${minute} ${period}`;
}

export function getReturnDates(bookings, cameraId) {
  const returnDates = new Map();

  bookings
    .filter(
      (booking) =>
        booking.camera_id === cameraId &&
        (booking.status === "pending" || booking.status === "approved"),
    )
    .forEach((booking) => {
      const end = new Date(booking.end_date);
      end.setDate(end.getDate() + 1);
      const returnKey = end.toISOString().split("T")[0];
      returnDates.set(returnKey, booking.return_time ?? null);
    });

  return returnDates;
}

export function formatDateKey(year, month, day) {
  // returns 'YYYY-MM-DD', matches your Supabase `date` column format exactly
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export function getUnavailableDates(bookings, cameraId) {
  // returns a Set of 'YYYY-MM-DD' strings currently blocked for this camera
  const unavailable = new Set();

  bookings
    .filter(
      (booking) =>
        booking.camera_id === cameraId &&
        (booking.status === "pending" || booking.status === "approved"),
    )
    .forEach((booking) => {
      let current = new Date(booking.start_date);
      const end = new Date(booking.end_date);

      while (current <= end) {
        unavailable.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });

  return unavailable;
}
