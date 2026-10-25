import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppState,
  Category,
  FirebaseConfig,
  MonthData,
  MonthStats,
  Transaction,
} from './types';
import {
  currentMonthKey,
  DEFAULT_CATS,
  D2B,
  fmtMoney,
  LS_KEY,
  offsetMonthKey,
  PALETTE,
} from './constants';
import { alarmVibration, haptic, playSiren } from './audio';
import { Header } from './components/Header';
import { MonthBar } from './components/MonthBar';
import { BottomNav, TabKey } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { LedgerTab } from './components/LedgerTab';
import { ChartsTab } from './components/ChartsTab';
import { ProfileTab } from './components/ProfileTab';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { AlarmModal, CrossedItem } from './components/AlarmModal';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { exportMonthlyReportPdf } from './utils/pdfExport';

function getFreshState(): AppState {
  const cur = currentMonthKey();
  return {
    cur,
    months: {
      [cur]: {
        income: 0,
        categories: JSON.parse(JSON.stringify(DEFAULT_CATS)),
        transactions: [],
        flags: {},
      },
    },
    settings: {
      alarmMuted: false,
      userName: '',
      firebaseConfig: null,
      lastBackup: null,
    },
  };
}

export const App: React.FC = () => {
  // Load persistent state
  const [state, setState] = useState<AppState>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const fresh = getFreshState();
        return {
          ...fresh,
          ...parsed,
          settings: { ...fresh.settings, ...(parsed.settings || {}) },
          months: parsed.months || fresh.months,
          cur: parsed.cur || fresh.cur,
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved state', e);
    }
    return getFreshState();
  });

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((msg: string, type: 'ok' | 'err' | 'warn' = 'ok', icon?: string) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, msg, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isFbConfigModalOpen, setIsFbConfigModalOpen] = useState(false);

  // Alarm modal state
  const [alarmCrossed, setAlarmCrossed] = useState<{
    item: CrossedItem;
    count: number;
  } | null>(null);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    text: '',
    onConfirm: () => {},
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('LocalStorage save error', e);
    }
  }, [state]);

  // Online / offline listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('ইন্টারনেট সংযোগ ফিরেছে!', 'ok', 'fa-wifi');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('অফলাইন মোড — ডেটা লোকালে সেভ হচ্ছে', 'warn', 'fa-wifi');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Ensure current month exists in state
  const currentMonthData: MonthData = useMemo(() => {
    const m = state.months[state.cur];
    if (m) {
      // Ensure all categories have color
      m.categories.forEach((c, i) => {
        if (!c.color) c.color = PALETTE[i % PALETTE.length];
      });
      return m;
    }
    const freshCats = JSON.parse(JSON.stringify(DEFAULT_CATS));
    return {
      income: 0,
      categories: freshCats,
      transactions: [],
      flags: {},
    };
  }, [state.months, state.cur]);

  // Ensure current month is initialized in state
  useEffect(() => {
    if (!state.months[state.cur]) {
      setState(prev => ({
        ...prev,
        months: {
          ...prev.months,
          [prev.cur]: {
            income: 0,
            categories: JSON.parse(JSON.stringify(DEFAULT_CATS)),
            transactions: [],
            flags: {},
          },
        },
      }));
    }
  }, [state.cur, state.months]);

  // Calculate statistics for any given month
  const computeStatsForMonth = useCallback(
    (monthKey: string): MonthStats => {
      const md = state.months[monthKey];
      if (!md) {
        return {
          income: 0,
          totalExp: 0,
          expByCat: {},
          net: 0,
          rate: 0,
          totalBudget: 0,
          savingExp: 0,
          needExp: 0,
          wantExp: 0,
        };
      }

      let tIncome = 0;
      let totalExp = 0;
      let savingExp = 0;
      let needExp = 0;
      let wantExp = 0;
      const expByCat: Record<string, number> = {};

      for (const t of md.transactions) {
        if (t.type === 'income') {
          tIncome += t.amount;
        } else {
          totalExp += t.amount;
          expByCat[t.catId] = (expByCat[t.catId] || 0) + t.amount;
          const bucket = md.categories.find(c => c.id === t.catId)?.bucket;
          if (bucket === 'saving') {
            savingExp += t.amount;
          } else if (bucket === 'want') {
            wantExp += t.amount;
          } else {
            needExp += t.amount;
          }
        }
      }

      const totalIncome = (md.income || 0) + tIncome;
      const totalBudget = md.categories.reduce((s, c) => s + (c.budget || 0), 0);
      const net = totalIncome - totalExp;
      const rate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;

      return {
        income: totalIncome,
        totalExp,
        expByCat,
        net,
        rate,
        totalBudget,
        savingExp,
        needExp,
        wantExp,
      };
    },
    [state.months]
  );

  const currentStats = useMemo(
    () => computeStatsForMonth(state.cur),
    [computeStatsForMonth, state.cur]
  );

  // Check alarm function
  const triggerAlarmCheck = useCallback(
    (targetMonthKey: string) => {
      const md = state.months[targetMonthKey];
      if (!md) return;
      const stats = computeStatsForMonth(targetMonthKey);
      const crossed: CrossedItem[] = [];
      const flags = { ...md.flags };

      md.categories.forEach(c => {
        if (c.budget <= 0) return;
        const spent = stats.expByCat[c.id] || 0;
        if (spent > c.budget && !flags[c.id]) {
          flags[c.id] = 1;
          crossed.push({ name: c.name, spent, budget: c.budget });
        }
        if (spent <= c.budget && flags[c.id]) {
          delete flags[c.id];
        }
      });

      if (
        stats.totalBudget > 0 &&
        stats.totalExp > stats.totalBudget &&
        !flags.__total &&
        !crossed.length
      ) {
        flags.__total = 1;
        crossed.push({
          name: 'মোট মাসিক বাজেট',
          spent: stats.totalExp,
          budget: stats.totalBudget,
        });
      }
      if (stats.totalExp <= stats.totalBudget && flags.__total) {
        delete flags.__total;
      }

      if (crossed.length > 0) {
        setState(prev => ({
          ...prev,
          months: {
            ...prev.months,
            [targetMonthKey]: {
              ...md,
              flags,
            },
          },
        }));

        setAlarmCrossed({
          item: crossed[0],
          count: crossed.length,
        });

        playSiren(state.settings.alarmMuted);
        alarmVibration();
      }
    },
    [state.months, state.settings.alarmMuted, computeStatsForMonth]
  );

  // Handlers for month navigation
  const handlePrevMonth = () => {
    haptic(15);
    const prev = offsetMonthKey(state.cur, -1);
    setState(s => ({ ...s, cur: prev }));
  };

  const handleNextMonth = () => {
    haptic(15);
    const next = offsetMonthKey(state.cur, 1);
    setState(s => ({ ...s, cur: next }));
  };

  const handleCopyPrevMonth = () => {
    const prevKey = offsetMonthKey(state.cur, -1);
    setConfirmDialog({
      isOpen: true,
      title: 'বাজেট কপি করবেন?',
      text: `পূর্ববর্তী মাস (${D2B(prevKey)}) এর আয় ও সব খাতের বাজেট বর্তমান মাসে কপি হবে। লেনদেন কপি হবে না।`,
      onConfirm: () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        const prevMonth = state.months[prevKey];
        if (!prevMonth) {
          showToast('পূর্ববর্তী মাসের কোনো তথ্য নেই', 'warn');
          return;
        }
        setState(s => ({
          ...s,
          months: {
            ...s.months,
            [s.cur]: {
              ...currentMonthData,
              income: prevMonth.income,
              categories: JSON.parse(JSON.stringify(prevMonth.categories)),
              flags: {},
            },
          },
        }));
        showToast('পূর্ববর্তী মাসের বাজেট কপি হয়েছে!', 'ok', 'fa-copy');
      },
    });
  };

  // Fixed Income update
  const handleUpdateIncome = (income: number) => {
    setState(s => ({
      ...s,
      months: {
        ...s.months,
        [s.cur]: {
          ...currentMonthData,
          income,
        },
      },
    }));
    showToast(`মাসিক আয় আপডেট হয়েছে: ${fmtMoney(income)}`, 'ok', 'fa-sack-dollar');
  };

  // Category budget update
  const handleUpdateCategoryBudget = (catId: string, newBudget: number) => {
    const safeBudget = Math.max(0, Math.round(newBudget));
    setState(s => ({
      ...s,
      months: {
        ...s.months,
        [s.cur]: {
          ...currentMonthData,
          categories: currentMonthData.categories.map(c =>
            c.id === catId ? { ...c, budget: safeBudget } : c
          ),
        },
      },
    }));
  };

  // Delete Category
  const handleDeleteCategory = (cat: Category) => {
    setConfirmDialog({
      isOpen: true,
      title: 'খাত মুছবেন?',
      text: `"${cat.name}" খাত ও এতে থাকা সব ব্যয়ের এন্টি মুছে যাবে।`,
      onConfirm: () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        setState(s => ({
          ...s,
          months: {
            ...s.months,
            [s.cur]: {
              ...currentMonthData,
              categories: currentMonthData.categories.filter(c => c.id !== cat.id),
              transactions: currentMonthData.transactions.filter(t => t.catId !== cat.id),
            },
          },
        }));
        showToast('খাত মুছে ফেলা হয়েছে', 'warn', 'fa-trash-can');
      },
    });
  };

  // Add custom category
  const handleSaveCustomCategory = (newCat: {
    name: string;
    g: string;
    bucket: 'need' | 'want' | 'saving';
    budget: number;
    icon: string;
  }) => {
    setIsCatModalOpen(false);
    const id = 'c_' + Date.now();
    const color = PALETTE[currentMonthData.categories.length % PALETTE.length];
    const created: Category = {
      id,
      g: newCat.g,
      name: newCat.name,
      icon: newCat.icon,
      budget: newCat.budget,
      bucket: newCat.bucket,
      color,
    };

    setState(s => ({
      ...s,
      months: {
        ...s.months,
        [s.cur]: {
          ...currentMonthData,
          categories: [...currentMonthData.categories, created],
        },
      },
    }));
    showToast(`নতুন খাত যোগ হয়েছে: ${newCat.name}`, 'ok', 'fa-circle-plus');
  };

  // Save Transaction
  const handleSaveTx = (txData: {
    id?: string;
    type: 'income' | 'expense';
    catId: string;
    amount: number;
    note: string;
    date: string;
  }) => {
    setIsTxModalOpen(false);
    setEditingTx(null);
    const dateKey = txData.date.slice(0, 7);
    const targetMonth = state.months[dateKey] || {
      income: 0,
      categories: JSON.parse(JSON.stringify(DEFAULT_CATS)),
      transactions: [],
      flags: {},
    };

    const newTx: Transaction = {
      id: txData.id || 't_' + Date.now() + Math.floor(Math.random() * 99),
      type: txData.type,
      catId: txData.catId,
      amount: txData.amount,
      note: txData.note,
      date: txData.date,
    };

    let updatedTxList = [...targetMonth.transactions];
    if (txData.id) {
      updatedTxList = updatedTxList.filter(t => t.id !== txData.id);
    }
    updatedTxList.push(newTx);

    setState(s => ({
      ...s,
      months: {
        ...s.months,
        [dateKey]: {
          ...targetMonth,
          transactions: updatedTxList,
        },
      },
    }));

    if (dateKey !== state.cur) {
      showToast(`এন্টি ${D2B(dateKey)} মাসের খাতায় সেভ হয়েছে`, 'warn', 'fa-calendar-check');
    } else {
      const isIncome = txData.type === 'income';
      showToast(
        isIncome
          ? `আয় যোগ হয়েছে: ${fmtMoney(txData.amount)}`
          : `ব্যয় যোগ হয়েছে: ${fmtMoney(txData.amount)}`,
        isIncome ? 'ok' : 'warn',
        isIncome ? 'fa-circle-arrow-down' : 'fa-basket-shopping'
      );
      if (!isIncome) {
        setTimeout(() => triggerAlarmCheck(dateKey), 250);
      }
    }
  };

  // Delete transaction
  const handleDeleteTx = (tx: Transaction) => {
    setConfirmDialog({
      isOpen: true,
      title: 'এন্টি মুছবেন?',
      text: `${fmtMoney(tx.amount)} — ${tx.note || (tx.type === 'income' ? 'আয়' : 'ব্যয়')}`,
      onConfirm: () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        setState(s => ({
          ...s,
          months: {
            ...s.months,
            [s.cur]: {
              ...currentMonthData,
              transactions: currentMonthData.transactions.filter(t => t.id !== tx.id),
            },
          },
        }));
        showToast('এন্টি মুছে ফেলা হয়েছে', 'warn', 'fa-trash');
      },
    });
  };

  // Settings handlers
  const handleToggleAlarmMuted = () => {
    const nextMuted = !state.settings.alarmMuted;
    setState(s => ({
      ...s,
      settings: { ...s.settings, alarmMuted: nextMuted },
    }));
    showToast(
      nextMuted ? 'এলার্ম সাউন্ড বন্ধ করা হয়েছে' : 'এলার্ম সাউন্ড চালু হয়েছে',
      nextMuted ? 'warn' : 'ok',
      nextMuted ? 'fa-bell-slash' : 'fa-bell'
    );
  };

  const handleUpdateUserName = (userName: string) => {
    setState(s => ({
      ...s,
      settings: { ...s.settings, userName },
    }));
  };

  const handleTestSound = () => {
    playSiren(false);
    alarmVibration();
  };

  const handleWipeData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'সব ডেটা মুছবেন?',
      text: 'সব মাসের বাজেট, লেনদেন ও সেটিংস স্থায়ীভাবে মুছে যাবে। অ্যাপ প্রথম অবস্থায় রিসেট হবে।',
      onConfirm: () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        localStorage.removeItem(LS_KEY);
        setState(getFreshState());
        showToast('সব ডেটা মুছে ফেলা হয়েছে', 'warn', 'fa-trash');
      },
    });
  };

  const handleImportJson = (data: {
    months: Record<string, MonthData>;
    settings?: Partial<AppState['settings']>;
  }) => {
    setConfirmDialog({
      isOpen: true,
      title: 'ইমপোর্ট নিশ্চিত করুন?',
      text: 'বর্তমান সব ডেটা ব্যাকআপ ফাইলের ডেটা দিয়ে প্রতিস্থাপিত হবে।',
      onConfirm: () => {
        setConfirmDialog(d => ({ ...d, isOpen: false }));
        setState(s => ({
          ...s,
          months: data.months,
          settings: {
            ...s.settings,
            ...(data.settings || {}),
          },
        }));
        showToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!', 'ok', 'fa-file-import');
      },
    });
  };

  // Firebase config
  const handleSaveFirebaseConfig = (cfg: FirebaseConfig) => {
    setIsFbConfigModalOpen(false);
    setState(s => ({
      ...s,
      settings: { ...s.settings, firebaseConfig: cfg },
    }));
    showToast('Firebase কনফিগ সেভ ও সংযুক্ত হয়েছে!', 'ok', 'fa-fire');
  };

  const handleClearFirebaseConfig = () => {
    setIsFbConfigModalOpen(false);
    setState(s => ({
      ...s,
      settings: { ...s.settings, firebaseConfig: null },
    }));
    showToast('Firebase কনফিগ মুছে ফেলা হয়েছে', 'warn', 'fa-trash');
  };

  // PDF Export
  const handleExportPdf = () => {
    exportMonthlyReportPdf(
      state.cur,
      currentMonthData,
      currentStats,
      state.settings.userName
    );
    showToast('পিডিএফ তৈরি ও প্রিন্ট পেজ ওপেন হয়েছে!', 'ok', 'fa-file-pdf');
  };

  return (
    <>
      {/* Ambient background orbs */}
      <div className="bg-fx">
        <div className="orb o1" />
        <div className="orb o2" />
        <div className="orb o3" />
      </div>

      {/* Sticky App Header */}
      <Header
        isOnline={isOnline}
        alarmMuted={state.settings.alarmMuted}
        userName={state.settings.userName}
        onToggleAlarm={handleToggleAlarmMuted}
        onOpenProfile={() => setActiveTab('profile')}
      />

      {/* Sticky Month Switcher */}
      <MonthBar
        currentKey={state.cur}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onCopyPrevMonth={handleCopyPrevMonth}
      />

      {/* Main Content Viewport */}
      <main
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          padding: '12px 16px 20px',
        }}
      >
        {activeTab === 'home' && (
          <HomeTab
            monthData={currentMonthData}
            stats={currentStats}
            onUpdateIncome={handleUpdateIncome}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onDeleteCategory={handleDeleteCategory}
            onOpenAddCategory={() => setIsCatModalOpen(true)}
          />
        )}

        {activeTab === 'ledger' && (
          <LedgerTab
            categories={currentMonthData.categories}
            transactions={currentMonthData.transactions}
            onOpenAddTx={() => {
              setEditingTx(null);
              setIsTxModalOpen(true);
            }}
            onEditTx={tx => {
              setEditingTx(tx);
              setIsTxModalOpen(true);
            }}
            onDeleteTx={handleDeleteTx}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsTab
            currentKey={state.cur}
            monthData={currentMonthData}
            stats={currentStats}
            allStats={computeStatsForMonth}
            userName={state.settings.userName}
            onExportPdf={handleExportPdf}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            isOnline={isOnline}
            settings={state.settings}
            months={state.months}
            onUpdateUserName={handleUpdateUserName}
            onToggleAlarmMuted={handleToggleAlarmMuted}
            onTestSound={handleTestSound}
            onWipeData={handleWipeData}
            onImportJson={handleImportJson}
            onOpenFirebaseConfig={() => setIsFbConfigModalOpen(true)}
            showToast={showToast}
          />
        )}
      </main>

      {/* Floating Action Button (FAB) on Home and Ledger tabs */}
      {(activeTab === 'home' || activeTab === 'ledger') && (
        <button
          className="fab press"
          onClick={() => {
            setEditingTx(null);
            setIsTxModalOpen(true);
          }}
          title="নতুন লেনদেন"
        >
          <i className="fa-solid fa-plus" />
        </button>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        categories={currentMonthData.categories}
        editingTx={editingTx}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTx}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSave={handleSaveCustomCategory}
      />

      <AlarmModal
        isOpen={!!alarmCrossed}
        item={alarmCrossed?.item || null}
        count={alarmCrossed?.count || 1}
        onClose={() => setAlarmCrossed(null)}
        onViewBudget={() => {
          setAlarmCrossed(null);
          setActiveTab('home');
        }}
      />

      <FirebaseConfigModal
        isOpen={isFbConfigModalOpen}
        currentConfig={state.settings.firebaseConfig}
        onClose={() => setIsFbConfigModalOpen(false)}
        onSave={handleSaveFirebaseConfig}
        onClear={handleClearFirebaseConfig}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        text={confirmDialog.text}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} />
    </>
  );
};
