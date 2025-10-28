import { IFilterProp } from './types';

export default function FilterCalendarWidget(prop: IFilterProp) {
  return (
    <div className='bg-red-500 text-white p-2 rounded'> 日期 {prop.title}</div>
  );
}
