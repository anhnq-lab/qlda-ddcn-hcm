/**
 * WorkflowService — Legacy compatibility wrapper
 * 
 * Tất cả logic workflow template nay nằm trong WorkflowTemplateService.
 * Tất cả logic task nay nằm trong TaskService (unified).
 * 
 * File này chỉ re-export để không phải sửa tất cả import cùng lúc.
 */

// Re-export từ WorkflowTemplateService cho backward compat
export { WorkflowTemplateService as WorkflowService } from './WorkflowTemplateService';
