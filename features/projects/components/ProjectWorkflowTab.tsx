import React, { useState, useEffect, useCallback } from 'react';
import {
  WorkflowService,
  WorkflowTemplate,
  ProjectWorkflow,
  ProjectWorkflowStep,
  PHASE_LABELS,
  PHASE_COLORS,
  STEP_STATUS_LABELS,
  STEP_STATUS_COLORS,
  PROJECT_GROUP_LABELS,
} from '../../../services/WorkflowService';
import WorkflowDetailModal from './WorkflowDetailModal';
import ActivateWorkflowModal from './ActivateWorkflowModal';
import {
  LayoutGrid, Table2, GitBranch, Clock, CheckCircle2,
  ChevronDown, ChevronRight, AlertCircle,
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────────────
interface Props {
  projectId: string;
  projectGroup?: string;
  projectName?: string;
  currentUser?: string;
}

const PHASE_ORDER = ['preparation', 'execution', 'completion'] as const;

// ─── STATUS BADGE ─────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const label = STEP_STATUS_LABELS[status] || status;
  const color = STEP_STATUS_COLORS[status] || '#6b7280';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '2px 8px', borderRadius: 12,
        fontSize: 11, fontWeight: 700,
        background: `${color}18`, color,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
};

// ─── TABLE VIEW FOR ACTIVE WORKFLOW ─────────────────────────
interface WorkflowTableViewProps {
  wf: ProjectWorkflow;
  group: string;
  onViewDetail: (wf: ProjectWorkflow) => void;
  onStepClick: (step: ProjectWorkflowStep, wf: ProjectWorkflow) => void;
}

const WorkflowTableView: React.FC<WorkflowTableViewProps> = ({ wf, group, onViewDetail, onStepClick }) => {
  const [steps, setSteps] = useState<ProjectWorkflowStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setLoading(true);
    WorkflowService.getWorkflowSteps(wf.id)
      .then(setSteps)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wf.id]);

  const progress = Math.round((wf.completed_steps / Math.max(wf.total_steps, 1)) * 100);
  const isDone = wf.status === 'completed';
  const slaKey = group === 'QN' ? 'sla_days_qn' : group === 'A' ? 'sla_days_a' : group === 'B' ? 'sla_days_b' : 'sla_days_c';

  return (
    <div className="wf-table-workflow-block">
      {/* Block Header */}
      <div
        className={`wf-table-block-header ${isDone ? 'done' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        <button className="wf-table-collapse-btn">
          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
        </button>
        <div className="wf-table-block-title">
          <span className="wf-table-block-name">{wf.template?.name || 'Quy trình'}</span>
          {isDone && <CheckCircle2 size={14} color="#10b981" />}
        </div>
        <div className="wf-table-block-meta">
          <Clock size={12} />
          {wf.started_at && new Date(wf.started_at).toLocaleDateString('vi-VN')}
        </div>
        <div className="wf-table-block-progress">
          <div className="wf-table-progress-bar">
            <div
              className="wf-table-progress-fill"
              style={{ width: `${progress}%`, background: isDone ? '#10b981' : '#3b82f6' }}
            />
          </div>
          <span className="wf-table-progress-pct">{progress}%</span>
        </div>
        <button
          className="wf-btn wf-btn--sm wf-btn--outline"
          onClick={(e) => { e.stopPropagation(); onViewDetail(wf); }}
        >
          Chi tiết
        </button>
      </div>

      {/* Steps Table */}
      {!collapsed && (
        <div className="wf-table-steps-wrapper">
          {loading ? (
            <div className="wf-table-loading">Đang tải bước...</div>
          ) : (
            <table className="wf-steps-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th style={{ width: 80 }}>Mã bước</th>
                  <th>Tên bước</th>
                  <th style={{ width: 120 }}>Vai trò</th>
                  <th style={{ width: 80 }}>SLA (ngày)</th>
                  <th style={{ width: 110 }}>Hạn hoàn thành</th>
                  <th style={{ width: 130 }}>Trạng thái</th>
                  <th style={{ width: 70 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {steps.map((step) => {
                  const sla = step.sla_days || (step.step_template as any)?.[slaKey];
                  const isOverdue = step.planned_end_date && new Date(step.planned_end_date) < new Date()
                    && step.status !== 'approved';

                  return (
                    <tr
                      key={step.id}
                      className={`wf-step-tr ${step.status === 'approved' ? 'done' : ''} ${isOverdue ? 'overdue' : ''}`}
                    >
                      <td className="wf-step-td wf-step-td--center">
                        <span className="wf-step-num-badge">{step.step_number}</span>
                      </td>
                      <td className="wf-step-td">
                        <code className="wf-step-code">{step.step_code}</code>
                      </td>
                      <td className="wf-step-td">
                        <div className="wf-step-name-cell">
                          {step.step_template?.name || step.step_code}
                          {step.step_template?.is_bidding_trigger && (
                            <span className="wf-step-flag">Đấu thầu</span>
                          )}
                        </div>
                        {step.step_template?.description && (
                          <div className="wf-step-desc">{step.step_template.description}</div>
                        )}
                      </td>
                      <td className="wf-step-td">
                        <span className="wf-step-actor">
                          {step.step_template?.actor_label || step.step_template?.actor_role || '—'}
                        </span>
                      </td>
                      <td className="wf-step-td wf-step-td--center">
                        <span className={`wf-step-sla ${isOverdue ? 'overdue' : ''}`}>
                          {sla ?? '—'}
                        </span>
                      </td>
                      <td className="wf-step-td">
                        {step.planned_end_date ? (
                          <span className={`wf-step-date ${isOverdue ? 'overdue' : ''}`}>
                            {isOverdue && <AlertCircle size={11} />}
                            {new Date(step.planned_end_date).toLocaleDateString('vi-VN')}
                          </span>
                        ) : <span className="wf-step-empty">—</span>}
                      </td>
                      <td className="wf-step-td">
                        <StatusBadge status={step.status} />
                      </td>
                      <td className="wf-step-td wf-step-td--center">
                        <button
                          className="wf-step-edit-btn"
                          onClick={() => onStepClick(step, wf)}
                          title="Cập nhật bước"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────
const ProjectWorkflowTab: React.FC<Props> = ({
  projectId,
  projectGroup = 'C',
  projectName = '',
  currentUser,
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<ProjectWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWf, setSelectedWf] = useState<ProjectWorkflow | null>(null);
  const [activatingTemplate, setActivatingTemplate] = useState<WorkflowTemplate | null>(null);
  const [activating, setActivating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedStep, setSelectedStep] = useState<{ step: ProjectWorkflowStep; wf: ProjectWorkflow } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tmpl, wfs] = await Promise.all([
        WorkflowService.getAllTemplates(),
        WorkflowService.getProjectWorkflows(projectId),
      ]);
      setTemplates(tmpl);
      setActiveWorkflows(wfs);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleActivate = async (templateCode: string, group: string, startDate: string) => {
    setActivating(templateCode);
    try {
      const result = await WorkflowService.activateWorkflow({
        project_id: projectId,
        template_code: templateCode,
        project_group: group,
        started_by: currentUser,
        start_date: startDate,
      });
      if (result.success) {
        await load();
        setActivatingTemplate(null);
        alert(`✅ Đã kích hoạt quy trình! Tạo ${result.tasks_created} công việc tự động.`);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setActivating(null);
    }
  };

  const getWorkflowForTemplate = (templateId: string) =>
    activeWorkflows.find(w => w.template_id === templateId);

  const grouped = PHASE_ORDER.reduce((acc, phase) => {
    acc[phase] = templates.filter(t => t.phase === phase);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  const totalActive = activeWorkflows.filter(w => w.status === 'active').length;
  const totalCompleted = activeWorkflows.filter(w => w.status === 'completed').length;

  if (loading) {
    return (
      <div className="wf-loading">
        <div className="wf-spinner" />
        <p>Đang tải quy trình...</p>
      </div>
    );
  }

  return (
    <div className="wf-tab">
      {/* Header Stats */}
      <div className="wf-header">
        <div className="wf-header-left">
          <h3 className="wf-title">
            <span className="wf-icon">⚙️</span>
            Quy trình thực hiện dự án
          </h3>
          <span className="wf-group-badge">
            {PROJECT_GROUP_LABELS[projectGroup] || `Nhóm ${projectGroup}`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="wf-stats-row">
            <div className="wf-stat-chip active">
              <span className="wf-stat-dot" style={{ background: '#3b82f6' }} />
              {totalActive} đang chạy
            </div>
            <div className="wf-stat-chip done">
              <span className="wf-stat-dot" style={{ background: '#10b981' }} />
              {totalCompleted} hoàn thành
            </div>
            <div className="wf-stat-chip total">
              <span className="wf-stat-dot" style={{ background: '#6b7280' }} />
              {templates.length} quy trình
            </div>
          </div>

          {/* View Toggle */}
          <div className="wf-view-toggle">
            <button
              className={`wf-view-btn ${viewMode === 'cards' ? 'active' : ''}`}
              onClick={() => setViewMode('cards')}
              title="Dạng thẻ"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              className={`wf-view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Dạng bảng"
            >
              <Table2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      {activeWorkflows.length > 0 && (
        <div className="wf-overall-progress">
          <div className="wf-progress-label">
            <span>Tiến độ tổng thể</span>
            <span className="wf-progress-pct">
              {Math.round((totalCompleted / templates.length) * 100)}%
            </span>
          </div>
          <div className="wf-progress-track">
            <div
              className="wf-progress-fill"
              style={{ width: `${(totalCompleted / templates.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div className="wf-table-view">
          {PHASE_ORDER.map((phase, phaseIdx) => {
            const phaseTmpls = grouped[phase] || [];
            if (!phaseTmpls.length) return null;
            const phaseColor = PHASE_COLORS[phase];
            const activeWfs = phaseTmpls
              .map(t => getWorkflowForTemplate(t.id))
              .filter(Boolean) as ProjectWorkflow[];

            return (
              <div key={phase} className="wf-table-phase-section">
                <div className="wf-phase-header" style={{ borderLeftColor: phaseColor }}>
                  <div className="wf-phase-number" style={{ background: phaseColor }}>{phaseIdx + 1}</div>
                  <div className="wf-phase-info">
                    <h4 className="wf-phase-title">{PHASE_LABELS[phase]}</h4>
                    <span className="wf-phase-count">
                      {phaseTmpls.filter(t => getWorkflowForTemplate(t.id)?.status === 'completed').length}
                      /{phaseTmpls.length} quy trình hoàn thành
                    </span>
                  </div>
                </div>

                {/* Active workflows → show as tables */}
                {activeWfs.map(wf => (
                  <WorkflowTableView
                    key={wf.id}
                    wf={wf}
                    group={projectGroup}
                    onViewDetail={setSelectedWf}
                    onStepClick={(step, w) => { setSelectedStep({ step, wf: w }); setSelectedWf(w); }}
                  />
                ))}

                {/* Not-activated templates in this phase */}
                {phaseTmpls
                  .filter(t => !getWorkflowForTemplate(t.id))
                  .map(tmpl => (
                    <div key={tmpl.id} className="wf-table-idle-row">
                      <span className="wf-table-idle-code">{tmpl.code}</span>
                      <span className="wf-table-idle-name">{tmpl.name}</span>
                      <span className="badge badge--idle">○ Chưa kích hoạt</span>
                      <button
                        className="wf-btn wf-btn--primary wf-btn--sm"
                        onClick={() => setActivatingTemplate(tmpl)}
                        disabled={!!activating}
                      >
                        ▶ Kích hoạt
                      </button>
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── CARDS VIEW ── */}
      {viewMode === 'cards' && (
        <>
          {PHASE_ORDER.map((phase, phaseIdx) => {
            const phaseTmpls = grouped[phase] || [];
            if (!phaseTmpls.length) return null;
            const phaseColor = PHASE_COLORS[phase];

            return (
              <div key={phase} className="wf-phase-section">
                <div className="wf-phase-header" style={{ borderLeftColor: phaseColor }}>
                  <div className="wf-phase-number" style={{ background: phaseColor }}>
                    {phaseIdx + 1}
                  </div>
                  <div className="wf-phase-info">
                    <h4 className="wf-phase-title">{PHASE_LABELS[phase]}</h4>
                    <span className="wf-phase-count">
                      {phaseTmpls.filter(t => getWorkflowForTemplate(t.id)?.status === 'completed').length}
                      /{phaseTmpls.length} quy trình hoàn thành
                    </span>
                  </div>
                </div>

                <div className="wf-cards-grid">
                  {phaseTmpls.map((tmpl) => {
                    const wf = getWorkflowForTemplate(tmpl.id);
                    const isActive = wf?.status === 'active';
                    const isDone = wf?.status === 'completed';
                    const isPaused = wf?.status === 'paused';
                    const isActivating = activating === tmpl.code;
                    const progress = wf
                      ? Math.round((wf.completed_steps / Math.max(wf.total_steps, 1)) * 100)
                      : 0;

                    return (
                      <div
                        key={tmpl.id}
                        className={`wf-card ${isActive ? 'wf-card--active' : ''} ${isDone ? 'wf-card--done' : ''} ${!wf ? 'wf-card--idle' : ''}`}
                      >
                        <div className="wf-card-header">
                          <div className="wf-card-seq">
                            <span className="wf-card-num">{tmpl.code}</span>
                          </div>
                          <div className="wf-card-status-badge">
                            {isDone ? (
                              <span className="badge badge--done">✓ Hoàn thành</span>
                            ) : isActive ? (
                              <span className="badge badge--active">● Đang chạy</span>
                            ) : isPaused ? (
                              <span className="badge badge--paused">⏸ Tạm dừng</span>
                            ) : (
                              <span className="badge badge--idle">○ Chưa bắt đầu</span>
                            )}
                          </div>
                        </div>

                        <div className="wf-card-body">
                          <h5 className="wf-card-name">{tmpl.name}</h5>
                          {tmpl.description && (
                            <p className="wf-card-desc">{tmpl.description}</p>
                          )}

                          {/* Applicable groups */}
                          <div className="wf-card-groups">
                            {(tmpl.applicable_groups || []).map(g => (
                              <span
                                key={g}
                                className={`wf-card-group-tag ${g === projectGroup ? 'active' : ''}`}
                              >
                                {g}
                              </span>
                            ))}
                          </div>

                          {wf && (
                            <div className="wf-card-progress">
                              <div className="wf-card-progress-row">
                                <span>{wf.completed_steps}/{wf.total_steps} bước</span>
                                <span className="wf-progress-pct">{progress}%</span>
                              </div>
                              <div className="wf-progress-track wf-progress-track--sm">
                                <div
                                  className="wf-progress-fill"
                                  style={{
                                    width: `${progress}%`,
                                    background: isDone ? '#10b981' : '#3b82f6',
                                  }}
                                />
                              </div>
                              {wf.started_at && (
                                <p className="wf-card-meta">
                                  Bắt đầu: {new Date(wf.started_at).toLocaleDateString('vi-VN')}
                                  {wf.project_group && ` · Nhóm ${wf.project_group}`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="wf-card-actions">
                          {wf ? (
                            <button
                              className="wf-btn wf-btn--outline"
                              onClick={() => setSelectedWf(wf)}
                            >
                              📋 Xem & Cập nhật
                            </button>
                          ) : (
                            <button
                              className={`wf-btn wf-btn--primary ${isActivating ? 'loading' : ''}`}
                              onClick={() => setActivatingTemplate(tmpl)}
                              disabled={!!isActivating}
                            >
                              {isActivating ? '⏳ Đang kích hoạt...' : '▶ Kích hoạt'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Workflow Detail Modal */}
      {selectedWf && (
        <WorkflowDetailModal
          workflow={selectedWf}
          projectGroup={selectedWf.project_group || projectGroup}
          currentUser={currentUser}
          onClose={() => { setSelectedWf(null); setSelectedStep(null); }}
          onStepUpdated={load}
        />
      )}

      {/* Activate Modal */}
      {activatingTemplate && (
        <ActivateWorkflowModal
          template={activatingTemplate}
          defaultGroup={projectGroup}
          projectName={projectName}
          isLoading={!!activating}
          onConfirm={(group, startDate) =>
            handleActivate(activatingTemplate.code, group, startDate)
          }
          onClose={() => setActivatingTemplate(null)}
        />
      )}
    </div>
  );
};

export default ProjectWorkflowTab;
