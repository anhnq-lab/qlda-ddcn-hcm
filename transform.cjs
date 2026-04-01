const fs = require('fs');

let content = fs.readFileSync('features/tasks/TaskList.tsx', 'utf-8');

// 1. Remove dbMappers import
content = content.replace("import { workflowTaskToTask } from '../../lib/dbMappers';\n", '');
content = content.replace("import { workflowTaskToTask } from '../../lib/dbMappers';\r\n", '');

// 2. Change Task import to WorkflowTask but KEEP Task and TaskStatus
content = content.replace(
    "import { Task, TaskStatus, TaskPriority } from '../../types';",
    "import { Task, TaskStatus, TaskPriority } from '../../types';\nimport { WorkflowTask } from '../../types/workflow.types';"
);

// 3. Remove useMemo wrapper for mapping
const mapRegex = /const tasks = useMemo\(\(\) => \s*rawWorkflowTasks\.map\(wt => workflowTaskToTask\(wt\)\)\s*, \[rawWorkflowTasks\]\);/s;
content = content.replace(mapRegex, 'const tasks = rawWorkflowTasks;');

// 4. Update types
content = content.replace(/task: Task/g, 'task: WorkflowTask');
content = content.replace(/tasks: Task\[\]/g, 'tasks: WorkflowTask[]');
content = content.replace(/Task\[\]/g, 'WorkflowTask[]');
content = content.replace(/Partial<Task>/g, 'Partial<WorkflowTask>');

// 5. Update Task field accesses
content = content.replace(/task\.TaskID/g, 'task.id');
content = content.replace(/task\.Title/g, 'task.name');
content = content.replace(/t\.TaskID/g, 't.id');
content = content.replace(/t\.Title/g, 't.name');
content = content.replace(/task\.ProgressPercent/g, 'task.progress');
content = content.replace(/t\.ProgressPercent/g, 't.progress');
content = content.replace(/task\.AssigneeID/g, 'task.assignee_id');
content = content.replace(/t\.AssigneeID/g, 't.assignee_id');
content = content.replace(/task\.DueDate/g, 'task.due_date');
content = content.replace(/t\.DueDate/g, 't.due_date');
content = content.replace(/task\.TimelineStep/g, 'task.node_id');
content = content.replace(/t\.TimelineStep/g, 't.node_id');
content = content.replace(/task\.ProjectID/g, '(task.metadata?.project_id || task.instance?.reference_id)');
content = content.replace(/t\.ProjectID/g, '(t.metadata?.project_id || t.instance?.reference_id)');
content = content.replace(/task\.Description/g, '(task.comments || task.metadata?.description)');
content = content.replace(/t\.Description/g, '(t.comments || t.metadata?.description)');
content = content.replace(/task\.IsCritical/g, 'task.metadata?.isCritical');
content = content.replace(/t\.IsCritical/g, 't.metadata?.isCritical');

// Handle sorting variables a and b
content = content.replace(/a\.Title/g, 'a.name');
content = content.replace(/b\.Title/g, 'b.name');
content = content.replace(/a\.ProgressPercent/g, 'a.progress');
content = content.replace(/b\.ProgressPercent/g, 'b.progress');
content = content.replace(/a\.DueDate/g, 'a.due_date');
content = content.replace(/b\.DueDate/g, 'b.due_date');

// Priority mapping for Sort logic
content = content.replace(/a\.Priority/g, '(a.metadata?.priority as TaskPriority)');
content = content.replace(/b\.Priority/g, '(b.metadata?.priority as TaskPriority)');

// 6. Update openEditModal argument to map properties back to ProjectTaskModal shape
// ProjectTaskModal expects Task format for initialData
const newOpenEditModal = `    const openEditModal = (task: WorkflowTask) => {
        const legacyTask: any = {
            TaskID: task.id,
            Title: task.name,
            Description: (task.comments || task.metadata?.description),
            Status: task.status === 'in_progress' ? TaskStatus.InProgress : 
                    task.status === 'completed' ? TaskStatus.Done : 
                    task.status === 'rejected' ? TaskStatus.Review : TaskStatus.Todo,
            ProgressPercent: task.progress,
            DueDate: task.due_date,
            AssigneeID: task.assignee_id,
            ProjectID: task.metadata?.project_id || task.instance?.reference_id,
        };
        openPanel({
            title: task.name || 'Chi tiết',
            icon: <CheckCircle2 className="w-5 h-5 text-blue-500" />,
            url: \`/tasks/\${task.id}\`,
            component: (
                <ProjectTaskModal
                    isOpen={true}
                    onClose={() => {}}
                    onSubmit={handleSave}
                    initialData={legacyTask}
                    allTasks={tasks as any}
                    asSlidePanel={true}
                />
            ),
        });
    };`;
content = content.replace(/const openEditModal = \(task: WorkflowTask\) => \{[\s\S]*?\}\);\s*\};/, newOpenEditModal);

// 7. Update handleSave to correctly build payload and map status
const newHandleSave = `    const handleSave = async (taskData: Partial<Task>) => {
        const workflowPayload: any = {
            id: taskData.TaskID?.startsWith('NEW_') ? undefined : taskData.TaskID,
            name: taskData.Title,
            progress: taskData.ProgressPercent,
            assignee_id: taskData.AssigneeID,
            due_date: taskData.DueDate,
            project_id: taskData.ProjectID,
            metadata: {
                 actualStartDate: taskData.ActualStartDate,
                 actualEndDate: taskData.ActualEndDate,
                 sub_tasks: taskData.SubTasks,
                 attachments: taskData.Attachments,
                 dependencies: taskData.Dependencies,
                 estimated_cost: taskData.EstimatedCost,
                 actual_cost: taskData.ActualCost,
                 estimatedDays: taskData.DurationDays,
            }
        };

        if (taskData.Status) {
            const statusMap: Record<string, string> = {
                [TaskStatus.Todo]: 'pending',
                [TaskStatus.InProgress]: 'in_progress',
                [TaskStatus.Done]: 'completed',
                [TaskStatus.Review]: 'rejected'
            };
            workflowPayload.status = statusMap[taskData.Status];
        }

        await updateTaskMutation.mutateAsync(workflowPayload);
        setIsModalOpen(false);
    };`;
content = content.replace(/const handleSave = async \(taskData: Partial<WorkflowTask>\) => \{[\s\S]*?setIsModalOpen\(false\);\s*\};/, newHandleSave);

// 8. Fix render loop: Replace getStatusInfo and getPriorityInfo and boolean logic
content = content.replace(/const priorityInfo = getPriorityInfo\(task\.Priority\);/g, 'const priorityInfo = getPriorityInfo(task.metadata?.priority as TaskPriority || TaskPriority.Medium);');

content = content.replace(/const statusInfo = getStatusInfo\(task\.status\);/g, `const statusAdapter = task.status === 'in_progress' ? TaskStatus.InProgress : task.status === 'completed' ? TaskStatus.Done : task.status === 'rejected' ? TaskStatus.Review : TaskStatus.Todo;
                                                const statusInfo = getStatusInfo(statusAdapter);`);

// 9. Fix render loop boolean comparisons
// In the render loop there are usages like `task.status === TaskStatus.Done` - we replace them!
content = content.replace(/task\.status === TaskStatus\.Done/g, 'task.status === "completed"');
content = content.replace(/task\.status \!\=\= TaskStatus\.Done/g, 'task.status !== "completed"');

// 10. Handle TaskStatus strings comparison for filters
// If filterStatus = "Todo" then workflow mapped is "pending"
content = content.replace(/task\.status === filterStatus/g, 'task.status === (filterStatus === TaskStatus.InProgress ? "in_progress" : filterStatus === TaskStatus.Review ? "rejected" : filterStatus === TaskStatus.Done ? "completed" : filterStatus === TaskStatus.Todo ? "pending" : filterStatus)');
content = content.replace(/a\.Status/g, 'a.status');
content = content.replace(/b\.Status/g, 'b.status');
content = content.replace(/task\.Status/g, 'task.status');
content = content.replace(/t\.Status/g, 't.status');

fs.writeFileSync('features/tasks/TaskList.tsx', content);
console.log('TRANSFORM COMPLETE');
