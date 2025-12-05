// components/MobileDatePicker.tsx
import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { getDisplayText, isRangeComplete } from "../utils/dateUtils";
import useToast from "../hooks/useToast";
import Toast from "./Toast";
import DatePickerPanel from "./DatePickerPanel";
import { IMobileDatePickerProps, ISelectParam } from "../types";
import DatePickerContent from "./DatePickerContent";

export function MobileDatePicker({
  types = ["day", "week", "month", "quarter", "year"],
  type = "day",
  value = null,
  endValue = null,
  range = false,
  onConfirm,
  onCancel,
  visible,
  disabledDate, // 添加 disabledDate 参数
}: IMobileDatePickerProps) {
  const [pickerType, setPickerType] = useState(type);
  const [isRangeMode, setIsRangeMode] = useState(range);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(endValue);
  const [showPicker, setShowPicker] = useState(false);

  const { message, showToast } = useToast();

  /** ✅ 初始化逻辑 */
  useEffect(() => {
    if (types.length <= 1 && visible) {
      setPickerType(type);
      setShowPicker(true);
    }
  }, [types, type, visible]);

  useEffect(() => setPickerType(type), [type]);
  useEffect(() => setIsRangeMode(range), [range]);
  useEffect(() => setSelectedDate(value), [value]);
  useEffect(() => setSelectedEndDate(endValue), [endValue]);

  /** ✅ 确定按钮逻辑 */
  const handleConfirm = () => {
    if (isRangeMode) {
      if (!isRangeComplete(selectedDate, selectedEndDate)) {
        showToast("请选择完整的时间范围");
        return;
      }
    } else if (!selectedDate) {
      showToast("请先选择日期");
      return;
    }

    onConfirm?.({
      type: pickerType,
      start: selectedDate,
      end: selectedEndDate ?? null,
    });
  };

  /** 点击蒙层逻辑 */
  const handleOverlayClick = () => {
    if (types.length > 1) {
      setShowPicker(false);
      return;
    }
    if (isRangeMode && (!selectedDate || !selectedEndDate)) {
      showToast("请选择完整的时间范围");
      return;
    }
    setShowPicker(false);
    onCancel?.();
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setSelectedEndDate(null);
    onCancel?.();
  };

  const handleSelect = (value: ISelectParam) => {
    console.log(value);
    const { start, end } = value;
    setSelectedDate(start);
    if (end) {
      setSelectedEndDate(end);
    }
    handleOverlayClick();
    if (types.length <= 1) {
      onConfirm?.(value);
    }
  };

  const displayText = getDisplayText(selectedDate, selectedEndDate, isRangeMode, pickerType);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0 z-10 box-border min-h-screen space-y-4 overflow-hidden bg-gray-50 p-4">
      {/* 类型选择 */}
      {types.length > 1 && (
        <>
          <div className="flex flex-wrap justify-between gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setPickerType(t)}
                className={`rounded-lg px-4 py-2 ${pickerType === t ? "bg-blue-500 text-white" : "border bg-white text-gray-700"}`}
              >
                {
                  {
                    day: "日",
                    week: "周",
                    month: "月",
                    quarter: "季度",
                    year: "年",
                  }[t]
                }
              </button>
            ))}
          </div>
          {/* 日期输入框 */}
          <button onClick={() => setShowPicker(true)} className="flex w-full items-center justify-between rounded-lg border bg-white p-4">
            <span className={selectedDate ? "text-gray-800" : "text-gray-400"}>{displayText}</span>
            <Calendar size={20} className="text-gray-400" />
          </button>
          {/* 底部操作按钮 */}
          <div className="absolute bottom-[34px] left-0 right-0 mb-0 mt-6 flex gap-4 px-4">
            <button onClick={handleCancel} className="flex-1 rounded-lg bg-gray-200 py-3 font-medium text-gray-700 transition hover:bg-gray-300">
              取消
            </button>
            <button onClick={handleConfirm} className="flex-1 rounded-lg bg-blue-500 py-3 font-medium text-white transition hover:bg-blue-600">
              确定
            </button>
          </div>
        </>
      )}

      {/* 模式切换 */}
      {/* <div className='flex gap-3 bg-white border rounded-lg p-3'>
        <button
          onClick={() => setIsRangeMode(false)}
          className={`flex-1 py-2 rounded-lg ${
            !isRangeMode ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          单选
        </button>
        <button
          onClick={() => setIsRangeMode(true)}
          className={`flex-1 py-2 rounded-lg ${
            isRangeMode ? 'bg-blue-500 text-white' : 'bg-gray-100'
          }`}
        >
          范围选择
        </button>
      </div> */}

      {/* ✅ 日期弹层 */}
      <DatePickerPanel visible={showPicker} onClose={handleOverlayClick}>
        {/* 这里放日期选择器内容 */}
        <DatePickerContent
          type={pickerType}
          onClose={handleOverlayClick}
          visible={showPicker}
          isRange={isRangeMode}
          start={selectedDate}
          end={selectedEndDate}
          onSelect={handleSelect}
          disabledDate={disabledDate} // 传递 disabledDate 函数
        />
      </DatePickerPanel>

      {/* ✅ Toast */}
      <Toast message={message} />
    </div>
  );
}
