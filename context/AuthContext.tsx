
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
 * Resolve identifier → email via single RPC call.
 * Supports: username (employee or contractor), email, or phone.
 */
async function resolveEmail(identifier: string): Promise<string | null> {
    if (identifier.includes('@')) return identifier;

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('resolve_user_identity', {
            p_identifier: identifier,
        }) as { data: { email: string | null } | null; error: any };

        if (error) {
            console.error('[resolveEmail] RPC error:', error.message);
            return null;
        }

        return data?.email || null;
    } catch (err) {
        console.error('[resolveEmail] Exception:', err);
        return null;
    }
}

/**
 * Fetch user profile (employee or contractor) via single RPC call.
 */
async function fetchUserProfile(authUserId: string): Promise<{
    user: Employee | null;
    userType: 'employee' | 'contractor';
    contractorId: string | null;
}> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.rpc as any)('get_user_profile_by_auth_id', {
            p_auth_user_id: authUserId,
        }) as { data: Record<string, any> | null; error: any };

        if (error || !data || data.user_type === 'unknown') {
            return { user: null, userType: 'employee', contractorId: null };
        }

        if (data.user_type === 'employee') {
            return {
                user: {
                    EmployeeID: data.employee_id,
                    FullName: data.full_name,
                    Role: data.role as any,
                    Department: data.department || '',
                    Position: data.position || '',
                    Email: data.email || '',
                    Phone: data.phone || '',
                    AvatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.full_name)}&background=0D8ABC&color=fff`,
                    JoinDate: data.join_date || '',
                    Status: data.status as any || 'Active',
                    Username: data.username || '',
                    Password: '',
                },
                userType: 'employee',
                contractorId: null,
            };
        }

        if (data.user_type === 'contractor') {
            const contractorName = data.full_name || 'Nhà thầu';
            
            // Fetch allowed_project_ids for this contractor account
            let allowedProjectIds: string[] = [];
            try {
                const { data: contractorData, error: contractorErr } = await supabase
                    .from('contractor_accounts')
                    .select('allowed_project_ids')
                    .eq('auth_user_id', authUserId)
                    .single();
                
                if (!contractorErr && contractorData?.allowed_project_ids) {
                    allowedProjectIds = contractorData.allowed_project_ids;
                }
            } catch (err) {
                console.error('[fetchUserProfile] Error fetching contractor accounts:', err);
            }

            return {
                user: {
                    EmployeeID: authUserId,
                    FullName: contractorName,
                    Role: 'contractor' as any,
                    Department: data.display_name || '',
                    Position: 'Nhà thầu',
                    Email: data.email || '',
                    Phone: data.phone || '',
                    AvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(contractorName)}&background=f97316&color=fff`,
                    JoinDate: '',
                    Status: 'Active' as any,
                    Username: data.username || '',
                    Password: '',
                    AllowedProjectIDs: allowedProjectIds,
                },
                userType: 'contractor',
                contractorId: data.contractor_id,
            };
        }

        return { user: null, userType: 'employee', contractorId: null };
    } catch (err) {
        console.error('[fetchUserProfile] Exception:', err);
        return { user: null, userType: 'employee', contractorId: null };
    }
}

let autoLoginAttempted = false;

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

        // Single RPC call to resolve user profile (employee or contractor)
        const profile = await fetchUserProfile(authUser.id);

        if (profile.user) {
            setCurrentUser(profile.user);
            setUserType(profile.userType);
            setContractorId(profile.contractorId);
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

        // Safety timeout: reduced from 8s to 5s for faster UX
        const timeout = setTimeout(() => {
            if (mounted && isLoading) {
                console.warn('[Auth] Session check timed out after 5s');
                setIsLoading(false);
            }
        }, 5000);

        const initAuth = async () => {
            try {
                // Wrap getSession in a 2-second timeout to avoid Web Lock API deadlocks from Vite HMR
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise<{data: {session: null}, error: Error}>((_, reject) => {
                    setTimeout(() => reject(new Error('Supabase getSession timeout (Vite HMR Deadlock)')), 2000);
                });

                let existingSession: Session | null = null;
                try {
                    const result = await Promise.race([sessionPromise, timeoutPromise]);
                    if (result.error) throw result.error;
                    existingSession = result.data.session;
                } catch (e: any) {
                    console.warn('[Auth] getSession failed or timed out:', e.message);
                    // Provide a hint to the user for HMR deadlocks
                    if (e.message.includes('Deadlock')) {
                        console.error('🚨 HMR DEADLOCK DETECTED! PLEASE HARD REFRESH THE BROWSER (F5 or CMD+R) TO RELEASE SUPABASE AUTH LOCKS 🚨');
                    }
                }
                
                // --- DEV AUTO-LOGIN ---
                // Dành cho local development: Không cần đăng nhập, tự động có full quyền
                if (import.meta.env.DEV && !existingSession) {
                    // Check if user explicitly logged out in this tab
                    const explicitlyLoggedOut = localStorage.getItem('explicitlyLoggedOut') === 'true';
                    
                    if (!explicitlyLoggedOut && !autoLoginAttempted) {
                        autoLoginAttempted = true; // Prevent concurrent calls in React.StrictMode
                        console.log('[Auth] 🔧 Local Dev: Auto-logging in as Admin...');
                        const demoLogin = await supabase.auth.signInWithPassword({
                            email: 'admin@bqlddcn.gov.vn',
                            password: '123456',
                        });
                        
                        // Give it a tiny delay to let lock release from Supabase JS internals
                        await new Promise(r => setTimeout(r, 100));
                        
                        if (demoLogin.data?.session) {
                            if (!mounted) return;
                            setSession(demoLogin.data.session);
                            await handleAuthUser(demoLogin.data.user);
                            setIsLoading(false);
                            clearTimeout(timeout);
                            return; // Dừng ở đây vì login thành công
                        } else if (demoLogin.error) {
                            console.error('[Auth] Local Dev Auto-login failed:', demoLogin.error.message);
                        }
                    }
                }
                
                // Normal flow
                if (!mounted) return;
                setSession(existingSession);
                await handleAuthUser(existingSession?.user ?? null);
            } catch (err) {
                console.error('[Auth] initAuth failed:', err);
                if (mounted) {
                    setSession(null);
                    await handleAuthUser(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                    clearTimeout(timeout);
                }
            }
        };

        initAuth();

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
            await Promise.race([
                supabase.auth.signOut({ scope: 'local' }),
                new Promise((res) => setTimeout(res, 500))
            ]);
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
            console.error('[Auth] Login failed via Supabase Auth:', error?.message);
            // If we are in Dev and they typed "admin", maybe the network failed, but we still allow real login attempt
            if (import.meta.env.DEV && identifier.toLowerCase() === 'admin' && pass === '123456') {
                console.warn('[Auth] ⚠️ Network issue? DEV Admin fallback triggered.');
                const demoLogin = await supabase.auth.signInWithPassword({
                    email: 'admin@bqlddcn.gov.vn',
                    password: '123456',
                });
                if (demoLogin.data?.session) {
                    localStorage.removeItem('explicitlyLoggedOut');
                    setSession(demoLogin.data.session);
                    setSupabaseUser(demoLogin.data.user);
                    return true;
                }
            }
            return false;
        }

        console.log('[Auth] Login success for:', email);
        localStorage.removeItem('explicitlyLoggedOut');

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
        localStorage.removeItem('demoBypassActive');
        localStorage.setItem('explicitlyLoggedOut', 'true');
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

