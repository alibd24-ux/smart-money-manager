import { MonthData, MonthStats } from '../types';
import { BN_MONTHS, D2B, fmtMoney, fmtPct } from '../constants';

export function exportMonthlyReportPdf(
  monthKey: string,
  monthData: MonthData,
  stats: MonthStats,
  userName: string
): void {
  const [yearStr, monthStr] = monthKey.split('-');
  const y = parseInt(yearStr, 10);
  const mo = parseInt(monthStr, 10);
  const monthName = (BN_MONTHS[mo - 1] || '') + ' ' + D2B(y);
  const actualUserName = userName.trim() || 'গেস্ট ব্যবহারকারী';
  const stamp = new Date().toLocaleString('bn-BD', { dateStyle: 'long', timeStyle: 'short' });

  const catRows = monthData.categories
    .map(c => {
      const spent = stats.expByCat[c.id] || 0;
      const pct = c.budget > 0 ? Math.round((spent / c.budget) * 100) : spent > 0 ? 100 : 0;
      const badgeStyle =
        pct >= 100
          ? 'background:#fee2e2; color:#991b1b;'
          : pct >= 80
            ? 'background:#fef3c7; color:#92400e;'
            : 'background:#d1fae5; color:#065f46;';
      const badgeText = pct >= 100 ? 'অতিক্রম' : pct >= 80 ? 'সতর্কতা' : 'নিরাপদ';

      return `<tr>
        <td style="padding:8px 7px; border-bottom:1px solid #e2e8f0; font-weight:500;">${c.name}</td>
        <td style="padding:8px 7px; border-bottom:1px solid #e2e8f0;">${fmtMoney(c.budget)}</td>
        <td style="padding:8px 7px; border-bottom:1px solid #e2e8f0; font-weight:600;">${fmtMoney(spent)}</td>
        <td style="padding:8px 7px; border-bottom:1px solid #e2e8f0;">${D2B(pct)}%</td>
        <td style="padding:8px 7px; border-bottom:1px solid #e2e8f0;"><span style="display:inline-block; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:600; ${badgeStyle}">${badgeText}</span></td>
      </tr>`;
    })
    .join('');

  const sortedTx = [...monthData.transactions].sort((a, b) => a.date.localeCompare(b.date));
  const txRows = sortedTx.length
    ? sortedTx
        .map(t => {
          const cat = monthData.categories.find(c => c.id === t.catId);
          const catName = cat ? cat.name : t.type === 'income' ? 'আয়' : 'অন্যান্য';
          const isIncome = t.type === 'income';
          return `<tr>
            <td style="padding:7px; border-bottom:1px solid #e2e8f0;">${new Date(t.date + 'T00:00:00').toLocaleDateString('bn-BD')}</td>
            <td style="padding:7px; border-bottom:1px solid #e2e8f0; font-weight:600; color:${isIncome ? '#059669' : '#dc2626'};">${isIncome ? 'আয়' : 'ব্যয়'}</td>
            <td style="padding:7px; border-bottom:1px solid #e2e8f0;">${catName}</td>
            <td style="padding:7px; border-bottom:1px solid #e2e8f0; color:#475569;">${t.note ? t.note.replace(/</g, '&lt;') : '—'}</td>
            <td style="padding:7px; border-bottom:1px solid #e2e8f0; font-weight:700; text-align:right; color:${isIncome ? '#059669' : '#dc2626'};">${isIncome ? '+' : '−'} ${fmtMoney(t.amount)}</td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">এই মাসে কোনো লেনদেন নেই</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>Smart_Money_Report_${monthKey}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    body { font-family: 'Hind Siliguri', sans-serif; background: #fff; color: #0f172a; margin: 0; padding: 24px; font-size: 13px; }
    .head { border-bottom: 3px solid #0ea5e9; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { font-size: 22px; margin: 0 0 4px; color: #0f172a; }
    .sub { font-size: 11px; color: #64748b; }
    .cards { display: flex; gap: 10px; margin: 16px 0; }
    .card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; background: #f8fafc; }
    .card .l { font-size: 10px; color: #64748b; }
    .card .v { font-size: 16px; font-weight: 700; margin-top: 2px; }
    h3 { font-size: 14px; margin: 18px 0 6px; border-left: 4px solid #0ea5e9; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px; }
    th { background: #0f172a; color: #fff; padding: 8px 7px; text-align: left; font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 10px; color: #94a3b8; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px; padding:10px; background:#e0f2fe; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
    <span><b>স্মার্ট মানি ম্যানেজার মাসিক রিপোর্ট (${monthName})</b> — সেভ বা প্রিন্ট করতে পাশের বোতামে চাপুন</span>
    <button onclick="window.print()" style="padding:8px 16px; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">PDF ডাউনলোড / প্রিন্ট</button>
  </div>
  <div class="head">
    <h1>স্মার্ট মানি ম্যানেজার ও বাজেট ট্র্যাকার</h1>
    <div class="sub">মাসিক আর্থিক রিপোর্ট • মাস: <b>${monthName}</b> • ব্যবহারকারী: <b>${actualUserName}</b> • তৈরির সময়: ${stamp}</div>
  </div>
  <div class="cards">
    <div class="card"><div class="l">মোট আয়</div><div class="v" style="color:#059669;">${fmtMoney(stats.income)}</div></div>
    <div class="card"><div class="l">মোট বাজেট</div><div class="v" style="color:#475569;">${fmtMoney(stats.totalBudget)}</div></div>
    <div class="card"><div class="l">প্রকৃত ব্যয়</div><div class="v" style="color:#dc2626;">${fmtMoney(stats.totalExp)}</div></div>
    <div class="card"><div class="l">নিট সঞ্চয়</div><div class="v" style="color:#0284c7;">${fmtMoney(stats.net)}</div></div>
    <div class="card"><div class="l">সঞ্চয়ের হার</div><div class="v" style="color:#7c3aed;">${fmtPct(stats.rate)}</div></div>
  </div>
  <h3>খাতওয়ারী বাজেট বনাম প্রকৃত খরচ</h3>
  <table>
    <thead><tr><th>খাত</th><th>বাজেট</th><th>প্রকৃত খরচ</th><th>ব্যবহার</th><th>স্ট্যাটাস</th></tr></thead>
    <tbody>${catRows}</tbody>
  </table>
  <h3>সম্পূর্ণ লেনদেন খাতা (কালক্রমানুসারে)</h3>
  <table>
    <thead><tr><th>তারিখ</th><th>ধরন</th><th>খাত</th><th>নোট</th><th style="text-align:right;">পরিমাণ</th></tr></thead>
    <tbody>${txRows}</tbody>
  </table>
  <div class="footer">স্মার্ট মানি ম্যানেজার অ্যাপ দিয়ে তৈরি — অফলাইন-ফার্স্ট বাজেট ট্র্যাকার • ${monthName}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.focus();
  } else {
    // If pop-up blocked, fallback to download
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Money_Report_${monthKey}.html`;
    a.click();
  }
}
