import React, { useState } from 'react';
import { Category, Transaction } from '../types';
import { bnDateFormatter, fmtMoney, INCOME_SOURCES } from '../constants';

interface LedgerTabProps {
  categories: Category[];
  transactions: Transaction[];
  onOpenAddTx: () => void;
  onEditTx: (tx: Transaction) => void;
  onDeleteTx: (tx: Transaction) => void;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  categories,
  transactions,
  onOpenAddTx,
  onEditTx,
  onDeleteTx,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCat, setFilterCat] = useState<string>('all');

  // Filter list
  let list = [...transactions];
  if (filterType !== 'all') {
    list = list.filter(t => t.type === filterType);
  }
  if (filterCat === '__in') {
    list = list.filter(t => t.type === 'income');
  } else if (filterCat !== 'all') {
    list = list.filter(t => t.catId === filterCat);
  }

  // Sort descending by date and ID
  list.sort((a, b) => (b.date + String(b.id)).localeCompare(a.date + String(a.id)));

  // Group by date
  const groups: Record<string, Transaction[]> = {};
  list.forEach(t => {
    groups[t.date] = groups[t.date] || [];
    groups[t.date].push(t);
  });
  const dateKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  const getTxMeta = (t: Transaction) => {
    if (t.type === 'income') {
      const src = INCOME_SOURCES.find(x => x.id === t.catId) || INCOME_SOURCES[3];
      return { icon: src.icon, color: '#34d399', name: src.name };
    }
    const cat = categories.find(c => c.id === t.catId);
    return cat
      ? { icon: cat.icon, color: cat.color, name: cat.name }
      : { icon: 'fa-tag', color: '#94a3b8', name: 'অন্যান্য' };
  };

  return (
    <section className="anim-in">
      {/* Add entry button */}
      <button
        onClick={onOpenAddTx}
        className="press glow-btn"
        style={{
          width: '100%',
          padding: '16px',
          marginBottom: '16px',
          fontWeight: 'bold',
          fontSize: '15px',
        }}
      >
        <i className="fa-solid fa-plus" style={{ marginRight: '8px' }} />
        নতুন আয় / ব্যয় এন্টি করুন
      </button>

      {/* Filter bar */}
      <div className="glass" style={{ padding: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <button
            onClick={() => setFilterType('all')}
            className={`chip press ${filterType === 'all' ? 'on' : ''}`}
            style={{ flex: 1 }}
          >
            সব
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`chip press ${filterType === 'income' ? 'on' : ''}`}
            style={{ flex: 1 }}
          >
            <i className="fa-solid fa-arrow-trend-up" style={{ marginRight: '4px' }} />
            আয়
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`chip press ${filterType === 'expense' ? 'on' : ''}`}
            style={{ flex: 1 }}
          >
            <i className="fa-solid fa-arrow-trend-down" style={{ marginRight: '4px' }} />
            ব্যয়
          </button>
        </div>

        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          style={{ fontSize: '13px' }}
        >
          <option value="all">সব খাত</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="__in">আয়ের খাত</option>
        </select>
      </div>

      {/* Transactions list grouped by date */}
      {dateKeys.length > 0 ? (
        dateKeys.map(dk => {
          const dayItems = groups[dk];
          const dt = new Date(dk + 'T00:00:00');
          const dayTot = dayItems.reduce(
            (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
            0
          );

          return (
            <div key={dk} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  marginBottom: '8px',
                  padding: '0 4px',
                  color: 'var(--sub)',
                }}
              >
                <span>
                  <i className="fa-solid fa-calendar-day" style={{ marginRight: '6px' }} />
                  {bnDateFormatter.format(dt)}
                </span>
                <span
                  className="num"
                  style={{
                    fontWeight: 'bold',
                    color: dayTot >= 0 ? '#86efac' : '#fda4af',
                  }}
                >
                  {dayTot >= 0 ? '+' : '−'} {fmtMoney(Math.abs(dayTot)).slice(2)}
                </span>
              </div>

              {dayItems.map(t => {
                const meta = getTxMeta(t);
                const isIncome = t.type === 'income';

                return (
                  <div
                    key={t.id}
                    className="glass press"
                    style={{
                      padding: '12px 14px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: `${meta.color}1f`,
                        border: `1px solid ${meta.color}44`,
                        color: meta.color,
                        fontSize: '16px',
                      }}
                    >
                      <i className={`fa-solid ${meta.icon}`} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '14px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {t.note || meta.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sub)' }}>{meta.name}</div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div
                        className="num"
                        style={{
                          fontWeight: 'bold',
                          fontSize: '15px',
                          color: isIncome ? '#34d399' : '#fb7185',
                        }}
                      >
                        {isIncome ? '+' : '−'} {fmtMoney(t.amount).slice(2)}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onEditTx(t);
                          }}
                          className="press"
                          style={{
                            width: '28px',
                            height: '24px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            background: 'rgba(56,189,248,.12)',
                            color: '#7dd3fc',
                            border: 'none',
                          }}
                          title="সম্পাদনা"
                        >
                          <i className="fa-solid fa-pen" />
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteTx(t);
                          }}
                          className="press"
                          style={{
                            width: '28px',
                            height: '24px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            background: 'rgba(244,63,94,.12)',
                            color: '#fda4af',
                            border: 'none',
                          }}
                          title="মুছুন"
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      ) : (
        <div style={{ textAlign: 'center', padding: '56px 16px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 16px',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(148,163,184,.1)',
              border: '1px dashed var(--stroke)',
            }}
          >
            <i className="fa-solid fa-receipt" style={{ fontSize: '32px', color: 'var(--sub)' }} />
          </div>
          <div style={{ fontWeight: 600 }}>এই মাসে কোনো লেনদেন নেই</div>
          <div style={{ fontSize: '13px', marginTop: '4px', color: 'var(--sub)' }}>
            উপরের বোতাম থেকে প্রথম এন্টি যোগ করুন
          </div>
        </div>
      )}

      <div style={{ height: '32px' }} />
    </section>
  );
};
