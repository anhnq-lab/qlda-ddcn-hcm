// Project Service - Supabase CRUD operations
import { supabase } from '../lib/supabase';
import { dbToProject, projectToDb, dbToBiddingPackage, dbToCapitalAllocation, dbToProcurementPlan, procurementPlanToDb, biddingPackageToDb } from '../lib/dbMappers';
import { Project, ProjectStatus, ProjectGroup, BiddingPackage, ProcurementPlan, CapitalAllocation, Disbursement } from '../types';
import type { QueryParams } from '../types/api';
import { CapitalService } from './CapitalService';

export class ProjectService {
    /**
     * Get all projects with optional filtering
     */
    static async getAll(params?: QueryParams): Promise<Project[]> {
        let query = supabase.from('projects').select('*');

        if (params?.search) {
            const s = params.search;
            query = query.or(`project_name.ilike.%${s}%,project_id.ilike.%${s}%,investor_name.ilike.%${s}%`);
        }

        if (params?.filters?.status !== undefined) {
            query = query.eq('status', params.filters.status);
        }

        if (params?.filters?.group) {
            query = query.eq('group_code', params.filters.group);
        }

        if (params?.filters?.investmentType) {
            query = query.eq('investment_type', params.filters.investmentType);
        }

        if (params?.filters?.stage) {
            query = query.eq('stage', params.filters.stage);
        }

        if (params?.filters?.sector) {
            query = query.eq('sector', params.filters.sector);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw new Error(`Failed to fetch projects: ${error.message}`);
        return (data || []).map(dbToProject);
    }

    /**
     * Get a single project by ID (supports both ProjectID and ProjectNumber)
     */
    static async getById(id: string): Promise<Project | undefined> {
        // Try by project_id first
        let { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('project_id', id)
            .maybeSingle();

        if (!data && !error) {
            // Try by project_number
            const result = await supabase
                .from('projects')
                .select('*')
                .eq('project_number', id)
                .maybeSingle();
            data = result.data;
            error = result.error;
        }

        if (error) {
            throw new Error(`Failed to fetch project: ${error.message}`);
        }
        return data ? dbToProject(data) : undefined;
    }

    /**
     * Create a new project
     */
    static async create(projectData: Partial<Project>): Promise<Project> {
        const insertData = projectToDb({
            ProjectID: projectData.ProjectID || `DA-${Date.now()}`,
            ProjectName: projectData.ProjectName || 'Dự án mới',
            GroupCode: projectData.GroupCode || ProjectGroup.C,
            Status: projectData.Status || ProjectStatus.Preparation,
            TotalInvestment: projectData.TotalInvestment || 0,
            IsEmergency: projectData.IsEmergency || false,
            ...projectData,
        });

        const { data, error } = await supabase
            .from('projects')
            .insert(insertData as any)
            .select()
            .single();

        if (error) throw new Error(`Failed to create project: ${error.message}`);
        return dbToProject(data);
    }

    /**
     * Update an existing project
     */
    static async update(id: string, data: Partial<Project>): Promise<Project> {
        const updateData = projectToDb(data);

        const { data: updated, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('project_id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update project: ${error.message}`);
        return dbToProject(updated);
    }

    /**
     * Delete a project
     */
    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('project_id', id);

        if (error) throw new Error(`Failed to delete project: ${error.message}`);
    }

    /**
     * Get project statistics — optimized with SQL count/sum instead of fetching all rows
     */
    static async getStatistics(): Promise<{
        total: number;
        byStatus: Record<ProjectStatus, number>;
        byGroup: Record<ProjectGroup, number>;
        totalInvestment: number;
    }> {
        // Parallel aggregate queries — much faster than getAll() + JS loop
        const [statusResult, groupResult, totalResult] = await Promise.all([
            supabase
                .from('projects')
                .select('status')
                .then(({ data }) => {
                    const counts: Record<string, number> = {};
                    data?.forEach((r: any) => { counts[r.status] = (counts[r.status] || 0) + 1; });
                    return counts;
                }),
            supabase
                .from('projects')
                .select('group_code')
                .then(({ data }) => {
                    const counts: Record<string, number> = {};
                    data?.forEach((r: any) => { counts[r.group_code] = (counts[r.group_code] || 0) + 1; });
                    return counts;
                }),
            supabase
                .from('projects')
                .select('total_investment')
                .then(({ data }) => {
                    let sum = 0;
                    let count = 0;
                    data?.forEach((r: any) => { sum += (r.total_investment || 0); count++; });
                    return { sum, count };
                }),
        ]);

        return {
            total: totalResult.count,
            byStatus: {
                [ProjectStatus.Preparation]: statusResult[ProjectStatus.Preparation] || 0,
                [ProjectStatus.Execution]: statusResult[ProjectStatus.Execution] || 0,
                [ProjectStatus.Completion]: statusResult[ProjectStatus.Completion] || 0,
            },
            byGroup: {
                [ProjectGroup.QN]: groupResult[ProjectGroup.QN] || 0,
                [ProjectGroup.A]: groupResult[ProjectGroup.A] || 0,
                [ProjectGroup.B]: groupResult[ProjectGroup.B] || 0,
                [ProjectGroup.C]: groupResult[ProjectGroup.C] || 0,
            },
            totalInvestment: totalResult.sum,
        };
    }

    /**
     * Get projects by status
     */
    static async getByStatus(status: ProjectStatus): Promise<Project[]> {
        return this.getAll({ filters: { status } });
    }

    /**
     * Search projects
     */
    static async search(query: string): Promise<Project[]> {
        return this.getAll({ search: query });
    }

    /**
     * Get all bidding packages (across all projects)
     */
    static async getAllBiddingPackages(): Promise<BiddingPackage[]> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch all packages: ${error.message}`);
        return (data || []).map(dbToBiddingPackage);
    }

    /**
     * Get bidding packages for a project
     */
    static async getPackagesByProject(projectId: string): Promise<BiddingPackage[]> {
        const { data, error } = await supabase
            .from('bidding_packages')
            .select('*')
            .eq('project_id', projectId)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to fetch packages: ${error.message}`);
        return (data || []).map(dbToBiddingPackage);
    }

    /**
     * Create a new bidding package
     */
    static async createPackage(packageData: Partial<BiddingPackage>): Promise<BiddingPackage> {
        const insertData = biddingPackageToDb({
            PackageID: packageData.PackageID || `PKG-${Date.now()}`,
            Status: packageData.Status || 'Planning' as any,
            BidType: packageData.BidType || 'Online',
            ...packageData,
        });

        const { data, error } = await supabase
            .from('bidding_packages')
            .insert(insertData as any)
            .select()
            .single();

        if (error) throw new Error(`Failed to create package: ${error.message}`);
        // Plan total is auto-recalculated by DB trigger trg_recalculate_plan_total
        return dbToBiddingPackage(data);
    }

    /**
     * Update an existing bidding package
     */
    static async updatePackage(packageId: string, updates: Partial<BiddingPackage>): Promise<BiddingPackage> {
        const updateData = biddingPackageToDb(updates);

        const { data: updated, error } = await supabase
            .from('bidding_packages')
            .update(updateData as any)
            .eq('package_id', packageId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update package: ${error.message}`);

        const result = dbToBiddingPackage(updated);
        // Plan total is auto-recalculated by DB trigger trg_recalculate_plan_total
        return result;
    }

    /**
     * Delete a bidding package (blocks if has contract or awarded status)
     */
    static async deletePackage(packageId: string): Promise<void> {
        // Safety check: don't delete packages with contracts
        const { data: contracts } = await supabase
            .from('contracts')
            .select('contract_id')
            .eq('package_id', packageId)
            .limit(1);

        if (contracts && contracts.length > 0) {
            throw new Error('Không thể xóa gói thầu đã có hợp đồng. Hãy xóa hợp đồng trước.');
        }

        // Get package to check status and get PlanID for recalculation
        const { data: pkg } = await supabase
            .from('bidding_packages')
            .select('plan_id, status')
            .eq('package_id', packageId)
            .single();

        if (pkg?.status === 'Awarded') {
            throw new Error('Không thể xóa gói thầu đã có kết quả lựa chọn nhà thầu.');
        }

        // Delete associated payments first
        const { data: pkgContracts } = await supabase
            .from('contracts')
            .select('contract_id')
            .eq('package_id', packageId);
        
        if (pkgContracts && pkgContracts.length > 0) {
            const contractIds = pkgContracts.map(c => c.contract_id);
            await supabase.from('payments').delete().in('contract_id', contractIds);
        }

        const { error } = await supabase
            .from('bidding_packages')
            .delete()
            .eq('package_id', packageId);

        if (error) throw new Error(`Failed to delete package: ${error.message}`);
        // Plan total is auto-recalculated by DB trigger trg_recalculate_plan_total
    }

    // ============================================================
    // PROCUREMENT PLANS (KHLCNT)
    // ============================================================

    /** Get all KHLCNT for a project */
    static async getPlansByProject(projectId: string): Promise<ProcurementPlan[]> {
        const { data, error } = await supabase
            .from('procurement_plans')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) throw new Error(`Failed to fetch plans: ${error.message}`);
        return (data || []).map(dbToProcurementPlan);
    }

    /** Create a new KHLCNT */
    static async createPlan(plan: Partial<ProcurementPlan>): Promise<ProcurementPlan> {
        const dbRow = procurementPlanToDb(plan);
        const { data, error } = await supabase
            .from('procurement_plans')
            .insert(dbRow as any)
            .select()
            .single();

        if (error) throw new Error(`Failed to create plan: ${error.message}`);
        return dbToProcurementPlan(data);
    }

    /** Update a KHLCNT */
    static async updatePlan(planId: string, updates: Partial<ProcurementPlan>): Promise<ProcurementPlan> {
        const dbRow = procurementPlanToDb(updates);
        const { data, error } = await supabase
            .from('procurement_plans')
            .update(dbRow as any)
            .eq('plan_id', planId)
            .select()
            .single();

        if (error) throw new Error(`Failed to update plan: ${error.message}`);
        return dbToProcurementPlan(data);
    }

    /** Delete a KHLCNT — with safety check for Awarded/contracted packages */
    static async deletePlan(planId: string): Promise<void> {
        // Safety: check if plan has packages with Awarded status or contracts
        const { data: packages } = await supabase
            .from('bidding_packages')
            .select('package_id, status')
            .eq('plan_id', planId);

        if (packages && packages.length > 0) {
            const awardedPkgs = packages.filter(p => p.status === 'Awarded');
            if (awardedPkgs.length > 0) {
                throw new Error(
                    `Không thể xóa KHLCNT: có ${awardedPkgs.length} gói thầu đã có kết quả LCNT. Hãy hủy kết quả trước.`
                );
            }

            // Check if any package has contracts
            const pkgIds = packages.map(p => p.package_id);
            const { data: contracts } = await supabase
                .from('contracts')
                .select('contract_id')
                .in('package_id', pkgIds)
                .limit(1);

            if (contracts && contracts.length > 0) {
                throw new Error(
                    'Không thể xóa KHLCNT: có gói thầu đã ký hợp đồng. Hãy xóa hợp đồng trước.'
                );
            }
        }

        // 1. Delete all bidding packages associated with this plan
        const { error: pkgError } = await supabase
            .from('bidding_packages')
            .delete()
            .eq('plan_id', planId);

        if (pkgError) throw new Error(`Failed to delete associated packages: ${pkgError.message}`);

        // 2. Then delete the plan itself
        const { error } = await supabase
            .from('procurement_plans')
            .delete()
            .eq('plan_id', planId);

        if (error) throw new Error(`Failed to delete plan: ${error.message}`);
    }

    /** Assign packages to a KHLCNT */
    static async assignPackagesToPlan(planId: string, packageIds: string[]): Promise<void> {
        const { error } = await supabase
            .from('bidding_packages')
            .update({ plan_id: planId } as any)
            .in('package_id', packageIds);

        if (error) throw new Error(`Failed to assign packages: ${error.message}`);
    }

    /** Remove a package from its KHLCNT */
    static async removePackageFromPlan(packageId: string): Promise<void> {
        const { error } = await supabase
            .from('bidding_packages')
            .update({ plan_id: null } as any)
            .eq('package_id', packageId);

        if (error) throw new Error(`Failed to remove package from plan: ${error.message}`);
    }

    // recalculatePlanTotal removed — handled by DB trigger trg_recalculate_plan_total

    /**
     * Get capital and disbursement info (NĐ 99/2021/NĐ-CP)
     */
    static async getCapitalInfo(projectId: string): Promise<{
        allocations: CapitalAllocation[];
        disbursements: Disbursement[];
        summary: {
            totalInvestment: number;
            totalAllocated: number;
            totalDisbursed: number;
            totalAdvance: number;
            advanceRecovered: number;
            advanceBalance: number;
            completionPayment: number;
            disbursementRate: number;
            yearlyTarget: number;
            yearlyDisbursed: number;
        }
    }> {
        // Fetch allocations from capital_plans table (Only Annual plans represent real allocations)
        const { data: allocationRows } = await (supabase as any)
            .from('capital_plans')
            .select('*')
            .eq('project_id', projectId)
            .eq('plan_type', 'annual');

        const allocations: CapitalAllocation[] = (allocationRows || []).map(dbToCapitalAllocation);

        // Fetch disbursements
        const { data: disbursementRows } = await supabase
            .from('disbursements')
            .select('*')
            .eq('project_id', projectId)
            .order('date', { ascending: true });

        // Helper: chuẩn hóa Status case-insensitive
        const normalizeStatus = (s: string): 'Pending' | 'Approved' | 'Rejected' => {
            const lower = (s || '').toLowerCase();
            if (lower === 'approved' || lower === 'completed') return 'Approved';
            if (lower === 'pending') return 'Pending';
            return 'Rejected';
        };

        const disbursements: Disbursement[] = (disbursementRows || []).map((row: any) => ({
            DisbursementID: row.disbursement_id,
            ProjectID: row.project_id,
            CapitalPlanID: row.capital_plan_id || undefined,
            AllocationID: row.capital_plan_id || undefined,
            PaymentID: row.payment_id || undefined,
            Amount: Number(row.amount) || 0,
            Date: row.date,
            TreasuryCode: row.treasury_code || '',
            FormType: row.form_type || '',
            Description: row.description || '',
            Status: normalizeStatus(row.status),
            Type: row.type || 'ThanhToanKLHT',
            ContractNumber: row.contract_number || '',
            CumulativeBefore: Number(row.cumulative_before) || 0,
            AdvanceBalance: Number(row.advance_balance) || 0,
        }));

        // Ensure allocations have accurately computed disbursement amounts, ignoring stale db column
        allocations.forEach(alloc => {
            const relatedDisbs = disbursements.filter(d => {
                const y = new Date(d.Date).getFullYear();
                return y === alloc.Year;
            });
            alloc.DisbursedAmount = CapitalService.calculateTrueDisbursed(relatedDisbs);
        });

        // Get project total investment
        const project = await this.getById(projectId);
        const totalInvestment = project?.TotalInvestment || 0;

        // Compute summary
        const totalAdvance = disbursements.filter(d => d.Type === 'TamUng' && d.Status === 'Approved').reduce((s, d) => s + d.Amount, 0);
        const advanceRecovered = disbursements.filter(d => d.Type === 'ThuHoiTamUng' && d.Status === 'Approved').reduce((s, d) => s + d.Amount, 0);
        const completionPayment = disbursements.filter(d => ((d.Type as string) === 'ThanhToanKLHT' || (d.Type as string) === 'ThanhToanTT') && d.Status === 'Approved').reduce((s, d) => s + d.Amount, 0);
        
        const totalDisbursed = CapitalService.calculateTrueDisbursed(disbursements);
        const totalAllocated = allocations.reduce((s, a) => s + a.Amount, 0);

        const currentYear = new Date().getFullYear();
        const yearlyTarget = allocations
            .filter(a => a.Year === currentYear)
            .reduce((s, a) => s + a.Amount, 0);
            
        const yearlyDisbursed = CapitalService.calculateTrueDisbursed(
            disbursements.filter(d => new Date(d.Date).getFullYear() === currentYear)
        );

        return {
            allocations,
            disbursements,
            summary: {
                totalInvestment,
                totalAllocated,
                totalDisbursed,
                totalAdvance,
                advanceRecovered,
                advanceBalance: totalAdvance - advanceRecovered,
                completionPayment,
                disbursementRate: totalAllocated > 0 ? Math.round((totalDisbursed / totalAllocated) * 100) : 0,
                yearlyTarget,
                yearlyDisbursed,
            }
        };
    }
}

export default ProjectService;
