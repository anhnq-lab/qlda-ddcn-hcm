/**
 * Unit Tests — services/PaymentService.ts
 * Tests CRUD, approval workflow, status transitions, and label helpers
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from '../PaymentService';
import { PaymentStatus, PaymentType } from '../../types';

// ── Mock Supabase ─────────────────────────────────────────────────
function createChainMock(resolvedValue: { data: unknown; error: unknown }) {
    const chain: Record<string, any> = {};
    const methods = [
        'select', 'insert', 'update', 'delete',
        'eq', 'neq', 'in', 'not', 'or',
        'order', 'limit', 'range',
        'single', 'maybeSingle',
    ];
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

vi.mock('../../lib/dbMappers', () => ({
    dbToPayment: (row: any) => ({
        PaymentID: row.payment_id,
        ContractID: row.contract_id,
        Amount: row.amount,
        Status: row.status,
        Type: row.type,
        BatchNo: row.batch_no,
        ...row,
    }),
    paymentToDb: (data: any) => ({
        contract_id: data.ContractID,
        amount: data.Amount,
        status: data.Status,
        type: data.Type,
        batch_no: data.BatchNo,
    }),
}));

// ═══════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════
describe('PaymentService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // ─── getAll ───────────────────────────────────────────────────
    describe('getAll', () => {
        it('returns mapped payments', async () => {
            const mockData = [
                { payment_id: 1, contract_id: 'C1', amount: 100000, status: 'Draft', type: 'Volume' },
                { payment_id: 2, contract_id: 'C1', amount: 200000, status: 'Pending', type: 'Advance' },
            ];
            mockFrom.mockReturnValue(createChainMock({ data: mockData, error: null }));

            const payments = await PaymentService.getAll();
            expect(payments).toHaveLength(2);
            expect(payments[0].PaymentID).toBe(1);
        });

        it('applies contractId filter', async () => {
            const chain = createChainMock({ data: [], error: null });
            mockFrom.mockReturnValue(chain);

            await PaymentService.getAll({ filters: { contractId: 'C1' } });
            expect(chain.eq).toHaveBeenCalledWith('contract_id', 'C1');
        });

        it('throws on error', async () => {
            mockFrom.mockReturnValue(createChainMock({ data: null, error: { message: 'timeout' } }));
            await expect(PaymentService.getAll()).rejects.toThrow('Failed to fetch payments');
        });
    });

    // ─── Status Transitions (Pure Logic) ──────────────────────────
    describe('getAvailableTransitions', () => {
        it('Draft can go to Pending', () => {
            const transitions = PaymentService.getAvailableTransitions(PaymentStatus.Draft);
            expect(transitions).toContain(PaymentStatus.Pending);
            expect(transitions).not.toContain(PaymentStatus.Approved);
        });

        it('Pending can go to Approved or Rejected', () => {
            const transitions = PaymentService.getAvailableTransitions(PaymentStatus.Pending);
            expect(transitions).toContain(PaymentStatus.Approved);
            expect(transitions).toContain(PaymentStatus.Rejected);
        });

        it('Approved can go to Transferred or Rejected', () => {
            const transitions = PaymentService.getAvailableTransitions(PaymentStatus.Approved);
            expect(transitions).toContain(PaymentStatus.Transferred);
            expect(transitions).toContain(PaymentStatus.Rejected);
        });

        it('Transferred has no transitions (terminal state)', () => {
            const transitions = PaymentService.getAvailableTransitions(PaymentStatus.Transferred);
            expect(transitions).toHaveLength(0);
        });

        it('Rejected can revert to Draft', () => {
            const transitions = PaymentService.getAvailableTransitions(PaymentStatus.Rejected);
            expect(transitions).toContain(PaymentStatus.Draft);
            expect(transitions).toHaveLength(1);
        });
    });

    // ─── Label Helpers ────────────────────────────────────────────
    describe('getStatusLabel', () => {
        it('returns "Nháp" for Draft', () => {
            expect(PaymentService.getStatusLabel(PaymentStatus.Draft)).toBe('Nháp');
        });

        it('returns "Chờ duyệt" for Pending', () => {
            expect(PaymentService.getStatusLabel(PaymentStatus.Pending)).toBe('Chờ duyệt');
        });

        it('returns "Đã duyệt" for Approved', () => {
            expect(PaymentService.getStatusLabel(PaymentStatus.Approved)).toBe('Đã duyệt');
        });

        it('returns "Đã chuyển tiền" for Transferred', () => {
            expect(PaymentService.getStatusLabel(PaymentStatus.Transferred)).toBe('Đã chuyển tiền');
        });

        it('returns "Từ chối" for Rejected', () => {
            expect(PaymentService.getStatusLabel(PaymentStatus.Rejected)).toBe('Từ chối');
        });
    });

    describe('getTypeLabel', () => {
        it('returns "Tạm ứng" for Advance', () => {
            expect(PaymentService.getTypeLabel(PaymentType.Advance)).toBe('Tạm ứng');
        });

        it('returns "Thanh toán khối lượng" for Volume', () => {
            expect(PaymentService.getTypeLabel(PaymentType.Volume)).toBe('Thanh toán khối lượng');
        });
    });

    // ─── reject validation ────────────────────────────────────────
    describe('reject', () => {
        it('throws when reason is empty', async () => {
            await expect(PaymentService.reject(1, 'admin', ''))
                .rejects.toThrow('Vui lòng nhập lý do từ chối');
        });

        it('throws when reason is whitespace', async () => {
            await expect(PaymentService.reject(1, 'admin', '   '))
                .rejects.toThrow('Vui lòng nhập lý do từ chối');
        });
    });

    // ─── create ───────────────────────────────────────────────────
    describe('create', () => {
        it('creates payment with auto batch number', async () => {
            // Mock: existing payments query returns batch_no=3
            const batchChain = createChainMock({ data: [{ batch_no: 3 }], error: null });
            const insertChain = createChainMock({
                data: { payment_id: 99, contract_id: 'C1', amount: 500000, status: 'Draft', batch_no: 4 },
                error: null,
            });

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                return callCount === 1 ? batchChain : insertChain;
            });

            const result = await PaymentService.create({
                ContractID: 'C1',
                Amount: 500000,
            });

            expect(result.PaymentID).toBe(99);
        });
    });

    // ─── getStatusColor ──────────────────────────────────────────
    describe('getStatusColor', () => {
        it('returns correct colors for each status', () => {
            const draftColor = PaymentService.getStatusColor(PaymentStatus.Draft);
            expect(draftColor.bg).toContain('slate');

            const approvedColor = PaymentService.getStatusColor(PaymentStatus.Approved);
            expect(approvedColor.bg).toContain('blue');

            const transferColor = PaymentService.getStatusColor(PaymentStatus.Transferred);
            expect(transferColor.bg).toContain('emerald');

            const rejectColor = PaymentService.getStatusColor(PaymentStatus.Rejected);
            expect(rejectColor.bg).toContain('red');
        });
    });
});
