// 修改 useInfiniteScroll.tsx
import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  checkOnMount?: boolean;
  rootElement?: HTMLElement | null; // 新增：指定滚动容器
}

export const useInfiniteScroll = (
  onLoadMore: () => void | Promise<void>,
  options: UseInfiniteScrollOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
    checkOnMount = true,
    rootElement = null,
  } = options;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled && !loadingRef.current) {
        loadingRef.current = true;
        Promise.resolve(onLoadMore()).finally(() => {
          loadingRef.current = false;
        });
      }
    },
    [onLoadMore, enabled]
  );

  // 检查哨兵元素是否在滚动容器内
  const checkInitialPosition = useCallback(() => {
    if (!sentinelRef.current || !enabled || loadingRef.current) return;

    const scrollContainer = rootElement || document.documentElement;
    const containerRect = scrollContainer.getBoundingClientRect();
    const sentinelRect = sentinelRef.current.getBoundingClientRect();

    // 检查哨兵元素是否在滚动容器内可见
    const isVisible =
      sentinelRect.top < containerRect.bottom &&
      sentinelRect.bottom > containerRect.top;

    if (isVisible) {
      loadingRef.current = true;
      Promise.resolve(onLoadMore()).finally(() => {
        loadingRef.current = false;
      });
    }
  }, [onLoadMore, enabled, rootElement]);

  useEffect(() => {
    if (!enabled || !sentinelRef.current) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
      root: rootElement, // 指定滚动容器
    });

    observer.observe(sentinelRef.current);

    // 如果启用初始检查，延迟检查哨兵元素位置
    if (checkOnMount) {
      const timer = setTimeout(checkInitialPosition, 200); // 增加延迟时间
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }

    return () => {
      observer.disconnect();
    };
  }, [
    handleIntersection,
    enabled,
    threshold,
    rootMargin,
    checkOnMount,
    checkInitialPosition,
    rootElement,
  ]);

  return { sentinelRef };
};
