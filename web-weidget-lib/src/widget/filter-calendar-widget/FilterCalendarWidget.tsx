import { IFilterCalendarProps } from './types';
import { MobileDatePicker } from './MobileDatePicker/index';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { ISelectParam } from './MobileDatePicker/types';

export default function FilterCalendarWidget(prop: IFilterCalendarProps) {
  const [visible, setVisible] = useState(false);
  const handleOpenPopup = () => {
    setVisible(true);
  };
  const handleClosePopup = () => {
    setVisible(false);
  };
  const handleConfirm = (value: ISelectParam) => {
    console.log(value);
    handleClosePopup();
  };
  const getDate = (value: any) => {
    if (value instanceof Date) {
      return value;
    } else {
      try {
        return new Date(value);
      } catch (error) {
        return new Date();
      }
    }
  };
  return (
    <>
      <div className='flex items-center justify-center border-solid border-b border-b-gray-300 py-2 static top-0'>
        <div onClick={handleOpenPopup}>{prop.showLable}</div>
        <ChevronDown onClick={handleOpenPopup} color='#000' />
      </div>
      {visible ? (
        <MobileDatePicker
          visible={visible}
          onCancel={handleClosePopup}
          types={prop.types}
          onConfirm={handleConfirm}
          value={getDate(prop.value)}
          type={prop.type}
        />
      ) : null}
    </>
  );
}
