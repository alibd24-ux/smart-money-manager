import React, { useState } from 'react';
import { Category, MonthData, MonthStats } from '../types';
import { CATEGORY_GROUPS, clamp, fmtMoney, fmtPct } from '../constants';

interface HomeTabProps {
  monthData: MonthData;
  stats: MonthStats;
  onUpdateIncome: (income: number) => void;
  onUpdateCategoryBudget: (catId: string, newBudget: number) => void;
  onDeleteCategory: (cat: Category) => void;
  onOpenAddCategory: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  monthData,
  stats,
  onUpdateIncome,
  onUpdateCategoryBudget,
  onDeleteCategory,
  onOpenAddCategory,
}) => {
  const [fixedIncomeInput, setFixedIncomeInput] = useState<string>(
    monthData.income ? String(monthData.income) : ''
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['housing']));

  // Keep local input in sync if monthData.income changes externally
  React.useEffect(() => {
    setFixedIncomeInput(monthData.income ? String(monthData.income) : '');
  }, [monthData.income]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleIncomeSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Math.max(0, Math.round(Number(fixedIncomeInput) || 0));
    onUpdateIncome(val);
  };

  // Check alert conditions
  const overCats = monthData.categories.filter(
    c => c.budget > 0 && (stats.expByCat[c.id] || 0) > c.budget
  );
  const warnCats = monthData.categories.filter(c => {
    const p = c.budget > 0 ? ((stats.expByCat[c.id] || 0) / c.budget) * 100 : 0;
    return p >= 80 && p < 100;
  });

  const base = Math.max(stats.income, stats.totalExp, 1);
  const expN = Math.max(0, stats.totalExp - stats.savingExp);
  const expWidth = clamp((expN / base) * 100, 0, 100);
  const savWidth = clamp((stats.savingExp / base) * 100, 0, 100);
  const remWidth = clamp((Math.max(0, stats.income - stats.totalExp) / base) * 100, 0, 100);

  const budgetPct = stats.totalBudget > 0 ? (stats.totalExp / stats.totalBudget) * 100 : 0;
  const isBudgetOver = budgetPct >= 100;
  const isBudgetWarn = budgetPct >= 80 && budgetPct < 100;

  return (
    <section className="anim-in">
      {/* Alert strip */}
      {(overCats.length > 0 || warnCats.length > 0) && (
        <div style={{ marginBottom: '16px' }}>
          {overCats.length > 0 ? (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(244,63,94,.14)',
                border: '1px solid rgba(244,63,94,.5)',
                color: '#fecdd3',
              }}
            >
              <i className="fa-solid fa-triangle-exclamation" style={{ color: '#f43f5e', marginRight: '8px' }} />
              অতিরিক্ত খরচের এলার্ম — {overCats.map(c => c.name).join(', ')} খাতে বাজেট অতিক্রম করেছে!
            </div>
          ) : (
            <div
              className="warn-badge"
              style={{
                padding: '12px 14px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: 600,
                background: 'rgba(251,191,36,.12)',
                border: '1px solid rgba(251,191,36,.45)',
                color: '#fde68a',
              }}
            >
              <i className="fa-solid fa-circle-exclamation" style={{ color: 'var(--amber)', marginRight: '8px' }} />
              সতর্কতা: {warnCats.map(c => c.name).join(', ')} খাতে ৮০% বাজেট শেষ!
            </div>
          )}
        </div>
      )}

      {/* Hero Dashboard */}
      <div className="glass" style={{ padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px', color: 'var(--sub)' }}>
          <i className="fa-solid fa-piggy-bank" style={{ color: 'var(--sky)', marginRight: '6px' }} />
          নিট সঞ্চয় (এই মাসে)
        </div>

        <div
          className="num"
          style={{
            fontWeight: 800,
            fontSize: '34px',
            lineHeight: '38px',
            color: 'var(--sky)',
            textShadow: '0 0 24px rgba(56,189,248,.45)',
          }}
        >
          {fmtMoney(stats.net)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', marginBottom: '18px' }}>
          <span
            className="badge-dot"
            style={{
              color: stats.net >= 0 ? '#a7f3d0' : '#fda4af',
              borderColor: stats.net >= 0 ? 'rgba(52,211,153,.4)' : 'rgba(244,63,94,.4)',
              background: stats.net >= 0 ? 'rgba(52,211,153,.1)' : 'rgba(244,63,94,.1)',
            }}
          >
            <i className="fa-solid fa-arrow-trend-up" /> সঞ্চয়ের হার{' '}
            <b className="num">{fmtPct(stats.rate)}</b>
          </span>
        </div>

        {/* Income & Expense Two Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div
            style={{
              borderRadius: '16px',
              padding: '12px',
              background: 'rgba(52,211,153,.09)',
              border: '1px solid rgba(52,211,153,.25)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#86efac' }}>
              <i className="fa-solid fa-circle-arrow-down" style={{ marginRight: '4px' }} />
              মোট আয়
            </div>
            <div className="num" style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--emerald)' }}>
              {fmtMoney(stats.income)}
            </div>
          </div>

          <div
            style={{
              borderRadius: '16px',
              padding: '12px',
              background: 'rgba(251,113,133,.09)',
              border: '1px solid rgba(251,113,133,.25)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#fda4af' }}>
              <i className="fa-solid fa-circle-arrow-up" style={{ marginRight: '4px' }} />
              মোট ব্যয়
            </div>
            <div className="num" style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--rose)' }}>
              {fmtMoney(stats.totalExp)}
            </div>
          </div>
        </div>

        {/* 3-segment bar: expense, saving, remaining */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--sub)', marginBottom: '4px' }}>
            <span>ব্যয়</span>
            <span>সঞ্চয় বরাদ্দ</span>
            <span>অবশিষ্ট</span>
          </div>
          <div className="segbar">
            <div style={{ width: `${expWidth}%`, background: 'linear-gradient(90deg,#fb7185,#f43f5e)' }} />
            <div style={{ width: `${savWidth}%`, background: 'linear-gradient(90deg,#38bdf8,#0ea5e9)' }} />
            <div style={{ width: `${remWidth}%`, background: 'linear-gradient(90deg,#34d399,#10b981)' }} />
          </div>
        </div>
      </div>

      {/* Total Budget Usage Card */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            <i className="fa-solid fa-gauge-high" style={{ color: 'var(--violet)', marginRight: '6px' }} />
            মোট বাজেট ব্যবহার
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isBudgetOver ? '#fda4af' : isBudgetWarn ? '#fde68a' : '#86efac',
            }}
          >
            {isBudgetOver ? 'বাজেট অতিক্রম!' : isBudgetWarn ? 'সতর্কতা: ৮০%+ শেষ!' : 'নিরাপদ'}
          </div>
        </div>

        <div style={{ height: '12px', borderRadius: '99px', overflow: 'hidden', background: 'rgba(148,163,184,.14)' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '99px',
              width: `${clamp(budgetPct, 0, 100)}%`,
              background: isBudgetOver
                ? 'linear-gradient(90deg,#f43f5e,#e11d48)'
                : isBudgetWarn
                  ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                  : 'linear-gradient(90deg,#34d399,#38bdf8)',
              transition: 'width .8s cubic-bezier(.34,1.56,.64,1)',
              boxShadow: '0 0 14px rgba(56,189,248,.5)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: 'var(--sub)' }}>
          <span>
            ব্যয়: <b className="num" style={{ color: 'var(--rose)' }}>{fmtMoney(stats.totalExp)}</b>
          </span>
          <span>
            বাজেট: <b className="num">{fmtMoney(stats.totalBudget)}</b>
          </span>
          <span className="num" style={{ fontWeight: 'bold' }}>
            {fmtPct(budgetPct)}
          </span>
        </div>
      </div>

      {/* Monthly Fixed Income Input */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
          <i className="fa-solid fa-sack-dollar" style={{ color: 'var(--emerald)', marginRight: '6px' }} />
          মাসিক নির্ধারিত আয়
        </div>
        <form onSubmit={handleIncomeSave} style={{ display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontWeight: 'bold',
                color: 'var(--emerald)',
              }}
            >
              ৳
            </span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="০"
              value={fixedIncomeInput}
              onChange={e => setFixedIncomeInput(e.target.value)}
              className="num"
              style={{ paddingLeft: '30px' }}
            />
          </div>
          <button type="submit" className="press glow-btn" style={{ padding: '0 20px', fontWeight: 600, fontSize: '14px' }}>
            <i className="fa-solid fa-check" style={{ marginRight: '4px' }} />
            সেভ
          </button>
        </form>
        <div style={{ fontSize: '11px', marginTop: '8px', color: 'var(--sub)' }}>
          খাতা ট্যাব থেকে অতিরিক্ত আয়ের এন্টিও মোট আয়ে যুক্ত হবে।
        </div>
      </div>

      {/* Category Accordions */}
      <div style={{ marginBottom: '16px' }}>
        {CATEGORY_GROUPS.map(group => {
          const cats = monthData.categories.filter(c => c.g === group.id);
          if (!cats.length) return null;

          const gBudget = cats.reduce((acc, c) => acc + (c.budget || 0), 0);
          const gSpent = cats.reduce((acc, c) => acc + (stats.expByCat[c.id] || 0), 0);
          const gp = gBudget > 0 ? (gSpent / gBudget) * 100 : 0;
          const isOpen = openGroups.has(group.id);

          return (
            <div key={group.id} className="glass" style={{ marginBottom: '12px', overflow: 'hidden' }}>
              <button
                type="button"
                className="press"
                onClick={() => toggleGroup(group.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `${group.color}22`,
                      border: `1px solid ${group.color}55`,
                      color: group.color,
                      fontSize: '18px',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`fa-solid ${group.icon}`} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {group.name}
                    </div>
                    <div className="num" style={{ fontSize: '11px', color: 'var(--sub)' }}>
                      {fmtMoney(gSpent)} / {fmtMoney(gBudget)}
                    </div>
                  </div>

                  <span
                    className="num"
                    style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: gp >= 100 ? '#fda4af' : gp >= 80 ? '#fde68a' : '#86efac',
                      marginRight: '6px',
                    }}
                  >
                    {fmtPct(gp)}
                  </span>

                  <i
                    className="fa-solid fa-chevron-down"
                    style={{
                      fontSize: '14px',
                      color: 'var(--sub)',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  />
                </div>

                {/* Group Progress Bar */}
                <div
                  style={{
                    height: '6px',
                    borderRadius: '99px',
                    marginTop: '12px',
                    overflow: 'hidden',
                    background: 'rgba(148,163,184,.14)',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${clamp(gp, 0, 100)}%`,
                      borderRadius: '99px',
                      background: `linear-gradient(90deg, ${group.color}, ${group.color}aa)`,
                      transition: 'width .8s cubic-bezier(.34,1.56,.64,1)',
                      boxShadow: `0 0 10px ${group.color}`,
                    }}
                  />
                </div>
              </button>

              {/* Accordion Body */}
              {isOpen && (
                <div style={{ padding: '4px 12px 12px' }}>
                  {cats.map(c => {
                    const spent = stats.expByCat[c.id] || 0;
                    const pct = c.budget > 0 ? (spent / c.budget) * 100 : 0;
                    const sliderMax = Math.max(60000, Math.ceil(c.budget / 5000) * 5000 * 1.5);

                    return (
                      <div
                        key={c.id}
                        style={{
                          borderRadius: '16px',
                          padding: '12px',
                          marginBottom: '8px',
                          background: 'rgba(2,6,16,.45)',
                          border: '1px solid var(--stroke)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              background: `${c.color}22`,
                              color: c.color,
                            }}
                          >
                            <i className={`fa-solid ${c.icon}`} style={{ fontSize: '14px' }} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {c.name}
                            </div>
                            <div className="num" style={{ fontSize: '11px', color: 'var(--sub)' }}>
                              <span style={{ color: pct >= 100 ? '#fda4af' : '#e8edf7', fontWeight: 700 }}>
                                {fmtMoney(spent)}
                              </span>{' '}
                              / <span>{fmtMoney(c.budget)}</span>
                            </div>
                          </div>

                          {/* Percentage Badge */}
                          {pct >= 100 ? (
                            <span
                              className="badge-dot"
                              style={{
                                color: '#fda4af',
                                borderColor: 'rgba(244,63,94,.5)',
                                background: 'rgba(244,63,94,.14)',
                              }}
                            >
                              <i className="fa-solid fa-fire" />
                              {fmtPct(pct)}
                            </span>
                          ) : pct >= 80 ? (
                            <span
                              className="badge-dot warn-badge"
                              style={{
                                color: '#fde68a',
                                borderColor: 'rgba(251,191,36,.45)',
                                background: 'rgba(251,191,36,.12)',
                              }}
                            >
                              <i className="fa-solid fa-circle-exclamation" />
                              {fmtPct(pct)}
                            </span>
                          ) : (
                            <span className="badge-dot num" style={{ color: 'var(--sub)' }}>
                              {fmtPct(pct)}
                            </span>
                          )}

                          {/* Delete category button */}
                          <button
                            type="button"
                            onClick={() => onDeleteCategory(c)}
                            className="press"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'rgba(244,63,94,.1)',
                              color: '#fda4af',
                              border: 'none',
                              fontSize: '11px',
                            }}
                            title="খাত মুছুন"
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>

                        {/* Interactive Slider & Numeric Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="range"
                            min="0"
                            max={sliderMax}
                            step="500"
                            value={c.budget}
                            onChange={e => onUpdateCategoryBudget(c.id, Number(e.target.value))}
                            style={
                              {
                                flex: 1,
                                '--c': c.color,
                                '--p': `${(c.budget / sliderMax) * 100}%`,
                              } as React.CSSProperties
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            inputMode="numeric"
                            value={c.budget}
                            onChange={e => onUpdateCategoryBudget(c.id, Math.max(0, Number(e.target.value) || 0))}
                            className="num"
                            style={{
                              width: '96px',
                              padding: '7px 9px',
                              textAlign: 'center',
                              fontSize: '13px',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Category Button */}
      <button
        onClick={onOpenAddCategory}
        className="press glass"
        style={{
          width: '100%',
          padding: '16px',
          marginBottom: '24px',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          borderStyle: 'dashed',
          color: '#c4b5fd',
          cursor: 'pointer',
        }}
      >
        <i className="fa-solid fa-circle-plus" style={{ fontSize: '18px' }} />
        কাস্টম খাত যোগ করুন
      </button>
    </section>
  );
};
