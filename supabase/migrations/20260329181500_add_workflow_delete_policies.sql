-- Add DELETE policies for project_workflows and project_workflow_steps
-- This is required to allow cascading deletes when a project is deleted (ON DELETE CASCADE)

CREATE POLICY "project_workflows_delete" ON "public"."project_workflows"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

CREATE POLICY "project_wf_steps_delete" ON "public"."project_workflow_steps"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
