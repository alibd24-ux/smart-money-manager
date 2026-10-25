import React, { useState, useEffect } from 'react';
import { Category, Transaction } from '../types';
import { CATEGORY_GROUPS, INCOME_SOURCES } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  categories: Category[];
  editingTx: Transaction | null;
  onClose: () => void;
  onSave: (tx: {
    id?: string;
    type: 'income' | 'expense';
    catId: string;
    amount: number;
    note: string;
    date: string;
  }) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  categories,
  editingTx,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<string>('');
  const [catId, setCatId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (editingTx) {
        setType(editingTx.type);
        setAmount(String(editingTx.amount));
        setCatId(editingTx.catId);
        setNote(editingTx.note || '');
        setDate(editingTx.date);
      } else {
        setType('expense');
        setAmount('');
        setNote('');
        const today = new Date().toISOString().slice(0, 10);
        setDate(today);
        setCatId(categories.length > 0 ? categories[0].id : '');
      }
    }
  }, [isOpen, editingTx, categories]);

  // Adjust default catId when switching type
  useEffect(() => {
    if (type === 'income') {
      if (!INCOME_SOURCES.some(s => s.id === catId)) {
        setCatId(INCOME_SOURCES[0].id);
      }
    } else {
      if (!categories.some(c => c.id === catId) && categories.length > 0) {
        setCatId(categories[0].id);
      }
    }
  }, [type, categories, catId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Math.round(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      id: editingTx ? editingTx.id : undefined,
      type,
      catId,
      amount: parsedAmount,
      note: note.trim(),
      date: date || new Date().toISOString().slice(0, 10),
    });
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
          <div style={{ fontWeight: 700, fontSize: '18px' }}>
            {editingTx ? 'এন্টি সম্পাদনা করুন' : 'নতুন লেনদেন'}
          </div>
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
          {/* Type Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '16px',
              padding: '4px',
              borderRadius: '16px',
              background: 'rgba(2,6,16,.5)',
            }}
          >
            <button
              type="button"
              onClick={() => setType('income')}
              className="press"
              style={{
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                background: type === 'income' ? 'rgba(52,211,153,.2)' : 'transparent',
                color: type === 'income' ? '#a7f3d0' : 'var(--sub)',
              }}
            >
              <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '6px' }} />
              আয়
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className="press"
              style={{
                padding: '12px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '14px',
                border: 'none',
                background: type === 'expense' ? 'rgba(251,113,133,.2)' : 'transparent',
                color: type === 'expense' ? '#fecdd3' : 'var(--sub)',
              }}
            >
              <i className="fa-solid fa-arrow-trend-down" style={{ marginRight: '6px' }} />
              ব্যয়
            </button>
          </div>

          {/* Amount input */}
          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            পরিমাণ (৳)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            placeholder="০"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="num"
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '16px',
              marginBottom: '14px',
            }}
            autoFocus
            required
          />

          {/* Category selection */}
          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            খাত
          </label>
          <select
            value={catId}
            onChange={e => setCatId(e.target.value)}
            style={{ marginBottom: '14px' }}
            required
          >
            {type === 'expense' ? (
              CATEGORY_GROUPS.map(g => {
                const groupCats = categories.filter(c => c.g === g.id);
                if (!groupCats.length) return null;
                return (
                  <optgroup key={g.id} label={g.name}>
                    {groupCats.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })
            ) : (
              INCOME_SOURCES.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </select>

          {/* Note input */}
          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            নোট (ঐচ্ছিক)
          </label>
          <input
            type="text"
            placeholder="যেমন: মাসিক বাজার"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ marginBottom: '14px' }}
          />

          {/* Date input */}
          <label style={{ fontSize: '12px', color: 'var(--sub)', display: 'block', marginBottom: '4px' }}>
            তারিখ
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ marginBottom: '20px' }}
            required
          />

          <button
            type="submit"
            className="press glow-btn"
            style={{ width: '100%', padding: '16px', fontWeight: 'bold', fontSize: '16px' }}
          >
            <i className="fa-solid fa-floppy-disk" style={{ marginRight: '8px' }} />
            সেভ করুন
          </button>
        </form>
      </div>
    </div>
  );
};
