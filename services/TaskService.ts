// Task Service - Supabase CRUD operations
import { supabase } from '../lib/supabase';
import { dbToTask, taskToDb } from '../lib/dbMappers';
import { Task, TaskStatus } from '../types';

export const TaskService = {
    getAllTasks: async (): Promise<Task[]> => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
        return (data || []).map(dbToTask);
    },

    getTaskById: async (taskId: string): Promise<Task | null> => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('task_id', taskId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to fetch task: ${error.message}`);
        }
        return data ? dbToTask(data) : null;
    },

    getTasksByProject: async (projectId: string): Promise<Task[]> => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch tasks: ${error.message}`);
        return (data || []).map(dbToTask);
    },

    saveTasks: async (tasks: Task[]): Promise<boolean> => {
        // Upsert all tasks
        const rows = tasks.map(t => taskToDb(t));

        const { error } = await supabase
            .from('tasks')
            .upsert(rows, { onConflict: 'task_id' });

        if (error) throw new Error(`Failed to save tasks: ${error.message}`);
        return true;
    },

    saveTask: async (task: Task): Promise<Task> => {
        const today = new Date().toISOString().split('T')[0];

        // Auto-set ActualStartDate when task first starts
        const progress = task.ProgressPercent ?? 0;
        if (progress > 0 && !task.ActualStartDate) {
            task.ActualStartDate = today;
        }

        // Auto-set ActualEndDate when progress reaches 100%
        if (progress >= 100) {
            if (!task.ActualEndDate) task.ActualEndDate = today;
            if (task.Status !== TaskStatus.Done) {
                task.Status = TaskStatus.Done;
            }
        } else if (task.ActualEndDate && progress < 100) {
            // Clear ActualEndDate if progress drops below 100%
            task.ActualEndDate = '';
        }

        const row = taskToDb(task);

        const { data, error } = await supabase
            .from('tasks')
            .upsert(row, { onConflict: 'task_id' })
            .select()
            .single();

        if (error) throw new Error(`Failed to save task: ${error.message}`);
        return dbToTask(data);
    },

    updateTask: async (task: Task): Promise<boolean> => {
        await TaskService.saveTask(task);
        return true;
    },

    deleteTask: async (id: string): Promise<boolean> => {
        // 1. Xóa sub_tasks liên quan
        const { error: subError } = await supabase.from('sub_tasks').delete().eq('task_id', id);
        if (subError) console.warn(`Warning: Failed to delete sub_tasks for ${id}:`, subError.message);

        // 2. Xóa tham chiếu predecessor từ các task phụ thuộc
        const { error: depError } = await supabase
            .from('tasks')
            .update({ predecessor_task_id: null })
            .eq('predecessor_task_id', id);
        if (depError) console.warn(`Warning: Failed to clear predecessor refs for ${id}:`, depError.message);

        // 3. Xóa task chính
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('task_id', id);

        if (error) throw new Error(`Failed to delete task: ${error.message}`);
        return true;
    },

    deleteTasksByProject: async (projectId: string): Promise<boolean> => {
        // Gọi RPC function (SECURITY DEFINER) để bypass RLS
        const { data, error } = await (supabase.rpc as any)('delete_project_tasks', {
            p_project_id: projectId,
        });

        if (error) {
            console.error('RPC delete_project_tasks error:', error);
            throw new Error(`Xoá công việc thất bại: ${error.message}`);
        }

        console.log(`Đã xoá ${data} công việc cho dự án ${projectId}`);
        return true;
    }
};
