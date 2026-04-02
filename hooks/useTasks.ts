/**
 * useTasks — Re-export file for backward compatibility
 * 
 * All task hooks are now defined in useWorkflowTasks.ts (unified).
 * This file re-exports them for consumers that import from './useTasks'.
 */
export {
  taskKeys,
  useProjectTasks,
  useAllTasks,
  useInternalTasks,
  useTask,
  useSaveTask,
  useUpdateTask,
  useDeleteTask,
  useCreateTasksFromWorkflow,
  useDeleteProjectTasks,
} from './useWorkflowTasks';

// Legacy alias: `useTasks({ projectId })` → `useProjectTasks(projectId)`
export { useProjectTasks as useTasks } from './useWorkflowTasks';
