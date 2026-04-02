/**
 * useErrorToast — Unified error handling hook for React Query mutations.
 * 
 * Provides pre-configured onError callbacks for mutations,
 * eliminating duplicated error handling patterns across the app.
 * 
 * Usage:
 * ```ts
 * const { errorHandler } = useErrorToast();
 * 
 * const mutation = useMutation({
 *   mutationFn: () => api.updateProject(data),
 *   onError: errorHandler('Cập nhật dự án'),
 *   onSuccess: () => addToast({ message: 'Đã lưu', type: 'success' }),
 * });
 * ```
 */

import { useCallback } from 'react';
import { useToast } from '../components/ui/Toast';
import { reportError } from '../lib/errorReporting';

interface ErrorHandlerOptions {
    /** Silent mode — only log, no toast */
    silent?: boolean;
    /** Custom error message override */
    message?: string;
}

export function useErrorToast() {
    const { addToast } = useToast();

    /**
     * Returns a pre-configured onError callback for useMutation.
     * @param context - A short Vietnamese label for the operation (e.g. "Tạo dự án")
     * @param options - Optional overrides
     */
    const errorHandler = useCallback(
        (context: string, options?: ErrorHandlerOptions) => {
            return (error: Error | any) => {
                const errorMessage =
                    options?.message ||
                    error?.message ||
                    'Đã xảy ra lỗi không xác định.';

                // Report to error tracking system
                reportError(error instanceof Error ? error : new Error(errorMessage), {
                    source: 'mutation',
                    context,
                });

                // Show user-facing toast (unless silent)
                if (!options?.silent) {
                    addToast({
                        title: `Lỗi: ${context}`,
                        message: errorMessage,
                        type: 'error',
                    });
                }
            };
        },
        [addToast]
    );

    /**
     * Returns a pre-configured onSuccess callback for useMutation.
     * @param message - Success message to show
     */
    const successHandler = useCallback(
        (message: string) => {
            return () => {
                addToast({
                    message,
                    type: 'success',
                });
            };
        },
        [addToast]
    );

    return { errorHandler, successHandler };
}

export default useErrorToast;
