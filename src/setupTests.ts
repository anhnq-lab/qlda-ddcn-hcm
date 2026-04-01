/**
 * Vitest Global Setup
 * Mock Supabase client + browser APIs cho test environment
 */
import { vi } from 'vitest';

// ── Mock Supabase Client ─────────────────────────────────────────
const mockSupabaseResponse = {
    data: null as unknown,
    error: null as unknown,
    count: null as number | null,
};

// Chainable query builder mock
function createQueryBuilder() {
    const builder: Record<string, any> = {};
    const methods = [
        'select', 'insert', 'update', 'delete', 'upsert',
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
        'in', 'not', 'is', 'like', 'ilike',
        'or', 'and', 'filter',
        'order', 'limit', 'range', 'single', 'maybeSingle',
        'textSearch', 'match', 'contains', 'containedBy',
        'csv', 'returns',
    ];

    for (const method of methods) {
        builder[method] = vi.fn().mockReturnValue(builder);
    }

    // Terminal methods return the response
    builder.then = vi.fn((resolve: (value: unknown) => void) => {
        resolve(mockSupabaseResponse);
        return Promise.resolve(mockSupabaseResponse);
    });

    // Make it properly thenable
    Object.defineProperty(builder, Symbol.toStringTag, { value: 'Promise' });

    return builder;
}

const mockQueryBuilder = createQueryBuilder();

export const mockSupabase = {
    from: vi.fn().mockReturnValue(mockQueryBuilder),
    rpc: vi.fn().mockResolvedValue(mockSupabaseResponse),
    auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    storage: {
        from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
            getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/file.pdf' } }),
            download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
        }),
    },
    functions: {
        invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
};

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
    supabase: mockSupabase,
}));

vi.mock('../lib/supabase', () => ({
    supabase: mockSupabase,
}));

// ── Mock Browser APIs ────────────────────────────────────────────

// crypto.subtle for password hashing
if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, 'crypto', {
        value: {
            subtle: {
                digest: vi.fn().mockImplementation(async (_algo: string, data: ArrayBuffer) => {
                    // Simple mock hash — just returns a deterministic buffer
                    const input = new Uint8Array(data);
                    const hash = new Uint8Array(32);
                    for (let i = 0; i < input.length; i++) {
                        hash[i % 32] = (hash[i % 32] + input[i]) & 0xff;
                    }
                    return hash.buffer;
                }),
            },
            getRandomValues: (arr: Uint8Array) => {
                for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
                return arr;
            },
        },
    });
}

// ── Helper: Reset mocks between tests ────────────────────────────
export function resetMocks() {
    mockSupabaseResponse.data = null;
    mockSupabaseResponse.error = null;
    mockSupabaseResponse.count = null;
    vi.clearAllMocks();
}

export function setMockResponse(data: unknown, error: unknown = null) {
    mockSupabaseResponse.data = data;
    mockSupabaseResponse.error = error;
}

export { mockQueryBuilder };
