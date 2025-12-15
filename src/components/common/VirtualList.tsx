import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Virtual List Component
 * Efficiently renders large lists by only rendering visible items
 */

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((item: T, index: number) => number);
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
  renderItem: (item: T, index: number, style: React.CSSProperties) => React.ReactNode;
  getItemKey?: (item: T, index: number) => string | number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  isLoading?: boolean;
}

interface ItemMetadata {
  offset: number;
  height: number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
  className = '',
  containerHeight = 400,
  renderItem,
  getItemKey,
  onEndReached,
  endReachedThreshold = 100,
  header,
  footer,
  emptyState,
  loadingState,
  isLoading = false,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState(0);

  // Calculate item metadata (positions and heights)
  const itemMetadata = useMemo((): ItemMetadata[] => {
    const metadata: ItemMetadata[] = [];
    let offset = 0;

    for (let i = 0; i < items.length; i++) {
      const height = typeof itemHeight === 'function'
        ? itemHeight(items[i], i)
        : itemHeight;

      metadata.push({ offset, height });
      offset += height;
    }

    return metadata;
  }, [items, itemHeight]);

  // Total content height
  const totalHeight = useMemo(() => {
    if (itemMetadata.length === 0) return 0;
    const lastItem = itemMetadata[itemMetadata.length - 1];
    return lastItem.offset + lastItem.height;
  }, [itemMetadata]);

  // Find visible range using binary search
  const getVisibleRange = useCallback((
    scrollTop: number,
    containerHeight: number
  ): { start: number; end: number } => {
    if (itemMetadata.length === 0) {
      return { start: 0, end: 0 };
    }

    // Binary search for start index
    let start = 0;
    let end = itemMetadata.length - 1;

    while (start < end) {
      const mid = Math.floor((start + end) / 2);
      const item = itemMetadata[mid];

      if (item.offset + item.height < scrollTop) {
        start = mid + 1;
      } else {
        end = mid;
      }
    }

    const startIndex = Math.max(0, start - overscan);

    // Find end index
    end = start;
    const visibleEnd = scrollTop + containerHeight;

    while (end < itemMetadata.length && itemMetadata[end].offset < visibleEnd) {
      end++;
    }

    const endIndex = Math.min(itemMetadata.length, end + overscan);

    return { start: startIndex, end: endIndex };
  }, [itemMetadata, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check for end reached
    if (onEndReached) {
      const distanceFromEnd = target.scrollHeight - target.scrollTop - target.clientHeight;
      if (distanceFromEnd < endReachedThreshold) {
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Observe container size changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerSize(container.clientHeight);

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate visible range
  const { start, end } = getVisibleRange(scrollTop, containerSize);

  // Render visible items
  const visibleItems = useMemo(() => {
    const rendered: React.ReactNode[] = [];

    for (let i = start; i < end; i++) {
      const item = items[i];
      const metadata = itemMetadata[i];

      if (!item || !metadata) continue;

      const key = getItemKey ? getItemKey(item, i) : i;
      const style: React.CSSProperties = {
        position: 'absolute',
        top: metadata.offset,
        left: 0,
        right: 0,
        height: metadata.height,
      };

      rendered.push(
        <div key={key} style={style}>
          {renderItem(item, i, style)}
        </div>
      );
    }

    return rendered;
  }, [start, end, items, itemMetadata, renderItem, getItemKey]);

  // Handle empty state
  if (!isLoading && items.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      {header}

      <div
        style={{
          position: 'relative',
          height: totalHeight,
          width: '100%',
        }}
      >
        {visibleItems}
      </div>

      {isLoading && loadingState}
      {footer}
    </div>
  );
}

// Hook for virtual scrolling with dynamic heights
export function useVirtualScroll<T>(
  items: T[],
  options: {
    estimatedItemHeight: number;
    overscan?: number;
    containerRef: React.RefObject<HTMLElement>;
  }
) {
  const { estimatedItemHeight, overscan = 3, containerRef } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const measuredHeights = useRef<Map<number, number>>(new Map());

  // Get item height (measured or estimated)
  const getItemHeight = useCallback((index: number): number => {
    return measuredHeights.current.get(index) ?? estimatedItemHeight;
  }, [estimatedItemHeight]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  }, [items.length, getItemHeight]);

  // Get item offset
  const getItemOffset = useCallback((index: number): number => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [getItemHeight]);

  // Find visible range
  const visibleRange = useMemo(() => {
    let start = 0;
    let offset = 0;

    // Find start
    while (start < items.length && offset + getItemHeight(start) < scrollTop) {
      offset += getItemHeight(start);
      start++;
    }

    start = Math.max(0, start - overscan);

    // Find end
    let end = start;
    offset = getItemOffset(start);

    while (end < items.length && offset < scrollTop + containerHeight) {
      offset += getItemHeight(end);
      end++;
    }

    end = Math.min(items.length, end + overscan);

    return { start, end };
  }, [items.length, scrollTop, containerHeight, overscan, getItemHeight, getItemOffset]);

  // Measure item
  const measureItem = useCallback((index: number, height: number) => {
    const prevHeight = measuredHeights.current.get(index);
    if (prevHeight !== height) {
      measuredHeights.current.set(index, height);
    }
  }, []);

  // Scroll handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    const handleResize = () => {
      setContainerHeight(container.clientHeight);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  // Scroll to index
  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = 'auto') => {
    const container = containerRef.current;
    if (!container) return;

    const offset = getItemOffset(index);
    container.scrollTo({ top: offset, behavior });
  }, [containerRef, getItemOffset]);

  return {
    visibleRange,
    totalHeight,
    getItemOffset,
    getItemHeight,
    measureItem,
    scrollToIndex,
  };
}

export default VirtualList;
