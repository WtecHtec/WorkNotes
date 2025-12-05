export interface ISelectParam {
  type: string;
  start: Date | null;
  end?: Date | null;
  range?: any[];
}

export type IPickerType = "day" | "week" | "month" | "quarter" | "year";
// 添加禁用日期函数的参数类型
export interface IDisabledDateParams {
  type: IPickerType;
  date: Date;
  currentYear?: number;
  currentMonth?: number;
  selectedDate?: Date | null;
  selectedEndDate?: Date | null;
  isRangeMode?: boolean;
}

export interface IDatePickerContentProps {
  visible: boolean;
  type: IPickerType;
  isRange: boolean;
  start: Date | null;
  end: Date | null;
  onSelect: (params: ISelectParam) => void;
  onClose: () => void;
  disabledDate?: (params: IDisabledDateParams) => boolean; // 添加禁用日期函数
}

export interface IMobileDatePickerProps {
  visible: boolean;
  types?: IPickerType[];
  type?: IPickerType;
  value?: Date | null;
  endValue?: Date | null;
  range?: boolean;
  onChange?: (params: ISelectParam) => void;
  onConfirm?: (params: ISelectParam) => void;
  onCancel?: () => void;
  disabledDate?: (params: IDisabledDateParams) => boolean; // 添加禁用日期函数
}
