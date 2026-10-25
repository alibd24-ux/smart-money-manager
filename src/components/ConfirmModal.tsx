import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  text,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-wrap"
      style={{ zIndex: 140 }}
      onClick={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal text-center" style={{ maxWidth: '420px', borderRadius: '28px', marginBottom: 'auto', marginTop: 'auto' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(251,191,36,.14)',
            border: '1px solid rgba(251,191,36,.4)',
          }}
        >
          <i className="fa-solid fa-circle-question" style={{ fontSize: '24px', color: 'var(--amber)' }} />
        </div>
        <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--sub)' }}>{text}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={onCancel}
            className="press"
            style={{
              padding: '14px',
              fontWeight: 600,
              borderRadius: '16px',
              background: 'rgba(148,163,184,.12)',
              border: '1px solid var(--stroke)',
              color: 'var(--txt)',
            }}
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            className="press"
            style={{
              padding: '14px',
              fontWeight: 700,
              borderRadius: '16px',
              background: 'rgba(244,63,94,.2)',
              border: '1px solid rgba(244,63,94,.5)',
              color: '#fecdd3',
            }}
          >
            হ্যাঁ, নিশ্চিত
          </button>
        </div>
      </div>
    </div>
  );
};
