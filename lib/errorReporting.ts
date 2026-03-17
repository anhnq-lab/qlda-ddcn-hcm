/**
 * Error Reporting Service
 * Centralized error tracking for production.
 * 
 * Currently logs to console + stores recent errors in-memory.
 * Drop-in ready for Sentry integration when needed.
 */

interface ErrorReport {
    message: string;
    stack?: string;
    context?: Record<string, unknown>;
    timestamp: string;
    url: string;
    userAgent: string;
}

const MAX_STORED_ERRORS = 50;
const storedErrors: ErrorReport[] = [];

const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Report an error to the tracking system.
 * In production, errors are stored in-memory and can be sent to an API.
 */
export function reportError(
    error: Error | string,
    context?: Record<string, unknown>
): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error;

    const report: ErrorReport = {
        message: errorObj.message,
        stack: errorObj.stack,
        context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
    };

    // Always log to console
    if (IS_PRODUCTION) {
        console.error('[ErrorReport]', report.message, context);
    } else {
        console.error('[ErrorReport]', errorObj, context);
    }

    // Store in memory (ring buffer)
    storedErrors.push(report);
    if (storedErrors.length > MAX_STORED_ERRORS) {
        storedErrors.shift();
    }

    // Future: Send to Sentry, LogRocket, or custom API
    // sendToErrorAPI(report);
}

/**
 * Get recent errors for debugging.
 * Useful in admin panel or dev tools.
 */
export function getRecentErrors(): readonly ErrorReport[] {
    return [...storedErrors];
}

/**
 * Setup global error handlers for unhandled errors and promise rejections.
 * Call once at app initialization.
 */
export function setupGlobalErrorHandlers(): void {
    // Unhandled JS errors
    window.addEventListener('error', (event) => {
        reportError(event.error || event.message, {
            source: 'window.onerror',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason));

        reportError(error, {
            source: 'unhandledrejection',
        });
    });

    if (IS_PRODUCTION) {
        console.log('[ErrorReport] Global error handlers installed');
    }
}

/**
 * Track Web Vitals (CLS, LCP, FID/INP).
 * Reports to console in development, can be sent to analytics in production.
 */
export function trackWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    // Largest Contentful Paint
    try {
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
            if (lastEntry) {
                const lcp = lastEntry.startTime;
                if (!IS_PRODUCTION) console.log(`[WebVitals] LCP: ${lcp.toFixed(0)}ms`);
            }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
        // PerformanceObserver not supported for this type
    }

    // First Input Delay
    try {
        const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries() as (PerformanceEntry & { processingStart: number; startTime: number })[];
            for (const entry of entries) {
                const fid = entry.processingStart - entry.startTime;
                if (!IS_PRODUCTION) console.log(`[WebVitals] FID: ${fid.toFixed(0)}ms`);
            }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
    } catch {
        // PerformanceObserver not supported for this type
    }

    // Cumulative Layout Shift
    try {
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                }
            }
            if (!IS_PRODUCTION) console.log(`[WebVitals] CLS: ${clsScore.toFixed(3)}`);
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch {
        // PerformanceObserver not supported for this type
    }
}

export default { reportError, getRecentErrors, setupGlobalErrorHandlers, trackWebVitals };
