/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { IDatePickerContentProps, IDisabledDateParams, IPickerType } from "../types";
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  getWeekNumber,
  getWeekRange,
  isDateInRange,
  isDateInSelectedWeek,
  isDateRangeEnd,
  isDateRangeStart,
  isEndDateInSelectedWeek,
} from "../utils/dateHelpers";

const DatePickerContent = ({ visible, start, end, type, onClose, isRange, onSelect, disabledDate }: IDatePickerContentProps) => {
  const [showPicker, setShowPicker] = useState(visible || false);
  const [pickerType] = useState(type || "day"); // day, week, month, quarter, year
  const [selectedDate, setSelectedDate] = useState(start || null);
  const [selectedEndDate, setSelectedEndDate] = useState(end || null);
  const [isRangeMode] = useState(isRange || false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // 辅助函数：判断日期是否禁用
  const isDateDisabled = (date: Date, pickerType: IPickerType): boolean => {
    if (typeof disabledDate !== "function") return true;

    const params: IDisabledDateParams = {
      type: pickerType,
      date,
      currentYear,
      currentMonth,
      selectedDate,
      selectedEndDate,
      isRangeMode,
    };

    return disabledDate(params);
  };
  useEffect(() => {
    if (showPicker) {
      window.document.getElementsByTagName("html")[0].style.overflow = "hidden";
      // 1) 打开时同步到选中日期所在的年月（优先 start，其次 end）
      const base = selectedDate || selectedEndDate;
      if (base) {
        // 不同类型下，定位到对应年月
        const d = new Date(base);
        if (pickerType === "week") {
          const { monday } = getWeekRange(d);
          setCurrentYear(monday.getFullYear());
          setCurrentMonth(monday.getMonth());
        } else if (pickerType === "month" || pickerType === "quarter" || pickerType === "day") {
          setCurrentYear(d.getFullYear());
          setCurrentMonth(d.getMonth());
        } else if (pickerType === "year") {
          setCurrentYear(d.getFullYear());
        }
      }
    } else {
      window.document.getElementsByTagName("html")[0].style.overflow = "auto";
    }
    return () => {
      window.document.getElementsByTagName("html")[0].style.overflow = "auto";
    };
  }, [showPicker, pickerType, selectedDate, selectedEndDate]);

  const handlePrevMonth = () => {
    if (pickerType === "month" || pickerType === "quarter") {
      setCurrentYear(currentYear - 1);
    } else {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (pickerType === "month" || pickerType === "quarter") {
      setCurrentYear(currentYear + 1);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    if (isDateDisabled(date, pickerType)) {
      return;
    }
    if (pickerType === "week") {
      const { monday, sunday } = getWeekRange(date);

      if (!isRangeMode) {
        setSelectedDate(monday);
        setShowPicker(false);
        onSelect({
          type: pickerType,
          start: monday,
        });
        return;
      }

      // 范围模式
      if (!selectedDate || (selectedDate && selectedEndDate)) {
        // 第一次选择或重新开始选择：固定为周一
        setSelectedDate(monday);
        setSelectedEndDate(null);
      } else {
        // 第二次选择：结束固定为周日
        const { monday: startMonday, sunday: startSunday } = getWeekRange(selectedDate);
        if (monday < startMonday) {
          // 结束周在开始周之前，需要对调：起始=选中周周一，结束=原开始周周日
          setSelectedEndDate(startSunday);
          setSelectedDate(monday);
          onSelect({
            type: pickerType,
            start: monday,
            end: startSunday,
          });
        } else {
          // 正常：结束=选中周周日
          setSelectedEndDate(sunday);
          onSelect({
            type: pickerType,
            start: monday,
            end: sunday,
          });
        }
        setShowPicker(false);
      }
      return;
    }
    if (!isRangeMode) {
      setSelectedDate(date);
      setShowPicker(false);
      onSelect({
        type: pickerType,
        start: date,
      });
    } else {
      if (!selectedDate || (selectedDate && selectedEndDate)) {
        // 第一次选择或重新选择
        setSelectedDate(date);
        setSelectedEndDate(null);
      } else {
        // 第二次选择
        if (date < selectedDate) {
          setSelectedEndDate(selectedDate);
          setSelectedDate(date);
        } else {
          setSelectedEndDate(date);
        }
        // 范围选择完成后才关闭
        setShowPicker(false);
        onSelect({
          type: pickerType,
          start: selectedDate,
          end: date,
        });
      }
    }
  };

  const renderDayPicker = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected =
        selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
      const isInRange = isDateInRange(date, selectedDate, selectedEndDate, isRangeMode);
      const isRangeStart = isDateRangeStart(date, selectedDate, isRangeMode);
      const isRangeEnd = isDateRangeEnd(date, selectedEndDate, isRangeMode);
      const disabled = isDateDisabled(date, "day"); // 判断是否禁用
      days.push(
        <button
          key={day}
          onClick={() => !disabled && handleDateSelect(date)}
          disabled={disabled}
          className={`flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
            isRangeStart || isRangeEnd
              ? "bg-blue-500 font-medium text-white"
              : isInRange
                ? "bg-blue-100 text-blue-700"
                : isSelected && !isRangeMode
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>,
      );
    }

    return (
      <div>
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div key={day} className="flex h-8 items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  const renderWeekPicker = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

    // 当月第一天/最后一天
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const lastOfMonth = new Date(currentYear, currentMonth, daysInMonth);

    // 以周一为起点、周日为终点，确保完整周
    const startDate = getWeekRange(firstOfMonth).monday; // 周一
    const endDate = getWeekRange(lastOfMonth).sunday; // 周日

    // 构造从 startDate 到 endDate 的所有日期，按周切分
    const weeks: { days: Date[]; monday: Date }[] = [];
    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      const weekDaysArr: Date[] = [];
      const monday = new Date(cursor);
      for (let i = 0; i < 7; i++) {
        weekDaysArr.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push({ days: weekDaysArr, monday });
    }

    return (
      <div>
        {/* 周标题（周一 ~ 周日） */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((d) => (
            <div key={d} className="flex h-8 items-center justify-center text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {weeks.map((week, weekIndex) => {
          const weekRange = getWeekRange(week.monday);
          const weekNum = getWeekNumber(week.monday);
          // const weekDisabled = isDateDisabled(weekRange.monday, "week"); // 判断整周是否禁用
          // 单选时：已选周全部高亮；范围模式下如果仅选了开始日期，也高亮该周
          const highlightWholeWeek =
            isDateInSelectedWeek(week.monday, selectedDate) || (isRangeMode && isEndDateInSelectedWeek(week.monday, selectedDate, selectedEndDate));

          return (
            <div key={weekIndex} className="mb-3">
              <div className={`mb-1 rounded px-2 py-1 text-xs font-medium ${highlightWholeWeek ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}>
                第{weekNum}周 {weekRange.monday.getMonth() + 1}/{weekRange.monday.getDate()} - {weekRange.sunday.getMonth() + 1}/
                {weekRange.sunday.getDate()}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {week.days.map((date, dayIndex) => {
                  const isOtherMonth = date.getMonth() !== currentMonth || date.getFullYear() !== currentYear;

                  const isInSelectedWeekDate = isDateInSelectedWeek(date, selectedDate) && (!isRangeMode || (isRangeMode && !selectedEndDate));

                  const inRange = isDateInRange(date, selectedDate, selectedEndDate, isRangeMode);
                  const isStart = isDateRangeStart(date, selectedDate, isRangeMode);
                  const isEnd = isDateRangeEnd(date, selectedEndDate, isRangeMode);
                  const disabled = isDateDisabled(date, "week"); // 判断是否禁用
                  return (
                    <button
                      key={dayIndex}
                      onClick={() => {
                        if (disabled) return;
                        const wr = getWeekRange(date);
                        handleDateSelect(wr.monday);
                      }}
                      disabled={disabled}
                      className={`flex h-10 items-center justify-center rounded-lg text-sm transition-colors ${
                        isStart || isEnd
                          ? "bg-blue-500 font-medium text-white"
                          : inRange
                            ? "bg-blue-100 text-blue-700"
                            : isInSelectedWeekDate
                              ? "bg-blue-500 font-medium text-white"
                              : isOtherMonth
                                ? "text-gray-400 hover:bg-gray-100"
                                : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthPicker = () => {
    const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

    return (
      <div className="grid grid-cols-3 gap-3">
        {months.map((month, index) => {
          const date = new Date(currentYear, index, 1);
          const isSelected = selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentYear;
          const isRangeStart = isRangeMode && selectedDate && selectedDate.getMonth() === index && selectedDate.getFullYear() === currentYear;
          const isRangeEnd = isRangeMode && selectedEndDate && selectedEndDate.getMonth() === index && selectedEndDate.getFullYear() === currentYear;
          const isInRange =
            isRangeMode &&
            selectedDate &&
            selectedEndDate &&
            date >= new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) &&
            date <= new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), 1);
          const disabled = isDateDisabled(date, "month"); // 判断是否禁用
          return (
            <button
              key={index}
              onClick={() => !disabled && handleDateSelect(date)}
              disabled={disabled}
              className={`flex h-14 items-center justify-center rounded-lg font-medium transition-colors ${
                isRangeStart || isRangeEnd
                  ? "bg-blue-500 text-white"
                  : isInRange
                    ? "bg-blue-100 text-blue-700"
                    : isSelected && !isRangeMode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {month}
            </button>
          );
        })}
      </div>
    );
  };

  const renderQuarterPicker = () => {
    const quarters = [
      { label: "第一季度", months: "1-3月", value: 0 },
      { label: "第二季度", months: "4-6月", value: 1 },
      { label: "第三季度", months: "7-9月", value: 2 },
      { label: "第四季度", months: "10-12月", value: 3 },
    ];

    return (
      <div className="space-y-3">
        {quarters.map((quarter) => {
          const quarterMonth = quarter.value * 3;
          const date = new Date(currentYear, quarterMonth, 1);
          const isSelected = selectedDate && Math.floor(selectedDate.getMonth() / 3) === quarter.value && selectedDate.getFullYear() === currentYear;
          const isRangeStart =
            isRangeMode && selectedDate && Math.floor(selectedDate.getMonth() / 3) === quarter.value && selectedDate.getFullYear() === currentYear;
          const isRangeEnd =
            isRangeMode &&
            selectedEndDate &&
            Math.floor(selectedEndDate.getMonth() / 3) === quarter.value &&
            selectedEndDate.getFullYear() === currentYear;
          const isInRange =
            isRangeMode &&
            selectedDate &&
            selectedEndDate &&
            quarter.value >= Math.floor(selectedDate.getMonth() / 3) &&
            quarter.value <= Math.floor(selectedEndDate.getMonth() / 3) &&
            currentYear >= selectedDate.getFullYear() &&
            currentYear <= selectedEndDate.getFullYear();
          const disabled = isDateDisabled(date, "quarter"); // 判断是否禁用
          return (
            <button
              key={quarter.value}
              onClick={() => !disabled && handleDateSelect(date)}
              disabled={disabled}
              className={`w-full rounded-lg p-4 text-left transition-colors ${
                isRangeStart || isRangeEnd
                  ? "bg-blue-500 text-white"
                  : isInRange
                    ? "bg-blue-100 text-blue-700"
                    : isSelected && !isRangeMode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="text-lg font-medium">{quarter.label}</div>
              <div className="text-sm opacity-80">{quarter.months}</div>
            </button>
          );
        })}
      </div>
    );
  };

  const renderYearPicker = () => {
    const startYear = Math.floor(currentYear / 10) * 10;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setCurrentYear(currentYear - 10)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-100">
            <ChevronLeft size={20} color="#000" />
          </button>
          <span className="font-medium">
            {startYear} - {startYear + 11}
          </span>
          <button onClick={() => setCurrentYear(currentYear + 10)} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-100">
            <ChevronRight size={20} color="#000" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {years.map((year) => {
            const date = new Date(year, 0, 1);
            const isSelected = selectedDate && selectedDate.getFullYear() === year;
            const isRangeStart = isRangeMode && selectedDate && selectedDate.getFullYear() === year;
            const isRangeEnd = isRangeMode && selectedEndDate && selectedEndDate.getFullYear() === year;
            const isInRange =
              isRangeMode && selectedDate && selectedEndDate && year >= selectedDate.getFullYear() && year <= selectedEndDate.getFullYear();
            const disabled = isDateDisabled(date, "year"); // 判断是否禁用
            return (
              <button
                key={year}
                disabled={disabled}
                onClick={() => !disabled && handleDateSelect(date)}
                className={`flex h-14 items-center justify-center rounded-lg font-medium transition-colors ${
                  isRangeStart || isRangeEnd
                    ? "bg-blue-500 text-white"
                    : isInRange
                      ? "bg-blue-100 text-blue-700"
                      : isSelected && !isRangeMode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPickerContent = () => {
    switch (pickerType) {
      case "year":
        return renderYearPicker();
      case "quarter":
        return renderQuarterPicker();
      case "month":
        return renderMonthPicker();
      case "week":
        return renderWeekPicker();
      case "day":
      default:
        return renderDayPicker();
    }
  };

  return (
    <>
      {/* 弹出内容 */}
      <div className="animate-slide-up z-50 rounded-t-2xl bg-white" onClick={(e) => e.stopPropagation()}>
        <div>
          {/* 头部 */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {isRangeMode ? "选择范围" : "选择"}
              {pickerType === "day"
                ? "日期"
                : pickerType === "week"
                  ? "周"
                  : pickerType === "month"
                    ? "月份"
                    : pickerType === "quarter"
                      ? "季度"
                      : "年份"}
            </h3>
            <button onClick={() => onClose()} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-100">
              <X size={20} color="#000" />
            </button>
          </div>

          {/* 年月切换 (日、周、月选择器需要) */}
          {["day", "week", "month", "quarter"].includes(pickerType) && (
            <div className="mb-4 flex items-center justify-between">
              <button onClick={handlePrevMonth} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-100">
                <ChevronLeft size={20} color="#000" />
              </button>
              <span className="font-medium text-gray-800">
                {currentYear}年{pickerType !== "quarter" && pickerType !== "month" ? ` ${currentMonth + 1}月` : ""}
              </span>
              <button onClick={handleNextMonth} className="rounded-lg bg-gray-100 p-2 hover:bg-gray-100">
                <ChevronRight size={20} color="#000" />
              </button>
            </div>
          )}

          {/* 选择器内容 */}
          <div className="max-h-96 overflow-y-auto">{renderPickerContent()}</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default DatePickerContent;
