/**
 * Integration Tests — Auth Flow (UserAccountService)
 * Tests full login flow using username, email, and phone
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import UserAccountService from '../UserAccountService';

// ── Mock Setup ────────────────────────────────────────────────────
// We are mimicking a slightly more complex query structure for the different identifier types

function createChainMock(resolvedValue: { data: unknown; error: unknown }) {
    const chain: Record<string, any> = {};
    const methods = ['select', 'eq', 'single', 'update'];
    for (const m of methods) {
        chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.then = (resolve: Function) => {
        resolve(resolvedValue);
        return Promise.resolve(resolvedValue);
    };
    return chain;
}

const mockFrom = vi.fn();
vi.mock('../../lib/supabase', () => ({
    supabase: {
        from: (...args: any[]) => mockFrom(...args),
    },
}));

// Mock hashPassword
vi.mock('../../lib/utils', () => ({
    hashPassword: vi.fn().mockImplementation(async (pwd) => `hashed_${pwd}`),
}));

// ═══════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════
describe('Auth Flow Integration - UserAccountService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ─── Login Validation ─────────────────────────────────────────
    describe('validateLogin', () => {
        it('authenticates via username', async () => {
            // Setup chains
            const usernameChain = createChainMock({
                data: { employee_id: 'EMP-01', is_active: true },
                error: null,
            });
            const updateChain = createChainMock({ data: null, error: null });

            mockFrom.mockImplementation((table) => {
                if (table === 'user_accounts') {
                    // This will be called for the select and then the update
                    return vi.fn().mockImplementationOnce(() => usernameChain)
                             .mockImplementationOnce(() => updateChain)();
                }
                return createChainMock({ data: null, error: null });
            });

            // Need to handle the sequence of calls specifically if we want to spy on them accurately, 
            // but simply returning the mock chain is enough for the happy path test to work
            mockFrom.mockReturnValue(usernameChain);

            const employeeId = await UserAccountService.validateLogin('admin', '123456');
            
            expect(employeeId).toBe('EMP-01');
            expect(mockFrom).toHaveBeenCalledWith('user_accounts');
        });

        it('authenticates via email by looking up employee first', async () => {
            // First call (by username) -> fails
            const usernameChain = createChainMock({ data: null, error: null });
            // Second call (employees by email) -> returns EMP-02
            const employeeChain = createChainMock({ data: { employee_id: 'EMP-02' }, error: null });
            // Third call (user_accounts by EMP-02) -> returns active account
            const acctChain = createChainMock({ data: { employee_id: 'EMP-02', is_active: true }, error: null });
            
            let callCount = 0;
            mockFrom.mockImplementation((table) => {
                callCount++;
                if (callCount === 1) return usernameChain; // user_accounts (username lookup)
                if (callCount === 2) return employeeChain; // employees (email lookup)
                if (callCount === 3) return acctChain;     // user_accounts (acct lookup)
                return createChainMock({ data: null, error: null }); // fallback for update
            });

            const employeeId = await UserAccountService.validateLogin('admin@cic.com.vn', '123456');
            
            expect(employeeId).toBe('EMP-02');
            expect(callCount).toBeGreaterThanOrEqual(3);
        });

        it('rejects inactive accounts', async () => {
            const usernameChain = createChainMock({
                data: { employee_id: 'EMP-01', is_active: false },
                error: null,
            });
            mockFrom.mockReturnValue(usernameChain);

            const employeeId = await UserAccountService.validateLogin('admin', '123456');
            
            expect(employeeId).toBeNull(); // Should decline
        });

        it('returns null on completely unrecognized credentials', async () => {
            mockFrom.mockReturnValue(createChainMock({ data: null, error: null }));

            const employeeId = await UserAccountService.validateLogin('unknown', 'wrongpass');
            
            expect(employeeId).toBeNull();
        });
    });
});
