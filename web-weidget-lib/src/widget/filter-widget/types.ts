export interface IFilterItem {
  value: string;
  label: string;
}

export interface IFilterProp {
  title: string;
  onChange?: (value: IFilterItem) => void;
}
