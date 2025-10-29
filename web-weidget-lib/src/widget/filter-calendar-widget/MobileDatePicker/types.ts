export interface ISelectParam {
  type: string;
  start: Date | null;
  end?: Date | null;
  range?: any[];
}

export type IPickerType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface IDatePickerContentProps {
  visible: boolean;
  type: IPickerType;
  isRange: boolean;
  start: Date | null;
  end: Date | null;
  onSelect: (params: ISelectParam) => void;
  onClose: () => void;
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
}
