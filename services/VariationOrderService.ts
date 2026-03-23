import { supabase } from '../lib/supabase';
import { dbToVariationOrder, variationOrderToDb } from '../lib/mappers/variationOrderMappers';
import { VariationOrder } from '../types';

export class VariationOrderService {
    static async getByContractId(contractId: string): Promise<VariationOrder[]> {
        const { data, error } = await supabase
            .from('variation_orders')
            .select('*')
            .eq('contract_id', contractId)
            .order('sign_date', { ascending: false });

        if (error) throw new Error(`Failed to fetch variation orders: ${error.message}`);
        return (data || []).map(dbToVariationOrder);
    }

    static async create(data: Partial<VariationOrder>): Promise<VariationOrder> {
        const insertData = variationOrderToDb(data);
        const { data: created, error } = await supabase
            .from('variation_orders')
            .insert(insertData as any)
            .select()
            .single();

        if (error) throw new Error(`Failed to create variation order: ${error.message}`);
        return dbToVariationOrder(created);
    }

    static async update(id: string, data: Partial<VariationOrder>): Promise<VariationOrder> {
        const updateData = variationOrderToDb(data);
        const { data: updated, error } = await supabase
            .from('variation_orders')
            .update(updateData as any)
            .eq('vo_id', id)
            .select()
            .single();

        if (error) throw new Error(`Failed to update variation order: ${error.message}`);
        return dbToVariationOrder(updated);
    }

    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('variation_orders')
            .delete()
            .eq('vo_id', id);

        if (error) throw new Error(`Failed to delete variation order: ${error.message}`);
    }
}
