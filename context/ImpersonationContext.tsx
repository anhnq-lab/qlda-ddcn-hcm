/**
 * ImpersonationContext — QLDA ĐDCN TP.HCM
 *
 * Allows admin users to "impersonate" other employees to test permissions.
 * Pattern follows cic-erp-contract/contexts/ImpersonationContext.tsx
 *
 * State is persisted in localStorage so it survives page reload.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employee } from '../types';

const STORAGE_KEY = 'qlda_impersonation';

interface ImpersonationContextType {
    /** The employee being impersonated (or null) */
    impersonatedUser: Employee | null;
    /** Whether we are currently impersonating */
    isImpersonating: boolean;
    /** Start impersonating a user */
    startImpersonation: (user: Employee) => void;
    /** Stop impersonating and return to real user */
    stopImpersonation: () => void;
}

const ImpersonationContext = createContext<ImpersonationContextType | undefined>(undefined);

export const ImpersonationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize from localStorage if available
    const [impersonatedUser, setImpersonatedUser] = useState<Employee | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                console.log('[Impersonation] Restored:', parsed.FullName, parsed.Role);
                return parsed;
            }
        } catch (err) {
            console.warn('[Impersonation] Failed to restore:', err);
            localStorage.removeItem(STORAGE_KEY);
        }
        return null;
    });

    const startImpersonation = (user: Employee) => {
        setImpersonatedUser(user);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch (err) {
            console.warn('[Impersonation] Failed to save:', err);
        }
        console.log('[Impersonation] Started as:', user.FullName, user.Role);
    };

    const stopImpersonation = () => {
        console.log('[Impersonation] Stopped');
        setImpersonatedUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <ImpersonationContext.Provider
            value={{
                impersonatedUser,
                isImpersonating: !!impersonatedUser,
                startImpersonation,
                stopImpersonation,
            }}
        >
            {children}
        </ImpersonationContext.Provider>
    );
};

export const useImpersonation = () => {
    const context = useContext(ImpersonationContext);
    if (!context) {
        throw new Error('useImpersonation must be used within ImpersonationProvider');
    }
    return context;
};
