import React, { useState, useEffect, useRef } from 'react';
import { Edit3 } from 'lucide-react';

interface InlineEditCellProps {
  value: string | number | null;
  onSave: (val: string) => void;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  className?: string;
}

const InlineEditCell: React.FC<InlineEditCellProps> = ({ 
  value, 
  onSave, 
  type = 'text', 
  placeholder = '—', 
  className = '' 
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ''));
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { 
    setDraft(String(value ?? '')); 
  }, [value]);
  
  useEffect(() => { 
    if (editing) {
      inputRef.current?.focus();
      if (type !== 'number' && inputRef.current) {
        // Move cursor to end for text
        const len = draft.length;
        if ('setSelectionRange' in inputRef.current) {
            inputRef.current.setSelectionRange(len, len);
        }
      }
    } 
  }, [editing, type, draft.length]);

  const commit = () => {
    setEditing(false);
    if (draft !== String(value ?? '')) {
      onSave(draft);
    }
  };
  
  const cancel = () => { 
    setEditing(false); 
    setDraft(String(value ?? '')); 
  };

  if (editing) {
    const commonProps = {
      ref: inputRef as any,
      value: draft,
      onChange: (e: React.ChangeEvent<any>) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (e: React.KeyboardEvent) => {
        // Stop propagation so we don't accidentally close modals/panels
        e.stopPropagation();
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
      onClick={(e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        setEditing(true); 
      }}
      title="Nhấn để chỉnh sửa"
    >
      {value !== null && value !== '' ? (
        <span className="wfm-cell-value">{String(value)}</span>
      ) : (
        <span className="wfm-cell-placeholder">{placeholder}</span>
      )}
      <Edit3 className="wfm-cell-edit-icon" />
    </span>
  );
};

export default InlineEditCell;
