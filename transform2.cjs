const fs = require('fs');

let content = fs.readFileSync('features/tasks/TaskList.tsx', 'utf-8');

// 1. Fix WorkflowWorkflowTask
content = content.replace(/WorkflowWorkflowTask/g, 'WorkflowTask');

// 2. Fix Duplicate Import (lines 8 & 9 roughly)
// Let's just remove all WorkflowTask imports and add exactly one.
content = content.replace(/import \{ WorkflowTask \} from '\.\.\/\.\.\/types\/workflow\.types';(\r?\n)*/g, '');
content = content.replace("import { Task, TaskStatus, TaskPriority } from '../../types';", "import { Task, TaskStatus, TaskPriority } from '../../types';\nimport { WorkflowTask } from '../../types/workflow.types';");

// 3. Fix taskData.status in handleSave
content = content.replace(/if \(taskData\.status\) \{/g, 'if (taskData.Status) {');
content = content.replace(/workflowPayload\.status = statusMap\[taskData\.status\];/g, 'workflowPayload.status = statusMap[taskData.Status as string] || taskData.Status;');

// 4. Also fix statusMap[taskData.Status] typing, it's safer to cast it
content = content.replace(/workflowPayload\.status = statusMap\[taskData\.Status\];/g, 'workflowPayload.status = statusMap[taskData.Status as string] || taskData.Status;');

fs.writeFileSync('features/tasks/TaskList.tsx', content);
console.log('FINAL FIX COMPLETE');
