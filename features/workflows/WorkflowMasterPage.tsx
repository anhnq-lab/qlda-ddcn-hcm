import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  WorkflowService,
  WorkflowTemplate,
  WorkflowStepTemplate,
  SubTask,
  PHASE_LABELS,
  PHASE_COLORS,
  PROJECT_GROUP_LABELS,
} from '../../services/WorkflowService';
import {
  GitBranch, Plus, Save, Trash2, ChevronUp, ChevronDown,
  Edit3, Check, X, AlertCircle, RefreshCw, Search, Filter,
  Clock, Users, FileText, Gavel, Settings, Eye, EyeOff,
  ArrowUpDown, Info, CheckSquare, Zap, ListChecks, BookOpen,
} from 'lucide-react';

// ─── PHASE ORDER ─────────────────────────────────────────────
const PHASES = ['preparation', 'execution', 'completion'] as const;
const GROUP_KEYS = ['QN', 'A', 'B', 'C'];

// ─── INLINE TEXT EDITOR ──────────────────────────────────────
interface InlineCellProps {
  value: string | number | null;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  className?: string;
}

const InlineCell: React.FC<InlineCellProps> = ({ value, onSave, type = 'text', placeholder = '—', className = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(String(value ?? '')); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== String(value ?? '')) onSave(draft);
  };
  const cancel = () => { setEditing(false); setDraft(String(value ?? '')); };

  if (editing) {
    const commonProps = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<any>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') commit();
        if (e.key === 'Escape') cancel();
      },
      className: 'wfm-cell-input',
    };
    return type === 'textarea'
      ? <textarea {...commonProps} rows={2} style={{ width: '100%', minWidth: 80 }} />
      : <input {...commonProps} type={type} style={{ width: type === 'number' ? 64 : '100%', minWidth: 40 }} />;
  }

  return (
    <span
      className={`wfm-cell-display ${className}`}
      onClick={() => setEditing(true)}
      title="Click để chỉnh sửa"
    >
      {value !== null && value !== '' ? String(value) : <span className="wfm-cell-placeholder">{placeholder}</span>}
      <Edit3 className="wfm-cell-edit-icon" />
    </span>
  );
};

// ─── STEP ROW ────────────────────────────────────────────────
interface StepRowProps {
  step: WorkflowStepTemplate;
  idx: number;
  total: number;
  projectGroup: string;
  onUpdate: (id: string, field: string, val: any) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
}

const StepRow: React.FC<StepRowProps> = ({ step, idx, total, projectGroup, onUpdate, onDelete, onMove }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Xóa bước "${step.name}"?`)) return;
    setDeleting(true);
    await onDelete(step.id);
  };

  const priorityColors: Record<string, string> = {
    urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280',
  };

  return (
    <>
      <tr className={`wfm-step-row ${deleting ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Order */}
        <td className="wfm-td wfm-td--center" style={{ width: 42 }}>
          <div className="wfm-order-cell">
            <span className="wfm-step-num">{step.step_number}</span>
            <div className="wfm-reorder-btns">
              <button onClick={() => onMove(step.id, 'up')} disabled={idx === 0} className="wfm-reorder-btn" title="Lên">
                <ChevronUp size={12} />
              </button>
              <button onClick={() => onMove(step.id, 'down')} disabled={idx === total - 1} className="wfm-reorder-btn" title="Xuống">
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        </td>

        {/* Step Code */}
        <td className="wfm-td" style={{ width: 90 }}>
          <InlineCell
            value={step.step_code}
            onSave={(v) => onUpdate(step.id, 'step_code', v)}
            placeholder="Mã bước"
            className="wfm-code-cell"
          />
        </td>

        {/* Name */}
        <td className="wfm-td" style={{ minWidth: 200 }}>
          <div className="wfm-name-cell">
            <InlineCell
              value={step.name}
              onSave={(v) => onUpdate(step.id, 'name', v)}
              type="textarea"
              placeholder="Tên bước"
              className="wfm-name-text"
            />
            {step.is_bidding_trigger && (
              <span className="wfm-flag-badge wfm-flag-badge--bidding" title="Kích hoạt đấu thầu">
                <Zap size={10} /> Đấu thầu
              </span>
            )}
          </div>
        </td>

        {/* Actor */}
        <td className="wfm-td" style={{ width: 130 }}>
          <div className="wfm-actor-cell">
            <InlineCell
              value={step.actor_label || step.actor_role}
              onSave={(v) => onUpdate(step.id, 'actor_label', v)}
              placeholder="Vai trò"
            />
          </div>
        </td>

        {/* SLA QN */}
        <td className="wfm-td wfm-td--center" style={{ width: 62 }}>
          <InlineCell
            value={step.sla_days_qn}
            onSave={(v) => onUpdate(step.id, 'sla_days_qn', v ? Number(v) : null)}
            type="number"
            placeholder="—"
            className={`wfm-sla-cell ${projectGroup === 'QN' ? 'wfm-sla-cell--active' : ''}`}
          />
        </td>

        {/* SLA A */}
        <td className="wfm-td wfm-td--center" style={{ width: 62 }}>
          <InlineCell
            value={step.sla_days_a}
            onSave={(v) => onUpdate(step.id, 'sla_days_a', v ? Number(v) : null)}
            type="number"
            placeholder="—"
            className={`wfm-sla-cell ${projectGroup === 'A' ? 'wfm-sla-cell--active' : ''}`}
          />
        </td>

        {/* SLA B */}
        <td className="wfm-td wfm-td--center" style={{ width: 62 }}>
          <InlineCell
            value={step.sla_days_b}
            onSave={(v) => onUpdate(step.id, 'sla_days_b', v ? Number(v) : null)}
            type="number"
            placeholder="—"
            className={`wfm-sla-cell ${projectGroup === 'B' ? 'wfm-sla-cell--active' : ''}`}
          />
        </td>

        {/* SLA C */}
        <td className="wfm-td wfm-td--center" style={{ width: 62 }}>
          <InlineCell
            value={step.sla_days_c}
            onSave={(v) => onUpdate(step.id, 'sla_days_c', v ? Number(v) : null)}
            type="number"
            placeholder="—"
            className={`wfm-sla-cell ${projectGroup === 'C' ? 'wfm-sla-cell--active' : ''}`}
          />
        </td>

        {/* Priority */}
        <td className="wfm-td wfm-td--center" style={{ width: 80 }}>
          <select
            className="wfm-priority-select"
            value={step.task_priority}
            onChange={(e) => onUpdate(step.id, 'task_priority', e.target.value)}
            style={{ color: priorityColors[step.task_priority] }}
          >
            <option value="urgent">Khẩn</option>
            <option value="high">Cao</option>
            <option value="medium">TB</option>
            <option value="low">Thấp</option>
          </select>
        </td>

        {/* Actions */}
        <td className="wfm-td wfm-td--center" style={{ width: 72 }}>
          <div className="wfm-row-actions">
            <button
              className={`wfm-expand-btn ${expanded ? 'active' : ''}`}
              onClick={() => setExpanded(!expanded)}
              title="Chi tiết"
            >
              <Info size={13} />
            </button>
            <button
              className="wfm-delete-btn"
              onClick={handleDelete}
              title="Xóa bước"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded Detail Row */}
      {expanded && (
        <tr className="wfm-detail-row">
          <td colSpan={10}>
            <div className="wfm-detail-grid">
              <div className="wfm-detail-field">
                <label><FileText size={12} /> Kết quả đầu ra</label>
                <InlineCell
                  value={step.output_description}
                  onSave={(v) => onUpdate(step.id, 'output_description', v)}
                  type="textarea"
                  placeholder="Mô tả kết quả đầu ra..."
                />
              </div>
              <div className="wfm-detail-field">
                <label><Gavel size={12} /> Căn cứ pháp lý</label>
                <InlineCell
                  value={step.legal_basis}
                  onSave={(v) => onUpdate(step.id, 'legal_basis', v)}
                  type="textarea"
                  placeholder="Nghị định, thông tư..."
                />
              </div>
              <div className="wfm-detail-field">
                <label><CheckSquare size={12} /> Tiêu đề công việc tự động</label>
                <InlineCell
                  value={step.task_title_template}
                  onSave={(v) => onUpdate(step.id, 'task_title_template', v)}
                  placeholder="Template tiêu đề task..."
                />
              </div>
              <div className="wfm-detail-field">
                <label><Info size={12} /> Mô tả bước</label>
                <InlineCell
                  value={step.description}
                  onSave={(v) => onUpdate(step.id, 'description', v)}
                  type="textarea"
                  placeholder="Mô tả chi tiết..."
                />
              </div>
              <div className="wfm-detail-field wfm-detail-field--row">
                <label>Flags:</label>
                <label className="wfm-toggle-label">
                  <input
                    type="checkbox"
                    checked={step.is_bidding_trigger}
                    onChange={(e) => onUpdate(step.id, 'is_bidding_trigger', e.target.checked)}
                  />
                  <span>Kích hoạt đấu thầu</span>
                </label>
                <label className="wfm-toggle-label">
                  <input
                    type="checkbox"
                    checked={step.is_branch_step}
                    onChange={(e) => onUpdate(step.id, 'is_branch_step', e.target.checked)}
                  />
                  <span>Bước phân nhánh</span>
                </label>
              </div>

              {/* Sub-tasks Panel */}
              {step.sub_tasks && step.sub_tasks.length > 0 && (
                <div className="wfm-subtasks-section">
                  <div className="wfm-subtasks-header">
                    <ListChecks size={14} />
                    <span>Công việc con ({step.sub_tasks.length} việc)</span>
                  </div>
                  <div className="wfm-subtasks-timeline">
                    {step.sub_tasks.map((st: SubTask, idx: number) => (
                      <div key={st.id} className="wfm-subtask-card">
                        <div className="wfm-subtask-num">{idx + 1}</div>
                        <div className="wfm-subtask-body">
                          <div className="wfm-subtask-title">{st.title}</div>
                          {st.description && (
                            <div className="wfm-subtask-desc">{st.description}</div>
                          )}
                          <div className="wfm-subtask-meta-row">
                            {st.actor && (
                              <span className="wfm-subtask-meta wfm-subtask-meta--actor">
                                <Users size={10} /> {st.actor}
                              </span>
                            )}
                            {st.legal_basis && (
                              <span className="wfm-subtask-meta wfm-subtask-meta--legal">
                                <BookOpen size={10} /> {st.legal_basis}
                              </span>
                            )}
                            {st.duration_days && (
                              <span className="wfm-subtask-meta wfm-subtask-meta--duration">
                                <Clock size={10} /> {st.duration_days} ngày
                              </span>
                            )}
                          </div>
                          {st.output && (
                            <div className="wfm-subtask-output">
                              <FileText size={10} />
                              <span>{st.output}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── TEMPLATE EDITOR ─────────────────────────────────────────
interface TemplateEditorProps {
  template: WorkflowTemplate;
  onTemplateUpdate: (id: string, data: Partial<WorkflowTemplate>) => void;
  onClose: () => void;
}

const TemplateInfoEditor: React.FC<TemplateEditorProps> = ({ template, onTemplateUpdate }) => {
  const [draft, setDraft] = useState({ ...template });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(template);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onTemplateUpdate(template.id, {
        name: draft.name,
        description: draft.description,
        applicable_groups: draft.applicable_groups,
        is_active: draft.is_active,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (g: string) => {
    const cur = draft.applicable_groups || [];
    setDraft(d => ({
      ...d,
      applicable_groups: cur.includes(g) ? cur.filter(x => x !== g) : [...cur, g],
    }));
  };

  return (
    <div className="wfm-info-form">
      <div className="wfm-form-row">
        <label className="wfm-form-label">Tên quy trình</label>
        <input
          className="wfm-form-input"
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        />
      </div>
      <div className="wfm-form-row">
        <label className="wfm-form-label">Mô tả</label>
        <textarea
          className="wfm-form-input"
          rows={3}
          value={draft.description || ''}
          onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
        />
      </div>
      <div className="wfm-form-row">
        <label className="wfm-form-label">Nhóm dự án áp dụng</label>
        <div className="wfm-group-toggles">
          {GROUP_KEYS.map(g => (
            <button
              key={g}
              className={`wfm-group-toggle ${(draft.applicable_groups || []).includes(g) ? 'active' : ''}`}
              onClick={() => toggleGroup(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="wfm-form-row">
        <label className="wfm-form-label">Trạng thái</label>
        <label className="wfm-toggle-label">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={e => setDraft(d => ({ ...d, is_active: e.target.checked }))}
          />
          <span>{draft.is_active ? '✅ Đang hoạt động' : '⛔ Tắt'}</span>
        </label>
      </div>
      {isDirty && (
        <button
          className={`wfm-save-btn ${saving ? 'loading' : ''} ${saved ? 'saved' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
          {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu thay đổi'}
        </button>
      )}
    </div>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────────
const WorkflowMasterPage: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [steps, setSteps] = useState<WorkflowStepTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'steps'>('steps');
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [previewGroup, setPreviewGroup] = useState<string>('A');
  const [savingStep, setSavingStep] = useState<string | null>(null);
  const [addingStep, setAddingStep] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load all templates
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await WorkflowService.getAllTemplatesForAdmin();
      setTemplates(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { loadTemplates(); }, []);

  // Load steps when selected template changes
  useEffect(() => {
    if (!selectedId) return;
    setStepsLoading(true);
    setSteps([]);
    WorkflowService.getTemplateWithSteps(selectedId)
      .then(res => { if (res) setSteps(res.steps); })
      .catch(console.error)
      .finally(() => setStepsLoading(false));
  }, [selectedId]);

  const selectedTemplate = templates.find(t => t.id === selectedId) || null;

  // Filter templates
  const filtered = templates.filter(t => {
    const matchPhase = phaseFilter === 'all' || t.phase === phaseFilter;
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    return matchPhase && matchSearch;
  });

  // Group filtered by phase
  const grouped = PHASES.reduce((acc, p) => {
    acc[p] = filtered.filter(t => t.phase === p);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  // Handle step update with auto-save
  const handleStepUpdate = async (id: string, field: string, val: any) => {
    // Optimistic update
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
    setSavingStep(id);
    try {
      await WorkflowService.updateStep(id, { [field]: val } as any);
      showToast('Đã lưu thay đổi');
    } catch (e: any) {
      showToast(`Lỗi: ${e.message}`, 'err');
      // Revert
      const res = await WorkflowService.getTemplateWithSteps(selectedId!);
      if (res) setSteps(res.steps);
    } finally {
      setSavingStep(null);
    }
  };

  // Handle step delete
  const handleStepDelete = async (id: string) => {
    try {
      await WorkflowService.deleteStep(id);
      setSteps(prev => {
        const next = prev.filter(s => s.id !== id);
        // Renumber
        return next.map((s, i) => ({ ...s, step_number: i + 1 }));
      });
      showToast('Đã xóa bước');
    } catch (e: any) {
      showToast(`Lỗi: ${e.message}`, 'err');
    }
  };

  // Handle reorder
  const handleMove = async (id: string, dir: 'up' | 'down') => {
    const idx = steps.findIndex(s => s.id === id);
    if (idx < 0) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= steps.length) return;

    const newSteps = [...steps];
    [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
    const renumbered = newSteps.map((s, i) => ({ ...s, step_number: i + 1, sort_order: i + 1 }));
    setSteps(renumbered);

    try {
      await WorkflowService.reorderSteps(
        renumbered.map(s => ({ id: s.id, step_number: s.step_number, sort_order: s.sort_order }))
      );
    } catch (e: any) {
      showToast(`Lỗi sắp xếp: ${e.message}`, 'err');
    }
  };

  // Handle template update
  const handleTemplateUpdate = async (id: string, data: Partial<WorkflowTemplate>) => {
    try {
      const updated = await WorkflowService.updateTemplate(id, data);
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
      showToast('Đã cập nhật quy trình');
    } catch (e: any) {
      showToast(`Lỗi: ${e.message}`, 'err');
    }
  };

  // Add new step
  const handleAddStep = async () => {
    if (!selectedId) return;
    setAddingStep(true);
    try {
      const newStep = await WorkflowService.createStep(selectedId, {
        name: 'Bước mới (click để đổi tên)',
        applicable_groups: ['QN', 'A', 'B', 'C'],
        task_priority: 'medium',
      });
      setSteps(prev => [...prev, newStep]);
      showToast('Đã thêm bước mới');
    } catch (e: any) {
      showToast(`Lỗi: ${e.message}`, 'err');
    } finally {
      setAddingStep(false);
    }
  };

  // Total SLA for selected group
  const totalSLA = steps.reduce((sum, s) => {
    const sla = previewGroup === 'QN' ? s.sla_days_qn
      : previewGroup === 'A' ? s.sla_days_a
      : previewGroup === 'B' ? s.sla_days_b
      : s.sla_days_c;
    return sum + (sla || 0);
  }, 0);

  return (
    <div className="wfm-page">
      {/* Toast */}
      {toast && (
        <div className={`wfm-toast ${toast.type === 'err' ? 'wfm-toast--err' : 'wfm-toast--ok'}`}>
          {toast.type === 'ok' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <div className="wfm-page-header">
        <div className="wfm-page-title">
          <GitBranch className="wfm-page-icon" />
          <div>
            <h1>Quản lý Quy trình mẫu</h1>
            <p>Cấu hình 7 quy trình thực hiện dự án — thay đổi sẽ áp dụng cho dự án mới được kích hoạt</p>
          </div>
        </div>
        <div className="wfm-page-meta">
          <div className="wfm-meta-chip">
            <GitBranch size={13} /> {templates.length} quy trình
          </div>
          <div className="wfm-meta-chip">
            <CheckSquare size={13} /> {steps.length} bước
          </div>
        </div>
      </div>

      <div className="wfm-layout">
        {/* Left Panel: Template List */}
        <aside className="wfm-left-panel">
          <div className="wfm-left-header">
            <div className="wfm-search-box">
              <Search size={14} className="wfm-search-icon" />
              <input
                className="wfm-search-input"
                placeholder="Tìm quy trình..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="wfm-phase-filter">
              {[{ k: 'all', l: 'Tất cả' }, ...PHASES.map(p => ({ k: p, l: PHASE_LABELS[p].split(':')[1].trim() }))].map(({ k, l }) => (
                <button
                  key={k}
                  className={`wfm-filter-chip ${phaseFilter === k ? 'active' : ''}`}
                  onClick={() => setPhaseFilter(k)}
                  style={phaseFilter === k && k !== 'all' ? { borderColor: PHASE_COLORS[k], color: PHASE_COLORS[k] } : {}}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="wfm-template-list">
            {loading ? (
              <div className="wfm-list-loading">
                <RefreshCw size={18} className="animate-spin" /> Đang tải...
              </div>
            ) : (
              PHASES.map(phase => {
                const items = grouped[phase];
                if (!items?.length) return null;
                return (
                  <div key={phase} className="wfm-phase-group">
                    <div
                      className="wfm-phase-group-header"
                      style={{ borderLeftColor: PHASE_COLORS[phase] }}
                    >
                      <span className="wfm-phase-dot" style={{ background: PHASE_COLORS[phase] }} />
                      {PHASE_LABELS[phase]}
                    </div>
                    {items.map(t => (
                      <button
                        key={t.id}
                        className={`wfm-template-item ${selectedId === t.id ? 'active' : ''} ${!t.is_active ? 'inactive' : ''}`}
                        onClick={() => setSelectedId(t.id)}
                      >
                        <div className="wfm-template-item-top">
                          <span className="wfm-template-code">{t.code}</span>
                          {!t.is_active && <EyeOff size={11} className="wfm-inactive-icon" />}
                        </div>
                        <div className="wfm-template-item-name">{t.name}</div>
                        <div className="wfm-template-item-meta">
                          {(t.applicable_groups || []).map(g => (
                            <span key={g} className="wfm-mini-group">{g}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Panel: Editor */}
        <main className="wfm-right-panel">
          {!selectedTemplate ? (
            <div className="wfm-empty-state">
              <GitBranch size={40} />
              <p>Chọn quy trình để chỉnh sửa</p>
            </div>
          ) : (
            <>
              {/* Template Header */}
              <div className="wfm-editor-header">
                <div className="wfm-editor-title">
                  <span className="wfm-editor-code">{selectedTemplate.code}</span>
                  <h2 className="wfm-editor-name">{selectedTemplate.name}</h2>
                  <span
                    className="wfm-phase-badge"
                    style={{ background: `${PHASE_COLORS[selectedTemplate.phase]}20`, color: PHASE_COLORS[selectedTemplate.phase] }}
                  >
                    {PHASE_LABELS[selectedTemplate.phase]}
                  </span>
                  {!selectedTemplate.is_active && (
                    <span className="wfm-inactive-badge"><EyeOff size={11} /> Tắt</span>
                  )}
                </div>
                {/* Group selector for SLA preview */}
                <div className="wfm-group-preview-selector">
                  <span className="wfm-preview-label">Xem SLA nhóm:</span>
                  {GROUP_KEYS.map(g => (
                    <button
                      key={g}
                      className={`wfm-preview-group-btn ${previewGroup === g ? 'active' : ''}`}
                      onClick={() => setPreviewGroup(g)}
                    >
                      {g}
                    </button>
                  ))}
                  <span className="wfm-total-sla">
                    <Clock size={12} /> Tổng: <strong>{totalSLA} ngày</strong>
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="wfm-tabs">
                <button
                  className={`wfm-tab ${activeTab === 'steps' ? 'active' : ''}`}
                  onClick={() => setActiveTab('steps')}
                >
                  <ArrowUpDown size={14} /> Các bước ({steps.length})
                </button>
                <button
                  className={`wfm-tab ${activeTab === 'info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('info')}
                >
                  <Settings size={14} /> Thông tin
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'info' ? (
                <div className="wfm-tab-body">
                  <TemplateInfoEditor
                    template={selectedTemplate}
                    onTemplateUpdate={handleTemplateUpdate}
                    onClose={() => {}}
                  />
                </div>
              ) : (
                <div className="wfm-tab-body wfm-tab-body--table">
                  {/* Table Toolbar */}
                  <div className="wfm-table-toolbar">
                    <span className="wfm-table-info">
                      <Info size={12} /> Click vào ô để chỉnh sửa trực tiếp. SLA tính bằng <strong>ngày làm việc</strong>.
                    </span>
                    <button
                      className={`wfm-add-step-btn ${addingStep ? 'loading' : ''}`}
                      onClick={handleAddStep}
                      disabled={addingStep}
                    >
                      <Plus size={14} />
                      Thêm bước
                    </button>
                  </div>

                  {/* Steps Table */}
                  {stepsLoading ? (
                    <div className="wfm-table-loading">
                      <RefreshCw size={18} className="animate-spin" /> Đang tải bước...
                    </div>
                  ) : (
                    <div className="wfm-table-wrapper">
                      <table className="wfm-steps-table">
                        <thead>
                          <tr>
                            <th style={{ width: 42 }}>#</th>
                            <th style={{ width: 90 }}>Mã bước</th>
                            <th>Tên bước / Nội dung công việc</th>
                            <th style={{ width: 130 }}>
                              <Users size={12} /> Vai trò
                            </th>
                            <th style={{ width: 62 }} className={`wfm-sla-header ${previewGroup === 'QN' ? 'active' : ''}`}>QN</th>
                            <th style={{ width: 62 }} className={`wfm-sla-header ${previewGroup === 'A' ? 'active' : ''}`}>A</th>
                            <th style={{ width: 62 }} className={`wfm-sla-header ${previewGroup === 'B' ? 'active' : ''}`}>B</th>
                            <th style={{ width: 62 }} className={`wfm-sla-header ${previewGroup === 'C' ? 'active' : ''}`}>C</th>
                            <th style={{ width: 80 }}>Ưu tiên</th>
                            <th style={{ width: 72 }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {steps.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="wfm-empty-steps">
                                Chưa có bước nào. <button onClick={handleAddStep} className="wfm-link-btn">+ Thêm bước đầu tiên</button>
                              </td>
                            </tr>
                          ) : (
                            steps.map((step, idx) => (
                              <StepRow
                                key={step.id}
                                step={step}
                                idx={idx}
                                total={steps.length}
                                projectGroup={previewGroup}
                                onUpdate={handleStepUpdate}
                                onDelete={handleStepDelete}
                                onMove={handleMove}
                              />
                            ))
                          )}
                        </tbody>
                        {steps.length > 0 && (
                          <tfoot>
                            <tr className="wfm-table-footer">
                              <td colSpan={4} className="wfm-footer-label">
                                Tổng SLA nhóm {previewGroup}:
                              </td>
                              <td className={`wfm-footer-sla ${previewGroup === 'QN' ? 'active' : ''}`}>
                                {steps.reduce((s, r) => s + (r.sla_days_qn || 0), 0)}
                              </td>
                              <td className={`wfm-footer-sla ${previewGroup === 'A' ? 'active' : ''}`}>
                                {steps.reduce((s, r) => s + (r.sla_days_a || 0), 0)}
                              </td>
                              <td className={`wfm-footer-sla ${previewGroup === 'B' ? 'active' : ''}`}>
                                {steps.reduce((s, r) => s + (r.sla_days_b || 0), 0)}
                              </td>
                              <td className={`wfm-footer-sla ${previewGroup === 'C' ? 'active' : ''}`}>
                                {steps.reduce((s, r) => s + (r.sla_days_c || 0), 0)}
                              </td>
                              <td colSpan={2} />
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkflowMasterPage;
