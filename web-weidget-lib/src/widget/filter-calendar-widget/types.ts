import {
  IPickerType,
  ISelectParam,
} from '../filter-calendar-widget/MobileDatePicker/types';

export interface IFilterCalendarProps {
  showLable: string;
  types?: IPickerType[];
  type?: IPickerType;
  value?: Date | null;
  endValue?: Date | null;
  range?: boolean;
  onChange?: (params: ISelectParam) => void;
  onConfirm?: (params: ISelectParam) => void;
  onCancel?: () => void;
}
