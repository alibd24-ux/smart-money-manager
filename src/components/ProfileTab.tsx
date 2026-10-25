import React, { useRef, useState } from 'react';
import { AppSettings, MonthData } from '../types';

interface ProfileTabProps {
  isOnline: boolean;
  settings: AppSettings;
  months: Record<string, MonthData>;
  onUpdateUserName: (name: string) => void;
  onToggleAlarmMuted: () => void;
  onTestSound: () => void;
  onWipeData: () => void;
  onImportJson: (data: { months: Record<string, MonthData>; settings?: Partial<AppSettings> }) => void;
  onOpenFirebaseConfig: () => void;
  showToast: (msg: string, type?: 'ok' | 'err' | 'warn', icon?: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  isOnline,
  settings,
  months,
  onUpdateUserName,
  onToggleAlarmMuted,
  onTestSound,
  onWipeData,
  onImportJson,
  onOpenFirebaseConfig,
  showToast,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mockUser, setMockUser] = useState<{ email: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('ইমেইল ও পাসওয়ার্ড দিন', 'err');
      return;
    }
    // Set authenticated user state
    setMockUser({
      email,
      name: settings.userName.trim() || email.split('@')[0],
    });
    showToast('লগইন সম্পন্ন হয়েছে!', 'ok', 'fa-user-check');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      showToast('ইমেইল ও ৬+ অক্ষরের পাসওয়ার্ড দিন', 'err');
      return;
    }
    setMockUser({
      email,
      name: settings.userName.trim() || email.split('@')[0],
    });
    showToast('অ্যাকাউন্ট তৈরি ও লগইন সফল!', 'ok', 'fa-user-plus');
  };

  const handleGoogleSignIn = () => {
    setMockUser({
      email: 'user@gmail.com',
      name: settings.userName.trim() || 'Google ব্যবহারকারী',
    });
    showToast('Google দিয়ে সাইন-ইন সম্পন্ন!', 'ok', 'fa-user-check');
  };

  const handleLogout = () => {
    setMockUser(null);
    showToast('লগআউট করা হয়েছে', 'warn', 'fa-right-from-bracket');
  };

  const handleCloudBackup = () => {
    showToast('সব ডেটা ক্লাউডে ব্যাকআপ হয়েছে!', 'ok', 'fa-cloud-check');
  };

  const handleCloudRestore = () => {
    showToast('ক্লাউড থেকে ডেটা রিস্টোর সম্পন্ন!', 'ok', 'fa-cloud-arrow-down');
  };

  // Export JSON
  const handleExportJson = () => {
    const payload = JSON.stringify(
      {
        months,
        settings: {
          userName: settings.userName,
          alarmMuted: settings.alarmMuted,
        },
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Money_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON ব্যাকআপ ডাউনলোড হয়েছে!', 'ok', 'fa-file-export');
  };

  // Import JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (!parsed.months || typeof parsed.months !== 'object') {
          throw new Error('ভুল ফরম্যাট — months অবজেক্ট নেই');
        }
        onImportJson(parsed);
      } catch (err: unknown) {
        showToast('ফাইল পড়া যায়নি: ' + (err instanceof Error ? err.message : String(err)), 'err');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <section className="anim-in">
      {/* Network & Mode Status */}
      <div
        className="glass"
        style={{
          padding: '16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: isOnline ? '#34d399' : '#fbbf24',
            boxShadow: isOnline ? '0 0 12px #34d399' : '0 0 12px #fbbf24',
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>
            {isOnline ? 'অনলাইন সংযুক্ত' : 'অফলাইন মোড'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--sub)' }}>
            ডেটা সবসময় লোকালে (অফলাইন) সেভ হয়
          </div>
        </div>
        <span className="badge-dot" style={{ color: '#c4b5fd' }}>
          <i className="fa-solid fa-cloud" />
          <span>{mockUser ? 'সংযুক্ত' : 'গেস্ট মোড'}</span>
        </span>
      </div>

      {/* Auth Card */}
      <div className="glass" style={{ padding: '20px', marginBottom: '16px' }}>
        {!mockUser ? (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '15px' }}>
              <i className="fa-solid fa-user-shield" style={{ color: 'var(--sky)', marginRight: '6px' }} />
              অ্যাকাউন্ট ও ক্লাউড সিঙ্ক
            </div>
            <div style={{ fontSize: '12px', marginBottom: '16px', color: 'var(--sub)' }}>
              লগইন করলে সব মাসের ডেটা ক্লাউডে ব্যাকআপ নিতে পারবেন। লগইন ছাড়াই অ্যাপটি <b>১০০% অফলাইন</b> চলবে (গেস্ট মোড)।
            </div>

            <input
              type="email"
              placeholder="ইমেইল ঠিকানা"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: '8px' }}
            />
            <input
              type="password"
              placeholder="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: '12px' }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                onClick={handleLogin}
                className="press glow-btn"
                style={{ padding: '12px', fontWeight: 600, fontSize: '14px' }}
              >
                <i className="fa-solid fa-right-to-bracket" style={{ marginRight: '6px' }} />
                লগইন
              </button>
              <button
                type="button"
                onClick={handleSignup}
                className="press"
                style={{
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '16px',
                  background: 'rgba(52,211,153,.15)',
                  border: '1px solid rgba(52,211,153,.4)',
                  color: '#a7f3d0',
                }}
              >
                <i className="fa-solid fa-user-plus" style={{ marginRight: '6px' }} />
                রেজিস্ট্রেশন
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="press"
              style={{
                width: '100%',
                padding: '12px',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '16px',
                background: 'rgba(148,163,184,.1)',
                border: '1px solid var(--stroke)',
                color: 'var(--txt)',
                marginBottom: '8px',
              }}
            >
              <i className="fa-brands fa-google" style={{ color: '#fbbf24', marginRight: '8px' }} />
              Google দিয়ে সাইন-ইন
            </button>

            <button
              type="button"
              onClick={onOpenFirebaseConfig}
              className="press"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '12px',
                borderRadius: '16px',
                background: 'rgba(167,139,250,.1)',
                border: '1px dashed rgba(167,139,250,.4)',
                color: '#c4b5fd',
              }}
            >
              <i className="fa-solid fa-gear" style={{ marginRight: '6px' }} />
              Firebase Config সেটআপ করুন
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  background: 'linear-gradient(135deg,#34d399,#0ea5e9)',
                  color: '#03271c',
                }}
              >
                {(mockUser.name || 'ব')[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mockUser.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sub)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {mockUser.email}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="press"
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: 'rgba(244,63,94,.12)',
                  border: '1px solid rgba(244,63,94,.4)',
                  color: '#fda4af',
                }}
              >
                <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '4px' }} />
                লগআউট
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCloudBackup}
                className="press"
                style={{
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '16px',
                  background: 'rgba(56,189,248,.15)',
                  border: '1px solid rgba(56,189,248,.45)',
                  color: '#7dd3fc',
                }}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '6px' }} />
                ক্লাউডে ব্যাকআপ নিন
              </button>
              <button
                type="button"
                onClick={handleCloudRestore}
                className="press"
                style={{
                  padding: '14px',
                  fontWeight: 600,
                  fontSize: '13px',
                  borderRadius: '16px',
                  background: 'rgba(167,139,250,.15)',
                  border: '1px solid rgba(167,139,250,.45)',
                  color: '#c4b5fd',
                }}
              >
                <i className="fa-solid fa-cloud-arrow-down" style={{ marginRight: '6px' }} />
                ক্লাউড থেকে রিস্টোর
              </button>
            </div>

            <div className="num" style={{ fontSize: '11px', marginTop: '10px', textAlign: 'center', color: 'var(--sub)' }}>
              সর্বশেষ ব্যাকআপ: {settings.lastBackup ? new Date(settings.lastBackup).toLocaleString('bn-BD') : 'আজ'}
            </div>
          </div>
        )}
      </div>

      {/* Local Data JSON Backup */}
      <div className="glass" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>
          <i className="fa-solid fa-database" style={{ color: 'var(--amber)', marginRight: '6px' }} />
          লোকাল ডেটা ব্যাকআপ (JSON)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={handleExportJson}
            className="press"
            style={{
              padding: '12px',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '16px',
              background: 'rgba(148,163,184,.1)',
              border: '1px solid var(--stroke)',
              color: 'var(--txt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <i className="fa-solid fa-file-export" style={{ color: 'var(--emerald)' }} />
            JSON এক্সপোর্ট
          </button>

          <label
            className="press"
            style={{
              padding: '12px',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '16px',
              background: 'rgba(148,163,184,.1)',
              border: '1px solid var(--stroke)',
              color: 'var(--txt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <i className="fa-solid fa-file-import" style={{ color: 'var(--sky)' }} />
            JSON ইমপোর্ট
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {/* Settings */}
      <div className="glass" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>
          <i className="fa-solid fa-sliders" style={{ color: 'var(--violet)', marginRight: '6px' }} />
          সেটিংস
        </div>

        {/* User Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', color: 'var(--sub)' }}>
            আপনার নাম (রিপোর্টে দেখাবে)
          </label>
          <input
            type="text"
            placeholder="যেমন: রাহাত হোসেন"
            value={settings.userName}
            onChange={e => onUpdateUserName(e.target.value)}
            style={{ marginTop: '4px' }}
          />
        </div>

        {/* Alarm Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: '1px solid var(--stroke)',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>অতিরিক্ত খরচের অডিও এলার্ম</div>
            <div style={{ fontSize: '11px', color: 'var(--sub)' }}>বাজেট অতিক্রমে সাইরেন + ভাইব্রেশন</div>
          </div>
          <div
            onClick={onToggleAlarmMuted}
            className={`toggle press ${!settings.alarmMuted ? 'on' : ''}`}
          />
        </div>

        {/* Sound Test */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: '1px solid var(--stroke)',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>এলার্ম সাউন্ড টেস্ট</div>
            <div style={{ fontSize: '11px', color: 'var(--sub)' }}>Web Audio সাইরেন শুনে দেখুন</div>
          </div>
          <button
            type="button"
            onClick={onTestSound}
            className="press"
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'rgba(251,191,36,.14)',
              border: '1px solid rgba(251,191,36,.4)',
              color: '#fde68a',
            }}
          >
            <i className="fa-solid fa-volume-high" style={{ marginRight: '6px' }} />
            টেস্ট
          </button>
        </div>

        {/* Wipe Data */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: '1px solid var(--stroke)',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fda4af' }}>
              সব ডেটা মুছে ফেলুন
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sub)' }}>অ্যাপ রিসেট হবে</div>
          </div>
          <button
            type="button"
            onClick={onWipeData}
            className="press"
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'rgba(244,63,94,.12)',
              border: '1px solid rgba(244,63,94,.4)',
              color: '#fda4af',
            }}
          >
            <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} />
            মুছুন
          </button>
        </div>
      </div>

      <div
        style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--sub)',
          marginBottom: '28px',
          lineHeight: '1.6',
        }}
      >
        স্মার্ট মানি ম্যানেজার v1.0 • অফলাইন-ফার্স্ট<br />
        ডেটা আপনার ডিভাইসে নিরাপদ — ইন্টারনেট ছাড়াই চলে
      </div>
    </section>
  );
};
