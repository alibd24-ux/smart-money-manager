import React from 'react';
import { BN_MONTHS, D2B } from '../constants';

interface MonthBarProps {
  currentKey: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onCopyPrevMonth: () => void;
}

export const MonthBar: React.FC<MonthBarProps> = ({
  currentKey,
  onPrevMonth,
  onNextMonth,
  onCopyPrevMonth,
}) => {
  const [yearStr, monthStr] = currentKey.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const monthName = (BN_MONTHS[m - 1] || '') + ' ' + D2B(y);

  return (
    <div className="monthbar">
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '8px 16px',
          background: 'rgba(11,15,25,.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--stroke)',
        }}
      >
        <div
          className="glass"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px',
            borderRadius: '18px',
          }}
        >
          {/* Previous Month */}
          <button
            onClick={onPrevMonth}
            className="press"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(56,189,248,.12)',
              color: '#7dd3fc',
              border: 'none',
              fontSize: '14px',
            }}
            title="আগের মাস"
          >
            <i className="fa-solid fa-chevron-left" />
          </button>

          {/* Month Label */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', lineHeight: '20px' }}>
              {monthName}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--sub)', marginTop: '2px' }}>
              মাসিক হিসাব • <span className="num">{D2B(currentKey)}</span>
            </div>
          </div>

          {/* Next Month */}
          <button
            onClick={onNextMonth}
            className="press"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(56,189,248,.12)',
              color: '#7dd3fc',
              border: 'none',
              fontSize: '14px',
            }}
            title="পরের মাস"
          >
            <i className="fa-solid fa-chevron-right" />
          </button>

          {/* Copy from previous month */}
          <button
            onClick={onCopyPrevMonth}
            className="press"
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(167,139,250,.14)',
              color: '#c4b5fd',
              border: '1px solid rgba(167,139,250,.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="পূর্ববর্তী মাসের বাজেট কপি করুন"
          >
            <i className="fa-solid fa-copy" />
            <span>আগের মাস</span>
          </button>
        </div>
      </div>
    </div>
  );
};
