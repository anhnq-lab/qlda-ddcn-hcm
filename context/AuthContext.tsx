
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Employee } from '../types';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    currentUser: Employee | null;
    supabaseUser: User | null;
    session: Session | null;
    userType: 'employee' | 'contractor';
    contractorId: string | null;
    login: (identifier: string, pass: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Resolve identifier → email for Supabase Auth login.
 * Supports: username (employee or contractor), email, or phone.
 * Has a 10s timeout to avoid hanging.
 */
async function resolveEmail(identifier: string): Promise<string | null> {
    // If already an email, return as-is
    if (identifier.includes('@')) return identifier;

    console.log('[resolveEmail] Looking up:', identifier);

    // Wrap in a timeout to avoid hanging
    const resolveWithTimeout = async (): Promise<string | null> => {
        try {
            // 1) Lookup username from user_accounts (employee login)
            const { data: account, error: accErr } = await supabase
                .from('user_accounts')
                .select('employee_id')
                .ilike('username', identifier)
                .limit(1)
                .maybeSingle();

            if (accErr) console.warn('[resolveEmail] user_accounts error:', accErr.message);

            if (account) {
                const { data: emp } = await supabase
                    .from('employees')
                    .select('email')
                    .eq('employee_id', account.employee_id)
                    .maybeSingle();
                console.log('[resolveEmail] Found employee email:', emp?.email);
                return emp?.email || null;
            }

            // 2) Try contractor_accounts lookup
            const { data: contractorAccount, error: ctrErr } = await supabase
                .from('contractor_accounts')
                .select('email, username, auth_user_id')
                .ilike('username', identifier)
                .eq('is_active', true)
                .limit(1)
                .maybeSingle();

            if (ctrErr) console.error('[resolveEmail] contractor_accounts error:', ctrErr.message, ctrErr);

            if (contractorAccount) {
                const email = contractorAccount.email || `${contractorAccount.username}@cde.local`;
                console.log('[resolveEmail] Found contractor email:', email);
                return email;
            }

            // 3) Try phone lookup
            const { data: phoneData } = await supabase
                .from('employees')
                .select('email')
                .eq('phone', identifier)
                .limit(1)
                .maybeSingle();

            console.log('[resolveEmail] No match found for:', identifier);
            return phoneData?.email || null;
        } catch (err) {
            console.error('[resolveEmail] Exception:', err);
            return null;
        }
    };

    // Race against timeout
    const result = await Promise.race([
        resolveWithTimeout(),
        new Promise<null>((resolve) => {
            setTimeout(() => {
                console.error('[resolveEmail] Timed out after 10s');
                resolve(null);
            }, 10000);
        }),
    ]);

    return result;
}

/**
 * Fetch employee profile from Supabase using auth user ID.
 */
async function fetchEmployeeByAuthId(authUserId: string): Promise<Employee | null> {
    // First get employee_id from user_accounts
    const { data: account } = await supabase
        .from('user_accounts')
        .select('employee_id, username')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

    if (!account) return null;

    const { data: emp } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', account.employee_id)
        .maybeSingle();

    if (!emp) return null;

    return {
        EmployeeID: emp.employee_id,
        FullName: emp.full_name,
        Role: emp.role as any,
        Department: emp.department || '',
        Position: emp.position || '',
        Email: emp.email || '',
        Phone: emp.phone || '',
        AvatarUrl: emp.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.full_name)}&background=0D8ABC&color=fff`,
        JoinDate: emp.join_date || '',
        Status: emp.status as any || 'Active',
        Username: account.username,
        Password: '', // Never store password
    };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [userType, setUserType] = useState<'employee' | 'contractor'>('employee');
    const [contractorId, setContractorId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleAuthUser = useCallback(async (authUser: User | null) => {
        if (!authUser) {
            setCurrentUser(null);
            setSupabaseUser(null);
            setUserType('employee');
            setContractorId(null);
            return;
        }

        setSupabaseUser(authUser);

        // Try employee first
        const employee = await fetchEmployeeByAuthId(authUser.id);
        if (employee) {
            setCurrentUser(employee);
            setUserType('employee');
            setContractorId(null);
            console.log('[Auth] Logged in as employee:', employee.FullName);
            return;
        }

        // Try contractor
        const { data: contractorAccount } = await supabase
            .from('contractor_accounts')
            .select('*, contractors(full_name)')
            .eq('auth_user_id', authUser.id)
            .eq('is_active', true)
            .maybeSingle();

        if (contractorAccount) {
            const contractorName = (contractorAccount as any).contractors?.full_name || contractorAccount.display_name || 'Nhà thầu';
            setUserType('contractor');
            setContractorId(contractorAccount.contractor_id);
            setCurrentUser({
                EmployeeID: authUser.id,
                FullName: contractorName,
                Role: 'contractor' as any,
                Department: contractorAccount.display_name || '',
                Position: 'Nhà thầu',
                Email: contractorAccount.email || '',
                Phone: contractorAccount.phone || '',
                AvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(contractorName)}&background=D4A017&color=fff`,
                JoinDate: '',
                Status: 'Active' as any,
                Username: contractorAccount.username,
                Password: '',
            });
            console.log('[Auth] Logged in as contractor:', contractorName);
            return;
        }

        // Fallback: user exists in Auth but not linked
        setUserType('employee');
        setContractorId(null);
        setCurrentUser({
            EmployeeID: authUser.id,
            FullName: authUser.email || 'User',
            Role: 'Staff' as any,
            Department: '',
            Position: '',
            Email: authUser.email || '',
            Phone: '',
            AvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.email || 'U')}&background=0D8ABC&color=fff`,
            JoinDate: '',
            Status: 'Active' as any,
            Username: authUser.email || '',
            Password: '',
        });
    }, []);

    // Initialize: restore session + setup auth listener
    useEffect(() => {
        let mounted = true;

        // Safety timeout: if auth check takes too long, stop loading
        const timeout = setTimeout(() => {
            if (mounted && isLoading) {
                console.warn('[Auth] Session check timed out after 8s, redirecting to login');
                setIsLoading(false);
            }
        }, 8000);

        // Restore existing session
        supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
            if (!mounted) return;
            setSession(existingSession);
            handleAuthUser(existingSession?.user ?? null).finally(() => {
                if (mounted) {
                    setIsLoading(false);
                    clearTimeout(timeout);
                }
            });
        }).catch((err) => {
            console.error('[Auth] getSession failed:', err);
            if (mounted) {
                setIsLoading(false);
                clearTimeout(timeout);
            }
        });

        // Listen for auth changes (login/logout/token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                if (!mounted) return;
                setSession(newSession);
                await handleAuthUser(newSession?.user ?? null);
            }
        );

        return () => {
            mounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, [handleAuthUser]);

    const login = async (identifier: string, pass: string): Promise<boolean> => {
        console.log('[Auth] Login attempt for:', identifier);

        // Clear any stale session that might block Supabase queries
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch (e) {
            // Ignore signOut errors
        }

        // Resolve username/phone to email for Supabase Auth
        const email = await resolveEmail(identifier);
        console.log('[Auth] Resolved email:', email);
        if (!email) {
            console.error('[Auth] Could not resolve email for:', identifier);
            return false;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error || !data.user) {
            console.error('[Auth] Login failed:', error?.message, error?.status);
            return false;
        }

        console.log('[Auth] Login success for:', email);

        // Update last_login (fire-and-forget)
        supabase
            .from('user_accounts')
            .update({ last_login: new Date().toISOString() } as any)
            .eq('auth_user_id', data.user.id)
            .then(() => { });

        supabase
            .from('contractor_accounts')
            .update({ last_login: new Date().toISOString() } as any)
            .eq('auth_user_id', data.user.id)
            .then(() => { });

        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSupabaseUser(null);
        setSession(null);
        setUserType('employee');
        setContractorId(null);
        localStorage.removeItem('currentUser');
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            supabaseUser,
            session,
            userType,
            contractorId,
            login,
            logout,
            isAuthenticated: !!currentUser,
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
