import React, { useState } from 'react';
import { BucketType } from '../types';
import { CATEGORY_GROUPS, CC_ICONS } from '../constants';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: {
    name: string;
    g: string;
    bucket: BucketType;
    budget: number;
    icon: string;
  }) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [group, setGroup] = useState(CATEGORY_GROUPS[0].id);
  const [bucket, setBucket] = useState<BucketType>('need');
  const [budget, setBudget] = useState('3000');
  const [selectedIcon, setSelectedIcon] = useState(CC_ICONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const numBudget = Math.max(0, Math.round(Number(budget) || 0));

    onSave({
      name: trimmed,
      g: group,
      bucket,
      budget: numBudget,
      icon: selectedIcon,
    });
    setName('');
  };

  return (
    <div
      className="modal-wrap"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>কাস্টম খাত তৈরি</div>
          <button
            onClick={onClose}
            className="press"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(148,163,184,.1)',
              border: 'none',
              color: 'var(--txt)',
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            খাতের নাম
          </label>
          <input
            type="text"
            placeholder="যেমন: ছাত্রাবাস খরচ"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ marginBottom: '14px' }}
            required
            autoFocus
          />

          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            গ্রুপ
          </label>
          <select
            value={group}
            onChange={e => setGroup(e.target.value)}
            style={{ marginBottom: '14px' }}
          >
            {CATEGORY_GROUPS.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            ৫০/৩০/২০ বাকেট
          </label>
          <select
            value={bucket}
            onChange={e => setBucket(e.target.value as BucketType)}
            style={{ marginBottom: '14px' }}
          >
            <option value="need">প্রয়োজন (৫০%)</option>
            <option value="want">আবদার (৩০%)</option>
            <option value="saving">সঞ্চয় (২০%)</option>
          </select>

          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            মাসিক বাজেট (৳)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="num"
            style={{ marginBottom: '14px' }}
            required
          />

          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '6px' }}>
            আইকন বেছে নিন
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            {CC_ICONS.map(ic => {
              const isSelected = ic === selectedIcon;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setSelectedIcon(ic)}
                  className="press"
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSelected
                      ? '1px solid rgba(56,189,248,.6)'
                      : '1px solid var(--stroke)',
                    background: isSelected
                      ? 'rgba(56,189,248,.18)'
                      : 'rgba(148,163,184,.07)',
                    color: isSelected ? '#7dd3fc' : 'var(--sub)',
                    fontSize: '16px',
                  }}
                >
                  <i className={`fa-solid ${ic}`} />
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            className="press glow-btn"
            style={{ width: '100%', padding: '16px', fontWeight: 'bold' }}
          >
            <i className="fa-solid fa-circle-plus" style={{ marginRight: '8px' }} />
            খাত যোগ করুন
          </button>
        </form>
      </div>
    </div>
  );
};
