import React, { useState } from 'react';
import { WorkflowTemplate, PROJECT_GROUP_LABELS } from '../../../services/WorkflowService';

interface Props {
  template: WorkflowTemplate;
  defaultGroup: string;
  projectName: string;
  isLoading: boolean;
  onConfirm: (group: string, startDate: string) => void;
  onClose: () => void;
}

const GROUPS = ['QN', 'A', 'B', 'C'];

const ActivateWorkflowModal: React.FC<Props> = ({
  template,
  defaultGroup,
  projectName,
  isLoading,
  onConfirm,
  onClose,
}) => {
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup || 'C');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="wf-activate-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="wf-activate-header">
          <span className="wf-activate-icon">▶️</span>
          <div>
            <h4 className="wf-activate-title">Kích hoạt quy trình</h4>
            <p className="wf-activate-subtitle">{template.name}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="wf-activate-body">
          {/* Project info */}
          <div className="wf-activate-info-box">
            <div className="wf-activate-info-row">
              <span>📁 Dự án:</span>
              <strong>{projectName || '—'}</strong>
            </div>
            <div className="wf-activate-info-row">
              <span>🔖 Quy trình:</span>
              <span className="wf-code-tag">{template.code}</span>
            </div>
          </div>

          {/* Group selector */}
          <div className="form-group">
            <label className="form-label">Nhóm dự án (ảnh hưởng SLA)</label>
            <div className="wf-group-btns">
              {GROUPS.filter(g => template.applicable_groups?.includes(g)).map(g => (
                <button
                  key={g}
                  className={`wf-group-btn ${selectedGroup === g ? 'wf-group-btn--selected' : ''}`}
                  onClick={() => setSelectedGroup(g)}
                >
                  <span className="wf-group-key">{g}</span>
                  <span className="wf-group-label">{PROJECT_GROUP_LABELS[g]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SLA hint */}
          <div className="wf-sla-hint">
            <span>ℹ️</span>
            <span>
              SLA của từng bước sẽ được tính theo <strong>Nhóm {selectedGroup}</strong>. 
              Hệ thống sẽ tự động tạo <strong>công việc (Tasks)</strong> cho tất cả các bước.
            </span>
          </div>

          {/* Start date */}
          <div className="form-group">
            <label className="form-label">Ngày bắt đầu quy trình</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <span className="form-hint">
              Ngày kế hoạch cho bước đầu tiên. Các bước tiếp theo được tính tự động từ SLA.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="wf-activate-footer">
          <button className="wf-btn wf-btn--outline" onClick={onClose}>
            Hủy
          </button>
          <button
            className="wf-btn wf-btn--primary"
            onClick={() => onConfirm(selectedGroup, startDate)}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Đang kích hoạt...' : '▶ Kích hoạt & Tạo công việc'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateWorkflowModal;
