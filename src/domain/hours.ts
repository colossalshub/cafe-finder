import type { Day, WeeklyHours } from "./types";

const WEEKDAY: Record<string, Day> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

const PREVIOUS_DAY: Record<Day, Day> = {
  mon: "sun",
  tue: "mon",
  wed: "tue",
  thu: "wed",
  fri: "thu",
  sat: "fri",
  sun: "sat",
};

export function manilaClock(date: Date): { day: Day; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Sun";
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  const normalizedHour = hour === 24 ? 0 : hour;
  return {
    day: WEEKDAY[weekday] ?? "sun",
    minutes: normalizedHour * 60 + minute,
  };
}

function toMinutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function isOpenAt(hours: WeeklyHours, date: Date): boolean {
  const { day, minutes } = manilaClock(date);
  return hours.periods.some((period) => {
    const opens = toMinutes(period.opens);
    const closes = toMinutes(period.closes);
    if (opens === closes) {
      return false;
    }
    if (closes > opens) {
      return period.day === day && minutes >= opens && minutes < closes;
    }
    if (period.day === day && minutes >= opens) {
      return true;
    }
    return PREVIOUS_DAY[day] === period.day && minutes < closes;
  });
}
