const fs = require('fs');
let content = fs.readFileSync('features/tasks/TaskList.tsx', 'utf-8');

// Replace TaskStatus options with raw status
content = content.replace(/value=\{TaskStatus\.Todo\}/g, 'value="pending"');
content = content.replace(/value=\{TaskStatus\.InProgress\}/g, 'value="in_progress"');
content = content.replace(/value=\{TaskStatus\.Review\}/g, 'value="rejected"');
content = content.replace(/value=\{TaskStatus\.Done\}/g, 'value="completed"');

// Replace TaskStatus references
content = content.replace(/TaskStatus\.InProgress/g, '"in_progress"');
content = content.replace(/TaskStatus\.Review/g, '"rejected"');
content = content.replace(/TaskStatus\.Done/g, '"completed"');
content = content.replace(/TaskStatus\.Todo/g, '"pending"');

// Map internalStatusMap for filter?
// Wait, the internalStatusMap is wiped already, but let's check.
content = content.replace(/const internalStatusMap: Record<string, any> = \{.*?};\s*const tasksToUpdate/s, 'const tasksToUpdate');
content = content.replace(/internalStatusMap\[status\]/g, 'status');

// Sort order map
content = content.replace(/\[TaskStatus\.InProgress\]/g, '["in_progress"]');
content = content.replace(/\[TaskStatus\.Review\]/g, '["rejected"]');
content = content.replace(/\[TaskStatus\.Todo\]/g, '["pending"]');
content = content.replace(/\[TaskStatus\.Done\]/g, '["completed"]');

// Handle ProjectModal open adapter
content = content.replace(/openEditModal = \(task: WorkflowTask\) => \{/g, `openEditModal = (task: WorkflowTask) => {
        // Adapter for ProjectTaskModal expecting Partial<Task>
        const legacyTask: any = {
            TaskID: task.id,
            Title: task.name,
            Description: (task.comments || task.metadata?.description),
            Status: task.status === 'in_progress' ? 'InProgress' : 
                    task.status === 'completed' ? 'Done' : 
                    task.status === 'rejected' ? 'Review' : 'Todo',
            ProgressPercent: task.progress,
            DueDate: task.due_date,
            AssigneeID: task.assignee_id,
            ProjectID: task.metadata?.project_id || task.instance?.reference_id,
        };`);

content = content.replace(/initialData=\{\{ \.\.\.task \}\}/g, 'initialData={legacyTask}');

fs.writeFileSync('features/tasks/TaskList.tsx', content);
console.log('Update TaskList.tsx SUCCESS');
