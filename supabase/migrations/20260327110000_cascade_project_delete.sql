-- Bidding Packages
ALTER TABLE bidding_packages DROP CONSTRAINT IF EXISTS bidding_packages_project_id_fkey;
ALTER TABLE bidding_packages ADD CONSTRAINT bidding_packages_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- BIM Models
ALTER TABLE bim_models DROP CONSTRAINT IF EXISTS bim_models_project_id_fkey;
ALTER TABLE bim_models ADD CONSTRAINT bim_models_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Capital Plans
ALTER TABLE capital_plans DROP CONSTRAINT IF EXISTS capital_plans_project_id_fkey;
ALTER TABLE capital_plans ADD CONSTRAINT capital_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Construction Works
ALTER TABLE construction_works DROP CONSTRAINT IF EXISTS construction_works_project_id_fkey;
ALTER TABLE construction_works ADD CONSTRAINT construction_works_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Contracts
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_project_id_fkey;
ALTER TABLE contracts ADD CONSTRAINT contracts_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Disbursement Plans
ALTER TABLE disbursement_plans DROP CONSTRAINT IF EXISTS disbursement_plans_project_id_fkey;
ALTER TABLE disbursement_plans ADD CONSTRAINT disbursement_plans_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Disbursements
ALTER TABLE disbursements DROP CONSTRAINT IF EXISTS disbursements_project_id_fkey;
ALTER TABLE disbursements ADD CONSTRAINT disbursements_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Documents
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_project_id_fkey;
ALTER TABLE documents ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Facility Assets
ALTER TABLE facility_assets DROP CONSTRAINT IF EXISTS facility_assets_project_id_fkey;
ALTER TABLE facility_assets ADD CONSTRAINT facility_assets_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Feasibility Studies
ALTER TABLE feasibility_studies DROP CONSTRAINT IF EXISTS feasibility_studies_project_id_fkey;
ALTER TABLE feasibility_studies ADD CONSTRAINT feasibility_studies_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Investment Policy Decisions
ALTER TABLE investment_policy_decisions DROP CONSTRAINT IF EXISTS investment_policy_decisions_project_id_fkey;
ALTER TABLE investment_policy_decisions ADD CONSTRAINT investment_policy_decisions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_project_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Project Members
ALTER TABLE project_members DROP CONSTRAINT IF EXISTS project_members_project_id_fkey;
ALTER TABLE project_members ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Stage Transitions
ALTER TABLE stage_transitions DROP CONSTRAINT IF EXISTS stage_transitions_project_id_fkey;
ALTER TABLE stage_transitions ADD CONSTRAINT stage_transitions_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Tasks (Ensure the task relates to the parent project)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_project_id_fkey;
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE;

-- Secondary Tables (Grandchild dependencies)

-- Variation Orders
ALTER TABLE variation_orders DROP CONSTRAINT IF EXISTS variation_orders_contract_id_fkey;
ALTER TABLE variation_orders ADD CONSTRAINT variation_orders_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE;

-- Package Issues
ALTER TABLE package_issues DROP CONSTRAINT IF EXISTS package_issues_package_id_fkey;
ALTER TABLE package_issues ADD CONSTRAINT package_issues_package_id_fkey FOREIGN KEY (package_id) REFERENCES bidding_packages(package_id) ON DELETE CASCADE;

-- Package Bidders
ALTER TABLE package_bidders DROP CONSTRAINT IF EXISTS package_bidders_package_id_fkey;
ALTER TABLE package_bidders ADD CONSTRAINT package_bidders_package_id_fkey FOREIGN KEY (package_id) REFERENCES bidding_packages(package_id) ON DELETE CASCADE;

-- Settlement Records
ALTER TABLE settlement_records DROP CONSTRAINT IF EXISTS settlement_records_contract_id_fkey;
ALTER TABLE settlement_records ADD CONSTRAINT settlement_records_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE;

-- Acceptance Records
ALTER TABLE acceptance_records DROP CONSTRAINT IF EXISTS acceptance_records_contract_id_fkey;
ALTER TABLE acceptance_records ADD CONSTRAINT acceptance_records_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE;

-- Re-apply CASCADE for Package -> Contracts and Contracts -> Payments just in case Postgres deletes in wrong order
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_package_id_fkey;
ALTER TABLE contracts ADD CONSTRAINT contracts_package_id_fkey FOREIGN KEY (package_id) REFERENCES bidding_packages(package_id) ON DELETE CASCADE;

ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_contract_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_contract_id_fkey FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE;

ALTER TABLE disbursements DROP CONSTRAINT IF EXISTS disbursements_capital_plan_id_fkey;
ALTER TABLE disbursements ADD CONSTRAINT disbursements_capital_plan_id_fkey FOREIGN KEY (capital_plan_id) REFERENCES capital_plans(plan_id) ON DELETE CASCADE;

ALTER TABLE disbursements DROP CONSTRAINT IF EXISTS disbursements_payment_id_fkey;
ALTER TABLE disbursements ADD CONSTRAINT disbursements_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE CASCADE;

