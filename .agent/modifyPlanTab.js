const fs = require('fs');
const file = 'features/projects/components/tabs/ProjectPlanTab.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
    /import \{ ProjectHealthScore \} from '.\/ProjectHealthScore';/,
    "import { ProjectHealthScore } from './ProjectHealthScore';\nimport { ProjectPlanWBSView } from './ProjectPlanWBSView';"
);

data = data.replace(
    /    \/\/ Priority color helper[\s\S]*?    \);\r?\n/,
    "    // renderWBSView has been extracted to ProjectPlanWBSView\n"
);

data = data.replace(
    /\{currentView === 'wbs' && renderWBSView\(\)\}/,
    {currentView === 'wbs' && (
                        <ProjectPlanWBSView
                            tasks={tasks}
                            filteredTasks={filteredTasks}
                            projectID={projectID || ''}
                            groupCode={groupCode}
                            getGroupLabel={getGroupLabel}
                            expandedPhases={expandedPhases}
                            stepAggregates={stepAggregates}
                            bulkCreatingAll={bulkCreatingAll}
                            isDeletingAll={isDeletingAll}
                            deleteConfirmStep={deleteConfirmStep}
                            employeeNameMap={employeeNameMap}
                            uploadingTaskId={uploadingTaskId}
                            attachmentCounts={attachmentCounts}
                            deletingTaskId={deletingTaskId}
                            onTogglePhase={togglePhase}
                            onSetExpandedPhases={setExpandedPhases}
                            onDeleteAllTasks={handleDeleteAllTasks}
                            onOpenPlanModal={openPlanModal}
                            onAddTask={handleAddTask}
                            onEditTask={handleEditTask}
                            onQuickStatusChange={handleQuickStatusChange}
                            onDeleteTask={handleDeleteTask}
                            onSetPendingUploadTaskId={setPendingUploadTaskId}
                            fileInputRef={fileInputRef}
                            navigate={navigate}
                            queryClient={queryClient}
                        />
                    )}
);

fs.writeFileSync(file, data, 'utf8');
