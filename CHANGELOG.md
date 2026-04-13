# Changelog

## [2026-04-04]

### Added
- Standardized step numbering for all workflow templates (1-step, 2-step, 3-step).
- Sequential numbering for closing steps in all templates.

### Changed
- **Workflow Refactor:** Updated `seedWorkflows.ts` to align with "Sổ tay Đầu tư công Hải Dương".
- **Phase Removal:** Completely removed the "Phê duyệt chủ trương" (I.1) stage from standard investment workflows.
- **Workflow Restructuring:**
  - `QT-TK3B` (3-step design): Now starts with Preparation (steps 1-8) followed by 11 execution steps (9-19).
  - `QT-TK2B` (2-step design): Now starts with Preparation followed by 8 execution steps (9-16).
  - `QT-TK1B` (1-step design): Now starts with Preparation (1-3 + 4) followed by 8 execution steps (5-12).

### Fixed
- **WorkflowBuilderPanel.tsx:**
  - Fixed Hook Order Violation where `useMemo` was called conditionally.
  - Fixed Node Deletion bug: Implemented automatic edge cleanup before node deletion to resolve foreign key constraint violations in Supabase.
- **Ordering:** Reverted node ordering logic to use `created_at` timestamps to maintain stability until database schema is updated.
