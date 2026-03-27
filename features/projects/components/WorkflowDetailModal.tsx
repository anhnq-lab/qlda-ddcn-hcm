import React, { useState, useEffect } from 'react';
import {
  WorkflowService,
  ProjectWorkflow,
  ProjectWorkflowStep,
  WorkflowStepTemplate,
  STEP_STATUS_LABELS,
  STEP_STATUS_COLORS,
  PHASE_LABELS,
} from '../../../services/WorkflowService';

interface Props {
  workflow: ProjectWorkflow;
  projectGroup: string;
  currentUser?: string;
  onClose: () => void;
  onStepUpdated: () => void;
}

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; color: string }[]> = {
  pending: [{ label: '▶ Bắt đầu', next: 'in_progress', color: '#3b82f6' }],
  in_progress: [
    { label: '📋 Trình phê duyệt', next: 'pending_approval', color: '#8b5cf6' },
    { label: '⚠️ Cần hoàn thiện', next: 'needs_revision', color: '#f59e0b' },
  ],
  needs_revision: [
    { label: '▶ Tiếp tục xử lý', next: 'in_progress', color: '#3b82f6' },
  ],
  pending_approval: [
    { label: '✅ Phê duyệt', next: 'approved', color: '#10b981' },
    { label: '↩️ Trả lại', next: 'needs_revision', color: '#f59e0b' },
    { label: '❌ Từ chối', next: 'rejected', color: '#ef4444' },
  ],
};

const WorkflowDetailModal: React.FC<Props> = ({
  workflow,
  projectGroup,
  currentUser,
  onClose,
  onStepUpdated,
}) => {
  const [steps, setSteps] = useState<ProjectWorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionStep, setActionStep] = useState<ProjectWorkflowStep | null>(null);
  const [actionTarget, setActionTarget] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [decisionNum, setDecisionNum] = useState('');
  const [decisionDate, setDecisionDate] = useState('');
  const [decisionAuth, setDecisionAuth] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadSteps = async () => {
    setLoading(true);
    try {
      const s = await WorkflowService.getWorkflowSteps(workflow.id);
      setSteps(s);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSteps(); }, [workflow.id]);

  const handleAction = async () => {
    if (!actionStep) return;
    setSubmitting(true);
    try {
      await WorkflowService.completeStep({
        step_id: actionStep.id,
        new_status: actionTarget,
        completed_by: currentUser,
        notes: actionNotes || undefined,
        decision_number: decisionNum || undefined,
        decision_date: decisionDate || undefined,
        decision_authority: decisionAuth || undefined,
      });
      await loadSteps();
      onStepUpdated();
      setActionStep(null);
      setActionNotes('');
      setDecisionNum('');
      setDecisionDate('');
      setDecisionAuth('');
    } catch (e: any) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const template = workflow.template;
  const progress = Math.round(
    (workflow.completed_steps / Math.max(workflow.total_steps, 1)) * 100
  );

  const isApprovalAction = actionTarget === 'approved';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wf-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="wf-detail-header">
          <div className="wf-detail-title-row">
            <div>
              <span className="wf-detail-code">{template?.code}</span>
              <h3 className="wf-detail-title">{template?.name}</h3>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          {/* Meta row */}
          <div className="wf-detail-meta">
            <span className="wf-meta-chip">
              📅 Bắt đầu: {new Date(workflow.started_at).toLocaleDateString('vi-VN')}
            </span>
            <span className="wf-meta-chip">
              📦 Nhóm {workflow.project_group}
            </span>
            <span className={`wf-meta-chip wf-status--${workflow.status}`}>
              {workflow.status === 'active' ? '● Đang chạy' : '✓ Hoàn thành'}
            </span>
            <span className="wf-meta-chip">
              {workflow.completed_steps}/{workflow.total_steps} bước • {progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="wf-progress-track" style={{ marginTop: '8px' }}>
            <div className="wf-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Steps */}
        <div className="wf-detail-body">
          {loading ? (
            <div className="wf-loading"><div className="wf-spinner" /></div>
          ) : (
            <div className="wf-steps-list">
              {steps.map((step, idx) => {
                const st = step.step_template;
                const statusColor = STEP_STATUS_COLORS[step.status] || '#6b7280';
                const statusLabel = STEP_STATUS_LABELS[step.status] || step.status;
                const transitions = STATUS_TRANSITIONS[step.status] || [];
                const slaGroup = projectGroup as 'QN' | 'A' | 'B' | 'C';
                const sla = st ? WorkflowService.getSLAForGroup(st, slaGroup) : step.sla_days;
                const isSkipped = step.status === 'skipped';

                // SLA warning
                const isOverdue = step.planned_end_date &&
                  new Date(step.planned_end_date) < new Date() &&
                  !['approved', 'rejected', 'skipped'].includes(step.status);

                return (
                  <div
                    key={step.id}
                    className={`wf-step ${isSkipped ? 'wf-step--skipped' : ''} ${step.status === 'approved' ? 'wf-step--done' : ''}`}
                  >
                    {/* Step Number + Connector */}
                    <div className="wf-step-col-left">
                      <div
                        className="wf-step-circle"
                        style={{ borderColor: statusColor, background: step.status === 'approved' ? statusColor : 'transparent' }}
                      >
                        {step.status === 'approved' ? (
                          <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>
                        ) : (
                          <span style={{ color: statusColor, fontWeight: 700, fontSize: '11px' }}>
                            {step.step_number}
                          </span>
                        )}
                      </div>
                      {idx < steps.length - 1 && (
                        <div className={`wf-step-line ${step.status === 'approved' ? 'wf-step-line--done' : ''}`} />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="wf-step-content">
                      <div className="wf-step-header-row">
                        <div className="wf-step-title-group">
                          <span className="wf-step-code">{step.step_code}</span>
                          <h5 className="wf-step-name">{st?.name || step.step_code}</h5>
                        </div>
                        <span
                          className="wf-step-status-badge"
                          style={{ background: statusColor + '20', color: statusColor, borderColor: statusColor + '40' }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Meta info */}
                      <div className="wf-step-meta">
                        {st?.actor_label && (
                          <span className="wf-step-meta-item">👤 {st.actor_label}</span>
                        )}
                        {sla && (
                          <span className={`wf-step-meta-item ${isOverdue ? 'wf-step-meta--overdue' : ''}`}>
                            ⏱ SLA: {sla} ngày
                            {isOverdue && ' ⚠️ Quá hạn!'}
                          </span>
                        )}
                        {step.planned_end_date && (
                          <span className={`wf-step-meta-item ${isOverdue ? 'wf-step-meta--overdue' : ''}`}>
                            📅 Hạn: {new Date(step.planned_end_date).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {st?.is_bidding_trigger && (
                          <span className="wf-step-meta-item wf-step-meta--bidding">
                            🔗 Module LCNT
                          </span>
                        )}
                      </div>

                      {/* Output description */}
                      {st?.output_description && !isSkipped && (
                        <p className="wf-step-output">
                          📄 <em>{st.output_description}</em>
                        </p>
                      )}

                      {/* Legal basis */}
                      {st?.legal_basis && !isSkipped && (
                        <p className="wf-step-legal">⚖️ {st.legal_basis}</p>
                      )}

                      {/* Completion info */}
                      {step.status === 'approved' && step.decision_number && (
                        <div className="wf-step-decision">
                          <span>📋 {step.decision_number}</span>
                          {step.decision_date && <span> · {step.decision_date}</span>}
                          {step.decision_authority && <span> · {step.decision_authority}</span>}
                        </div>
                      )}

                      {step.notes && (
                        <p className="wf-step-notes">💬 {step.notes}</p>
                      )}

                      {/* Action buttons */}
                      {!isSkipped && transitions.length > 0 && (
                        <div className="wf-step-actions">
                          {transitions.map(tr => (
                            <button
                              key={tr.next}
                              className="wf-action-btn"
                              style={{ borderColor: tr.color, color: tr.color }}
                              onClick={() => {
                                setActionStep(step);
                                setActionTarget(tr.next);
                              }}
                            >
                              {tr.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Action Confirm Panel */}
      {actionStep && (
        <div className="wf-action-panel-overlay" onClick={() => setActionStep(null)}>
          <div className="wf-action-panel" onClick={e => e.stopPropagation()}>
            <h4 className="wf-action-panel-title">
              Cập nhật bước: {actionStep.step_template?.name || actionStep.step_code}
            </h4>
            <p className="wf-action-panel-subtitle">
              Trạng thái mới: <strong>{STEP_STATUS_LABELS[actionTarget]}</strong>
            </p>

            {isApprovalAction && (
              <>
                <div className="form-group">
                  <label>Số quyết định / văn bản</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: 123/QĐ-UBND"
                    value={decisionNum}
                    onChange={e => setDecisionNum(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày ký</label>
                  <input
                    type="date"
                    className="form-input"
                    value={decisionDate}
                    onChange={e => setDecisionDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Cơ quan phê duyệt</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: UBND tỉnh Hải Dương"
                    value={decisionAuth}
                    onChange={e => setDecisionAuth(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Ghi chú</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Ghi chú thêm (không bắt buộc)..."
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
              />
            </div>

            <div className="wf-action-panel-btns">
              <button
                className="wf-btn wf-btn--outline"
                onClick={() => setActionStep(null)}
              >
                Hủy
              </button>
              <button
                className="wf-btn wf-btn--primary"
                onClick={handleAction}
                disabled={submitting}
              >
                {submitting ? '⏳ Đang lưu...' : '✓ Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetailModal;
