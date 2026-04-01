const fs = require('fs');
let content = fs.readFileSync('features/tasks/TaskList.tsx', 'utf-8');

// Imports
content = content.replace(/import \{ workflowTaskToTask \} from '\.\.\/\.\.\/lib\/dbMappers';\r?\n/, '');
content = content.replace(/import \{ Task, TaskStatus, TaskPriority \} from '\.\.\/\.\.\/types';/, 'import { TaskStatus, TaskPriority } from \'../../types\';\nimport { WorkflowTask } from \'../../types/workflow.types\';');

// Remove tasks = useMemo(...)
content = content.replace(/const tasks = useMemo\(\(\) => \r?\n\s+rawWorkflowTasks\.map\(wt => workflowTaskToTask\(wt\)\)\r?\n\s+, \[rawWorkflowTasks\]\);/s, 'const tasks = rawWorkflowTasks;');

// Filter logic
content = content.replace(/if \(!scopedProjectIds\.has\(task\.ProjectID\)\) return false;/g, `
        const pid = task.metadata?.project_id || task.instance?.reference_id;
        if (!pid || !scopedProjectIds.has(pid)) return false;`);
content = content.replace(/task\.ProjectID/g, '(task.metadata?.project_id || task.instance?.reference_id)');
content = content.replace(/task\.Title\.toLowerCase\(\)/g, '(task.name || \'\').toLowerCase()');
content = content.replace(/task\.Description\?\./g, '(task.comments || task.metadata?.description)?.');
content = content.replace(/task\.Status/g, 'task.status');

// Sort & rendering replacements
content = content.replace(/a\.Title\.localeCompare\(b\.Title, 'vi'\)/g, '(a.name || \'\').localeCompare(b.name || \'\', \'vi\')');
content = content.replace(/\(a\.ProgressPercent \|\| 0\)/g, '(a.progress || 0)');
content = content.replace(/\(b\.ProgressPercent \|\| 0\)/g, '(b.progress || 0)');
content = content.replace(/\(a\.DueDate \|\| '9999'\)/g, '(a.due_date || \'9999\')');
content = content.replace(/\(b\.DueDate \|\| '9999'\)/g, '(b.due_date || \'9999\')');

content = content.replace(/a\.Priority/g, '(a.metadata?.priority as TaskPriority || TaskPriority.Medium)');
content = content.replace(/b\.Priority/g, '(b.metadata?.priority as TaskPriority || TaskPriority.Medium)');

content = content.replace(/Task\[\]/g, 'WorkflowTask[]');
content = content.replace(/task: Task/g, 'task: WorkflowTask');
content = content.replace(/task: Partial<Task>/g, 'task: Partial<WorkflowTask>');
content = content.replace(/Partial<Task>/g, 'Partial<WorkflowTask>');

// Map task field refs
content = content.replace(/task\.TaskID/g, 'task.id');
content = content.replace(/task\.Title/g, 'task.name');
content = content.replace(/task\.ProgressPercent/g, 'task.progress');
content = content.replace(/task\.DueDate/g, 'task.due_date');
content = content.replace(/task\.AssigneeID/g, 'task.assignee_id');
content = content.replace(/task\.IsCritical/g, 'task.metadata?.isCritical');
content = content.replace(/task\.Description/g, '(task.comments || task.metadata?.description)');
content = content.replace(/task\.TimelineStep/g, 'task.node_id');

// Replace status map
content = content.replace(/\[TaskStatus\.Todo\]: 'pending',\r?\n\s+\[TaskStatus\.InProgress\]: 'in_progress',\r?\n\s+\[TaskStatus\.Done\]: 'completed',\r?\n\s+\[TaskStatus\.Review\]: 'rejected'/g, '');

fs.writeFileSync('features/tasks/TaskList.tsx', content);
console.log('Update TaskList.tsx SUCCESS');
