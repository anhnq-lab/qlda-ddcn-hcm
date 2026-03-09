
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Employee } from '../types';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    currentUser: Employee | null;
    supabaseUser: User | null;
    session: Session | null;
    login: (identifier: string, pass: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Resolve identifier → email for Supabase Auth login.
 * Supports: username, email, or phone.
 */
async function resolveEmail(identifier: string): Promise<string | null> {
    // If already an email, return as-is
    if (identifier.includes('@')) return identifier;

    // Lookup username from user_accounts (case-sensitive)
    const { data: account } = await supabase
        .from('user_accounts')
        .select('employee_id')
        .eq('username', identifier)
        .limit(1)
        .single();

    if (account) {
        // Get email from employees table
        const { data: emp } = await supabase
            .from('employees')
            .select('email')
            .eq('employee_id', account.employee_id)
            .single();
        return emp?.email || null;
    }

    // Try phone lookup
    const { data: phoneData } = await supabase
        .from('employees')
        .select('email')
        .eq('phone', identifier)
        .limit(1)
        .single();
    return phoneData?.email || null;
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
        .single();

    if (!account) return null;

    const { data: emp } = await supabase
        .from('employees')
        .select('*')
        .eq('employee_id', account.employee_id)
        .single();

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
    const [isLoading, setIsLoading] = useState(true);

    const handleAuthUser = useCallback(async (authUser: User | null) => {
        if (!authUser) {
            setCurrentUser(null);
            setSupabaseUser(null);
            return;
        }

        setSupabaseUser(authUser);
        const employee = await fetchEmployeeByAuthId(authUser.id);
        if (employee) {
            setCurrentUser(employee);
        } else {
            // Fallback: user exists in Auth but not linked to employee
            // Use auth metadata instead
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
        }
    }, []);

    // === DEV AUTO-LOGIN: Set to false to disable ===
    const DEV_AUTO_LOGIN = import.meta.env.DEV;

    // Initialize: restore session + setup auth listener
    useEffect(() => {
        let mounted = true;

        // DEV MODE: Auto-login as Admin without Supabase Auth
        if (DEV_AUTO_LOGIN) {
            (async () => {
                try {
                    // Fetch Admin user from database directly
                    const { data: account } = await supabase
                        .from('user_accounts')
                        .select('employee_id, username')
                        .eq('username', 'Admin')
                        .single();

                    if (account) {
                        const { data: emp } = await supabase
                            .from('employees')
                            .select('*')
                            .eq('employee_id', account.employee_id)
                            .single();

                        if (emp && mounted) {
                            console.log('[Auth] 🚀 DEV auto-login as:', emp.full_name);
                            setCurrentUser({
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
                                Password: '',
                            });
                        }
                    }
                } catch (err) {
                    console.warn('[Auth] DEV auto-login failed, falling back to normal auth:', err);
                } finally {
                    if (mounted) setIsLoading(false);
                }
            })();
            return;
        }

        // PRODUCTION: Normal Supabase Auth flow
        // 1) Restore existing session
        supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
            if (!mounted) return;
            setSession(existingSession);
            handleAuthUser(existingSession?.user ?? null).finally(() => {
                if (mounted) setIsLoading(false);
            });
        });

        // 2) Listen for auth changes (login/logout/token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                if (!mounted) return;
                setSession(newSession);
                await handleAuthUser(newSession?.user ?? null);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [handleAuthUser]);

    const login = async (identifier: string, pass: string): Promise<boolean> => {
        // Resolve username/phone to email for Supabase Auth
        const email = await resolveEmail(identifier);
        if (!email) {
            console.error('[Auth] Could not resolve email for:', identifier);
            return false;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error || !data.user) {
            console.error('[Auth] Login failed:', error?.message);
            return false;
        }

        // Update last_login in user_accounts
        supabase
            .from('user_accounts')
            .update({ last_login: new Date().toISOString() })
            .eq('auth_user_id', data.user.id)
            .then(() => { }); // fire-and-forget

        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setSupabaseUser(null);
        setSession(null);
        localStorage.removeItem('currentUser'); // Clean up legacy storage
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            supabaseUser,
            session,
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
