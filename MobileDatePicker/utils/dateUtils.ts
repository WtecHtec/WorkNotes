import { IPickerType } from "../types";
import { getWeekNumber, getWeekRange } from "./dateHelpers";

const formatDate = (date: Date | null, type: IPickerType, isRangeMode: boolean = false, isEnd: boolean = false) => {
  if (!date) return isRangeMode && !isEnd ? "开始日期" : isRangeMode && isEnd ? "结束日期" : "请选择日期";

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  switch (type) {
    case "year":
      return `${year}年`;
    case "quarter": {
      const quarter = Math.floor(month / 3) + 1;
      return `${year}年 第${quarter}季度`;
    }
    case "month":
      return `${year}年${month}月`;
    case "week": {
      const weekRange = getWeekRange(date);
      const weekNum = getWeekNumber(date);
      const startMonth = weekRange.monday.getMonth() + 1;
      const startDay = weekRange.monday.getDate();
      const endMonth = weekRange.sunday.getMonth() + 1;
      const endDay = weekRange.sunday.getDate();
      return `第${weekNum}周 ${weekRange.monday.getFullYear()}.${startMonth}.${startDay} - ${weekRange.sunday.getFullYear()}.${endMonth}.${endDay}`;
    }
    case "day":
      return `${year}年${month}月${day}日`;
    default:
      return "";
  }
};
/** 判断是否为有效时间范围 */
export function isRangeComplete(start: Date | null, end: Date | null): boolean {
  return !!(start && end);
}

/** 获取展示文本 */
export function getDisplayText(selectedDate: Date | null, selectedEndDate: Date | null, isRangeMode: boolean, pickerType: IPickerType): string {
  if (!isRangeMode) return formatDate(selectedDate, pickerType);
  if (!selectedDate && !selectedEndDate) return "请选择日期范围";

  console.log("selectedDate", selectedDate);
  const start = formatDate(selectedDate, pickerType, isRangeMode, true);
  const end = formatDate(selectedEndDate, pickerType, isRangeMode, true);

  if (selectedDate && selectedEndDate) {
    return `${start} 至 ${end}`;
  } else if (selectedDate) {
    return `${start} 至 ...`;
  }
  return "请选择日期范围";
}
