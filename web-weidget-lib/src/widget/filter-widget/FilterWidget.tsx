import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Popup, DotLoading } from 'antd-mobile';
import { ChevronDown } from 'lucide-react';
import { getSearchParams } from '@/utils/common';
import IntelligencePriceAPI from '../../api/intelligencePrice';
import { useInfiniteScroll } from './_hooks/useInfiniteScroll';
import { IFilterItem, IFilterProp } from './types';
import styleName from './FilterWidget.module.css';
export default function FilterWidget(prop: IFilterProp) {
  const hotelCode = getSearchParams('hotel_code');
  const [visible, setVisible] = useState(false);
  const [, setRefresh] = useState(0);
  const [selectedItem, setSelectedItem] = useState<IFilterItem | null>(null);
  const [data, setData] = useState<IFilterItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const handleOpenPopup = () => {
    setVisible(true);
    requestAnimationFrame(() => {
      setRefresh(Math.random());
    });
  };

  const handleItemSelect = useCallback((item: IFilterItem) => {
    setSelectedItem(item);
    setVisible(false); // 关闭弹窗
  }, []);

  const loadMoreData = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

    try {
      const response = await IntelligencePriceAPI.getIntelligencePricePage({
        hotel_code: hotelCode,
        current: page, // 接口使用从0开始的页码
        page_size: 100,
      });

      if (response.code === 200 || response.code === 'success') {
        const newData = (response.data.data_list || []).map((item) => ({
          value: item.id,
          label: item.publish_time,
        })) as any;
        // 添加新数据到现有数据
        setData((prevData) => [...prevData, ...newData]);
        setPage((prevPage) => prevPage + 1);
        // 判断是否还有更多数据
        setHasMore(newData.length === 100);

        // 如果是第一页且有数据，自动选择第一项
        if (page === 0 && newData.length > 0 && !selectedItem) {
          handleItemSelect(newData[0]);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log(error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page, hotelCode, handleItemSelect, selectedItem]);

  // 使用改进后的无限滚动 hook
  const { sentinelRef } = useInfiniteScroll(loadMoreData, {
    enabled: visible,
    threshold: 0.1,
    rootMargin: '50px',
    checkOnMount: true,
    rootElement: scrollContainerRef.current,
  });

  // 当 popup 打开时，定位到已选中的元素
  useEffect(() => {
    if (
      visible &&
      selectedItem &&
      selectedItemRef.current &&
      scrollContainerRef.current
    ) {
      // 延迟一点时间确保 DOM 完全渲染
      const timer = setTimeout(() => {
        const container = scrollContainerRef.current;
        const selectedElement = selectedItemRef.current;

        if (container && selectedElement) {
          // 计算需要滚动的距离
          const scrollTop =
            selectedElement.offsetTop - container.offsetTop - 50; // 50px 的偏移量

          // 平滑滚动到选中元素
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [visible, selectedItem]);

  const handleClosePopup = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    loadMoreData();
  }, [loadMoreData]);
  return (
    <>
      <div className={styleName.filter_container}>
        <div onClick={handleOpenPopup} className={ styleName.cursor_pointer}>
          {selectedItem ? selectedItem.label : '--'}
        </div>
        <ChevronDown />
      </div>
      <Popup
        visible={visible}
        onMaskClick={handleClosePopup}
        onClose={handleClosePopup}
        position='top'
        bodyStyle={{ height: '60vh' }}
      >
        {
          (
            <div className={styleName.popup_container}>
              {/* 标题栏 */}
              <div className={styleName.popup_header}>
                <h3 className={styleName.popup_title}>{prop.title || '-'}</h3>
              </div>

              {/* 可滚动的内容区域 */}
              <div ref={scrollContainerRef} className={styleName.popup_content}>
                {/* 数据列表 */}
                <div className={styleName.popup_list}>
                  {data.map((item) => (
                    <div
                      key={item.value}
                      ref={
                        selectedItem?.value === item.value
                          ? selectedItemRef
                          : null
                      }
                      className={`${styleName.popup_item } ${selectedItem?.value === item.value ? styleName.popup_item_active : ''}`}
                      onClick={() => handleItemSelect(item)}
                    >
                      <div
                        className={`${styleName.popup_item_time} popup-item-time ${selectedItem?.value === item.value ? styleName.popup_item_time_active : ''}`}
                      >
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 哨兵元素 - 触发加载更多 */}
                {hasMore && (
                  <div ref={sentinelRef} className={styleName.popup_sentinel} />
                )}

                {/* 加载更多指示器 */}
                {isLoading && (
                  <div className={styleName.popup_loading}>
                    <DotLoading color='primary' />
                    <span className={styleName.popup_loading_text}>加载中...</span>
                  </div>
                )}

                {/* 没有更多数据提示 */}
                {!hasMore && !isLoading && (
                  <div className={styleName.popup_nomore}>没有更多数据了</div>
                )}
              </div>
            </div>
          ) as any
        }
      </Popup>
    </>
  );
}
