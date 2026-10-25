import React from 'react';
import { fmtMoney } from '../constants';

export interface CrossedItem {
  name: string;
  spent: number;
  budget: number;
}

interface AlarmModalProps {
  isOpen: boolean;
  item: CrossedItem | null;
  count: number;
  onClose: () => void;
  onViewBudget: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  isOpen,
  item,
  count,
  onClose,
  onViewBudget,
}) => {
  if (!isOpen || !item) return null;

  const excess = Math.max(0, item.spent - item.budget);

  return (
    <div className="modal-wrap" style={{ zIndex: 130 }}>
      <div className="modal alert-modal text-center" style={{ marginBottom: 'auto', marginTop: 'auto', borderRadius: '28px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(244,63,94,.18)',
            border: '1px solid rgba(244,63,94,.6)',
          }}
        >
          <i
            className="fa-solid fa-triangle-exclamation"
            style={{ fontSize: '30px', color: '#f43f5e', textShadow: '0 0 18px #f43f5e' }}
          />
        </div>
        <div style={{ fontWeight: 800, fontSize: '18px', color: '#fda4af' }}>
          অতিরিক্ত খরচের এলার্ম!
        </div>
        <div style={{ fontSize: '14px', marginTop: '8px', marginBottom: '4px', color: '#fecdd3' }}>
          আপনার <b>{item.name}</b> খাতের বাজেট অতিক্রম করেছে!
          {count > 1 ? ` (সহ আরও ${count - 1}টি খাত)` : ''}
        </div>
        <div className="num" style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--sub)' }}>
          ব্যয়: {fmtMoney(item.spent)} • বাজেট: {fmtMoney(item.budget)} • অতিরিক্ত: {fmtMoney(excess)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={onClose}
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
            <i className="fa-solid fa-check" style={{ marginRight: '6px' }} />
            ঠিক আছে
          </button>
          <button
            onClick={onViewBudget}
            className="press"
            style={{
              padding: '14px',
              fontWeight: 600,
              borderRadius: '16px',
              fontSize: '14px',
              background: 'rgba(148,163,184,.12)',
              border: '1px solid var(--stroke)',
              color: 'var(--txt)',
            }}
          >
            <i className="fa-solid fa-gauge-high" style={{ marginRight: '6px' }} />
            বাজেট দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};
