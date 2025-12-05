// utils/dateHelpers.ts
export const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const getWeekRange = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.getFullYear(), date.getMonth(), diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
};

export const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

export const isDateInRange = (date: Date, start?: Date | null, end?: Date | null, isRangeMode = false) => {
  if (!isRangeMode) return false;
  if (!start || !end) return false;
  const cur = new Date(date);
  cur.setHours(0, 0, 0, 0);
  const s = new Date(start);
  s.setHours(0, 0, 0, 0);
  const e = new Date(end);
  e.setHours(0, 0, 0, 0);
  return cur >= s && cur <= e;
};

export const isDateInSelectedWeek = (date: Date, selectedDate: Date | null) => {
  if (!selectedDate) return false;
  const selectedWeek = getWeekRange(selectedDate);
  return date >= selectedWeek.monday && date <= selectedWeek.sunday;
};

export const isEndDateInSelectedWeek = (date: Date, selectedDate: Date | null, selectedEndDate: Date | null) => {
  if (!selectedEndDate || !selectedDate) return false;
  const selectedWeek = getWeekRange(selectedDate);
  const selectedEndWeek = getWeekRange(selectedEndDate);
  return date >= selectedWeek.monday && date <= selectedEndWeek.sunday;
};

export const isDateRangeStart = (date: Date, selectedDate: Date | null, isRangeMode: boolean) => {
  if (!isRangeMode || !selectedDate) return false;
  return date.toDateString() === selectedDate.toDateString();
};

export const isDateRangeEnd = (date: Date, selectedEndDate: Date | null, isRangeMode: boolean) => {
  if (!isRangeMode || !selectedEndDate) return false;
  return date.toDateString() === selectedEndDate.toDateString();
};
