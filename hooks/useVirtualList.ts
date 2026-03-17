import React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';

interface UseVirtualListOptions<T> {
    /** Full data array */
    items: T[];
    /** Height of each row in pixels */
    itemHeight: number;
    /** Number of extra items to render above/below the viewport */
    overscan?: number;
    /** Container height override (auto-detected from ref if not set) */
    containerHeight?: number;
}

interface UseVirtualListReturn<T> {
    /** Ref to attach to the scroll container */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Visible items to render */
    virtualItems: { item: T; index: number; style: React.CSSProperties }[];
    /** Total height of the scrollable area (for the spacer div) */
    totalHeight: number;
    /** Current scroll offset */
    scrollOffset: number;
}

/**
 * useVirtualList — Lightweight virtual scrolling hook.
 * Renders only visible items + overscan buffer for smooth scrolling.
 *
 * @example
 * const { containerRef, virtualItems, totalHeight } = useVirtualList({
 *     items: tasks,
 *     itemHeight: 56,
 *     overscan: 5,
 * });
 *
 * return (
 *     <div ref={containerRef} style={{ height: 600, overflowY: 'auto' }}>
 *         <div style={{ height: totalHeight, position: 'relative' }}>
 *             {virtualItems.map(({ item, index, style }) => (
 *                 <div key={index} style={style}>
 *                     <TaskRow task={item} />
 *                 </div>
 *             ))}
 *         </div>
 *     </div>
 * );
 */
export function useVirtualList<T>({
    items,
    itemHeight,
    overscan = 5,
    containerHeight: explicitHeight,
}: UseVirtualListOptions<T>): UseVirtualListReturn<T> {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [measuredHeight, setMeasuredHeight] = useState(explicitHeight ?? 600);

    const containerHeight = explicitHeight ?? measuredHeight;

    // Measure container height on mount and resize
    useEffect(() => {
        if (explicitHeight) return;

        const el = containerRef.current;
        if (!el) return;

        const measure = () => {
            const rect = el.getBoundingClientRect();
            if (rect.height > 0) {
                setMeasuredHeight(rect.height);
            }
        };

        measure();

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
    }, [explicitHeight]);

    // Scroll handler with RAF throttle
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                setScrollOffset(el.scrollTop);
                rafId = null;
            });
        };

        el.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            el.removeEventListener('scroll', handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    const totalHeight = items.length * itemHeight;

    const virtualItems = useMemo(() => {
        const startIndex = Math.max(0, Math.floor(scrollOffset / itemHeight) - overscan);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

        const result: { item: T; index: number; style: React.CSSProperties }[] = [];

        for (let i = startIndex; i <= endIndex; i++) {
            result.push({
                item: items[i],
                index: i,
                style: {
                    position: 'absolute',
                    top: i * itemHeight,
                    left: 0,
                    right: 0,
                    height: itemHeight,
                },
            });
        }

        return result;
    }, [items, itemHeight, scrollOffset, containerHeight, overscan]);

    return {
        containerRef,
        virtualItems,
        totalHeight,
        scrollOffset,
    };
}

export default useVirtualList;
