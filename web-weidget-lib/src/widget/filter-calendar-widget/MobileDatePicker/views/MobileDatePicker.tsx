// components/MobileDatePicker.tsx
import { useState, useEffect } from 'preact/hooks';
import { Calendar } from 'lucide-react';
import { getDisplayText, isRangeComplete } from '../utils/dateUtils';
import useToast from '../hooks/useToast';
import Toast from './Toast';
import DatePickerPanel from './DatePickerPanel';
import { IMobileDatePickerProps, ISelectParam } from '../types';
import DatePickerContent from './DatePickerContent';

export function MobileDatePicker({
  types = ['day', 'week', 'month', 'quarter', 'year'],
  type = 'day',
  value = null,
  endValue = null,
  range = false,
  onConfirm,
  onCancel,
  visible,
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
        showToast('请选择完整的时间范围');
        return;
      }
    } else if (!selectedDate) {
      showToast('请先选择日期');
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
      showToast('请选择完整的时间范围');
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
    if (types.length === 1) {
      onConfirm?.(value);
    }
  };

  const displayText = getDisplayText(
    selectedDate,
    selectedEndDate,
    isRangeMode,
    pickerType
  );

  return (
    <div className='p-4 space-y-4 bg-gray-50 min-h-screen box-border overflow-hidden fixed top-0 bottom-0 right-0 left-0'>
      {/* 类型选择 */}
      {types.length > 1 && (
        <>
          <div className='flex gap-2 flex-wrap justify-between'>
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setPickerType(t)}
                className={`px-4 py-2 rounded-lg ${
                  pickerType === t
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border'
                }`}
              >
                {
                  {
                    day: '日',
                    week: '周',
                    month: '月',
                    quarter: '季度',
                    year: '年',
                  }[t]
                }
              </button>
            ))}
          </div>
          {/* 日期输入框 */}
          <button
            onClick={() => setShowPicker(true)}
            className='w-full bg-white border rounded-lg p-4 flex justify-between items-center'
          >
            <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>
              {displayText}
            </span>
            <Calendar size={20} className='text-gray-400' />
          </button>
          {/* 底部操作按钮 */}
          <div className='flex gap-4 mt-6 mb-0 absolute bottom-[34px] left-0 right-0 px-4'>
            <button
              onClick={handleCancel}
              className='flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition'
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className='flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition'
            >
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
        />
      </DatePickerPanel>

      {/* ✅ Toast */}
      <Toast message={message} />
    </div>
  );
}
