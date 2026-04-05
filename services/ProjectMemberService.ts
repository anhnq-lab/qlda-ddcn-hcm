import { supabase } from '@/lib/supabase';
import { Employee } from '../types/employee.types';
import { SelectedMember } from '../types/project.types';
import { ServiceError } from './ServiceError';

export const ProjectMemberService = {
  /**
   * Fetch all members of a project with their employee details
   */
  async getMembersWithDetails(projectId: string): Promise<Employee[]> {
    try {
      const { data: memberRows, error } = await supabase
        .from('project_members')
        .select('employee_id, role')
        .eq('project_id', projectId);

      if (error) {
        throw new ServiceError(`Failed to fetch project members: ${error.message}`, 'DB_MEMBER_FETCH', error);
      }

      if (!memberRows || memberRows.length === 0) {
        return [];
      }

      const empIds = memberRows.map((m: any) => m.employee_id);
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .in('employee_id', empIds);

      if (empError) {
        throw new ServiceError(`Failed to fetch employee details: ${empError.message}`, 'DB_EMP_FETCH', empError);
      }

      if (empData && empData.length > 0) {
        const members: Employee[] = empData.map((e: any) => ({
          EmployeeID: e.employee_id,
          FullName: e.full_name || '',
          Department: e.department || '',
          Position: e.position || '',
          Role: (memberRows.find((m: any) => m.employee_id === e.employee_id)?.role || 'Thành viên') as any,
          Email: e.email || '',
          Phone: e.phone_number || '',
          JoinDate: e.join_date || '',
          Status: e.status || 'active',
          AvatarUrl: e.avatar_url || '',
          Username: e.username || e.full_name || '',
        }));
        return members;
      }
      return [];
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('An unexpected error occurred while fetching project members', 'UNKNOWN_ERROR', error);
    }
  },

  /**
   * Fetch only the selected members (id and role) array (for forms)
   */
  async getSelectedMembers(projectId: string): Promise<SelectedMember[]> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('employee_id, role')
        .eq('project_id', projectId);

      if (error) {
        throw new ServiceError(`Failed to fetch selected members: ${error.message}`, 'DB_SEL_MEMBER_FETCH', error);
      }

      return (data || []).map((m: any) => ({
        employeeId: m.employee_id,
        role: m.role || 'Thành viên',
      }));
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('An unexpected error occurred while fetching selected members', 'UNKNOWN_ERROR', error);
    }
  },

  /**
   * Create or save members for a new project
   */
  async saveMembers(projectId: string, members: SelectedMember[]): Promise<void> {
    if (!members || members.length === 0) return;

    try {
      const memberRows = members.map((m) => ({
        project_id: projectId,
        employee_id: m.employeeId,
        role: m.role,
        joined_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('project_members')
        .insert(memberRows);

      if (error) {
        throw new ServiceError(`Failed to save members: ${error.message}`, 'DB_MEMBER_SAVE', error);
      }
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('An unexpected error occurred while saving members', 'UNKNOWN_ERROR', error);
    }
  },

  /**
   * Replace all members for an existing project (full replace)
   */
  async replaceMembers(projectId: string, members: SelectedMember[]): Promise<void> {
    try {
      // 1. Delete old members
      const { error: deleteError } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId);

      if (deleteError) {
        throw new ServiceError(`Failed to delete old members: ${deleteError.message}`, 'DB_MEMBER_DEL', deleteError);
      }

      // 2. Insert new members
      await this.saveMembers(projectId, members);
    } catch (error) {
      if (error instanceof ServiceError) throw error;
      throw new ServiceError('An unexpected error occurred while replacing members', 'UNKNOWN_ERROR', error);
    }
  }
};
