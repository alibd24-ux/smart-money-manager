import React, { useState } from 'react';
import { MonthData, MonthStats } from '../types';
import { BN_MONTHS, clamp, D2B, fmtMoney, fmtPct, offsetMonthKey, PALETTE } from '../constants';

interface ChartsTabProps {
  currentKey: string;
  monthData: MonthData;
  stats: MonthStats;
  allStats: (key: string) => MonthStats;
  userName: string;
  onExportPdf: () => void;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
  currentKey,
  monthData,
  stats,
  allStats,
  onExportPdf,
}) => {
  const [activeDonutIdx, setActiveDonutIdx] = useState<number | null>(null);

  // Month label
  const [yStr, mStr] = currentKey.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const monthTitle = (BN_MONTHS[m - 1] || '') + ' ' + D2B(y);

  // 1. Donut Data
  const catEntries = Object.entries(stats.expByCat)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const donutItems = catEntries.map(([catId, amount], idx) => {
    const cat = monthData.categories.find(c => c.id === catId);
    return {
      id: catId,
      name: cat ? cat.name : 'অন্যান্য',
      amount,
      color: cat ? cat.color : PALETTE[idx % PALETTE.length],
    };
  });
  const donutTotal = donutItems.reduce((acc, i) => acc + i.amount, 0);

  // 2. 6-Month Comparison Data
  const last6Keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    last6Keys.push(offsetMonthKey(currentKey, -i));
  }
  const sixMonthData = last6Keys.map(k => {
    const st = allStats(k);
    const [, mo] = k.split('-');
    const label = (BN_MONTHS[parseInt(mo, 10) - 1] || '').slice(0, 6);
    return {
      key: k,
      label,
      income: st.income,
      expense: st.totalExp,
      savings: st.income - st.totalExp,
    };
  });
  const maxSixVal = Math.max(
    1000,
    ...sixMonthData.flatMap(d => [d.income, d.expense, Math.abs(d.savings)])
  );

  // 3. Budget vs Actual Data
  const bvaCats = monthData.categories.filter(
    c => c.budget > 0 || (stats.expByCat[c.id] || 0) > 0
  );
  const maxBvaVal = Math.max(
    1000,
    ...bvaCats.flatMap(c => [c.budget, stats.expByCat[c.id] || 0])
  );

  // 4. 50/30/20 Analyzer
  const rule5030Rows = [
    {
      name: 'প্রয়োজন',
      icon: 'fa-house',
      color: '#34d399',
      rec: 0.5,
      label: '৫০%',
      act: stats.needExp,
    },
    {
      name: 'আবদার',
      icon: 'fa-champagne-glasses',
      color: '#fbbf24',
      rec: 0.3,
      label: '৩০%',
      act: stats.wantExp,
    },
    {
      name: 'সঞ্চয়',
      icon: 'fa-piggy-bank',
      color: '#38bdf8',
      rec: 0.2,
      label: '২০%',
      act: Math.max(0, stats.net),
    },
  ];

  return (
    <section className="anim-in">
      {/* 1. Category Expense Donut Chart */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--amber)', marginRight: '6px' }} />
            খাতওয়ারী ব্যয়ের ডোনাট চার্ট
          </div>
          <span style={{ fontSize: '11px', color: 'var(--sub)' }}>{monthTitle}</span>
        </div>

        {donutTotal > 0 ? (
          <div>
            {/* SVG Donut */}
            <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 200 200" width="190" height="190" style={{ transform: 'rotate(-90deg)' }}>
                {(() => {
                  let accumPct = 0;
                  return donutItems.map((item, idx) => {
                    const pct = item.amount / donutTotal;
                    const strokeDasharray = `${pct * 2 * Math.PI * 65} ${2 * Math.PI * 65}`;
                    const strokeDashoffset = -accumPct * 2 * Math.PI * 65;
                    accumPct += pct;
                    const isHovered = activeDonutIdx === idx;

                    return (
                      <circle
                        key={item.id}
                        cx="100"
                        cy="100"
                        r="65"
                        fill="none"
                        stroke={item.color}
                        strokeWidth={isHovered ? 26 : 22}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transition: 'stroke-width 0.2s, filter 0.2s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={() => setActiveDonutIdx(idx)}
                        onMouseLeave={() => setActiveDonutIdx(null)}
                      />
                    );
                  });
                })()}
              </svg>

              {/* Center Total / Selected */}
              <div
                style={{
                  position: 'absolute',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                {activeDonutIdx !== null && donutItems[activeDonutIdx] ? (
                  <>
                    <div style={{ fontSize: '11px', color: 'var(--sub)' }}>
                      {donutItems[activeDonutIdx].name}
                    </div>
                    <div className="num" style={{ fontWeight: 'bold', fontSize: '16px', color: donutItems[activeDonutIdx].color }}>
                      {fmtMoney(donutItems[activeDonutIdx].amount)}
                    </div>
                    <div className="num" style={{ fontSize: '11px', color: 'var(--sub)' }}>
                      {fmtPct((donutItems[activeDonutIdx].amount / donutTotal) * 100)}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '11px', color: 'var(--sub)' }}>মোট খরচ</div>
                    <div className="num" style={{ fontWeight: 'bold', fontSize: '16px', color: '#fb7185' }}>
                      {fmtMoney(donutTotal)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Donut Legend */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
                marginTop: '12px',
              }}
            >
              {donutItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveDonutIdx(activeDonutIdx === idx ? null : idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    background: activeDonutIdx === idx ? 'rgba(255,255,255,0.1)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: item.color,
                      display: 'inline-block',
                    }}
                  />
                  <span>{item.name}</span>
                  <span className="num" style={{ color: 'var(--sub)' }}>
                    ({fmtPct((item.amount / donutTotal) * 100)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--sub)', fontSize: '13px' }}>
            এই মাসে খরচের কোনো তথ্য নেই
          </div>
        )}
      </div>

      {/* 2. 6-Month Income / Expense / Savings Comparison */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
          <i className="fa-solid fa-chart-column" style={{ color: 'var(--sky)', marginRight: '6px' }} />
          ৬ মাসের আয়-ব্যয়-সঞ্চয় তুলনা
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', fontSize: '11px', marginBottom: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#34d399' }} />
            আয়
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#fb7185' }} />
            ব্যয়
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#38bdf8' }} />
            নিট সঞ্চয়
          </span>
        </div>

        {/* Bar & Line Chart Container */}
        <div style={{ height: '190px', display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '10px 4px 20px', borderBottom: '1px solid var(--stroke)' }}>
          {sixMonthData.map(d => {
            const incHeight = (d.income / maxSixVal) * 140;
            const expHeight = (d.expense / maxSixVal) * 140;
            const savHeight = (Math.max(0, d.savings) / maxSixVal) * 140;

            return (
              <div
                key={d.key}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                {/* Visual Bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '140px', width: '100%', justifyContent: 'center' }}>
                  {/* Income Bar */}
                  <div
                    title={`আয়: ${fmtMoney(d.income)}`}
                    style={{
                      width: '28%',
                      height: `${Math.max(2, incHeight)}px`,
                      borderRadius: '4px 4px 0 0',
                      background: 'rgba(52,211,153,.85)',
                      transition: 'height 0.5s',
                    }}
                  />
                  {/* Expense Bar */}
                  <div
                    title={`ব্যয়: ${fmtMoney(d.expense)}`}
                    style={{
                      width: '28%',
                      height: `${Math.max(2, expHeight)}px`,
                      borderRadius: '4px 4px 0 0',
                      background: 'rgba(251,113,133,.85)',
                      transition: 'height 0.5s',
                    }}
                  />
                  {/* Savings Indicator */}
                  <div
                    title={`নিট সঞ্চয়: ${fmtMoney(d.savings)}`}
                    style={{
                      width: '20%',
                      height: `${Math.max(2, savHeight)}px`,
                      borderRadius: '4px 4px 0 0',
                      background: '#38bdf8',
                      opacity: 0.9,
                    }}
                  />
                </div>

                {/* Month Label */}
                <span style={{ fontSize: '10px', marginTop: '6px', color: d.key === currentKey ? '#7dd3fc' : 'var(--sub)', fontWeight: d.key === currentKey ? 'bold' : 'normal' }}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Budget vs Actual Comparison */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
          <i className="fa-solid fa-bars-staggered" style={{ color: 'var(--violet)', marginRight: '6px' }} />
          বাজেট বনাম প্রকৃত খরচ
        </div>

        {bvaCats.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {bvaCats.map(c => {
              const spent = stats.expByCat[c.id] || 0;
              const pct = c.budget > 0 ? (spent / c.budget) * 100 : 0;
              const bWidth = (c.budget / maxBvaVal) * 100;
              const sWidth = (spent / maxBvaVal) * 100;

              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 500 }}>{c.name}</span>
                    <span className="num" style={{ color: pct >= 100 ? '#fda4af' : 'var(--sub)' }}>
                      ব্যয়: {fmtMoney(spent)} / বাজেট: {fmtMoney(c.budget)}
                    </span>
                  </div>

                  {/* Dual Bar (Budget in gray, Spent on top) */}
                  <div style={{ position: 'relative', height: '10px', borderRadius: '99px', background: 'rgba(148,163,184,.12)', overflow: 'hidden' }}>
                    {/* Budget bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: `${clamp(bWidth, 0, 100)}%`,
                        background: 'rgba(148,163,184,.3)',
                        borderRadius: '99px',
                      }}
                    />
                    {/* Spent bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: `${clamp(sWidth, 0, 100)}%`,
                        background: pct >= 100 ? '#f43f5e' : pct >= 80 ? '#fbbf24' : c.color,
                        borderRadius: '99px',
                        transition: 'width 0.6s',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--sub)', fontSize: '12px' }}>
            কোনো খাতের বাজেট বা খরচ নির্ধারিত নেই
          </div>
        )}
      </div>

      {/* 4. 50/30/20 Rule Analyzer */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
          <i className="fa-solid fa-scale-balanced" style={{ color: 'var(--emerald)', marginRight: '6px' }} />
          ৫০/৩০/২০ নিয়ম বিশ্লেষক
        </div>
        <div style={{ fontSize: '11px', color: 'var(--sub)', marginBottom: '14px' }}>
          প্রয়োজন ৫০% • আবদার ৩০% • সঞ্চয় ২০%
        </div>

        <div>
          {rule5030Rows.map((r, i) => {
            const recAmt = stats.income * r.rec;
            const maxVal = Math.max(recAmt, r.act, 1);
            const diff = r.act - recAmt;
            const status =
              stats.income <= 0
                ? 'আয় সেট করুন'
                : r.name === 'সঞ্চয়'
                  ? diff >= 0
                    ? 'চমৎকার!'
                    : 'কম আছে'
                  : diff > 0
                    ? 'বেশি খরচ'
                    : 'ঠিক আছে';

            const stColor =
              status === 'ঠিক আছে' || status === 'চমৎকার!'
                ? '#a7f3d0'
                : status === 'আয় সেট করুন'
                  ? 'var(--sub)'
                  : '#fde68a';

            return (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '6px' }}>
                  <span>
                    <i className={`fa-solid ${r.icon}`} style={{ color: r.color, marginRight: '6px' }} />
                    <b>{r.name}</b>{' '}
                    <span className="num" style={{ fontSize: '11px', color: 'var(--sub)' }}>
                      ({r.label})
                    </span>
                  </span>
                  <span className="badge-dot num" style={{ color: stColor }}>
                    {status}
                  </span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    height: '16px',
                    borderRadius: '99px',
                    overflow: 'hidden',
                    background: 'rgba(148,163,184,.12)',
                  }}
                >
                  {/* Target guide */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${clamp((recAmt / maxVal) * 100, 0, 100)}%`,
                      borderRight: '2px dashed rgba(255,255,255,.4)',
                      background: 'rgba(148,163,184,.08)',
                    }}
                  />
                  {/* Actual bar */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `${clamp((r.act / maxVal) * 100, 0, 100)}%`,
                      background: `linear-gradient(90deg, ${r.color}, ${r.color}88)`,
                      borderRadius: '99px',
                      transition: 'width 0.8s',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--sub)', marginTop: '4px' }}>
                  <span>
                    প্রকৃত: <b className="num" style={{ color: r.color }}>{fmtMoney(r.act)}</b>
                  </span>
                  <span>
                    টার্গেট: <span className="num">{fmtMoney(recAmt)}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. PDF Export Card */}
      <div
        className="glass"
        style={{
          padding: '20px',
          marginBottom: '28px',
          textAlign: 'center',
          borderColor: 'rgba(56,189,248,.3)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg,#f43f5e,#f97316)',
            boxShadow: '0 8px 24px rgba(244,63,94,.35)',
          }}
        >
          <i className="fa-solid fa-file-pdf" style={{ fontSize: '24px', color: '#fff' }} />
        </div>

        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>মাসিক রিপোর্ট পিডিএফ</div>
        <div style={{ fontSize: '12px', marginTop: '4px', marginBottom: '16px', color: 'var(--sub)' }}>
          বাজেট বনাম খরচ, সম্পূর্ণ লেনদেন খাতা ও সারসংক্ষেপসহ A4 প্রিন্ট উপযোগী রিপোর্ট
        </div>

        <button
          onClick={onExportPdf}
          className="press glow-btn"
          style={{ width: '100%', padding: '16px', fontWeight: 'bold', fontSize: '15px' }}
        >
          <i className="fa-solid fa-file-arrow-down" style={{ marginRight: '8px' }} />
          পিডিএফ ডাউনলোড ও প্রিন্ট করুন
        </button>
      </div>
    </section>
  );
};
