import React from 'react';

interface HeaderProps {
  isOnline: boolean;
  alarmMuted: boolean;
  userName: string;
  onToggleAlarm: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  alarmMuted,
  userName,
  onToggleAlarm,
  onOpenProfile,
}) => {
  const avatarLetter = (userName.trim() || 'ব')[0].toUpperCase();

  return (
    <header className="appbar">
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 16px',
          height: '64px',
        }}
      >
        {/* Wallet Icon */}
        <div
          className="press"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
            boxShadow: '0 6px 20px rgba(56,189,248,.4)',
          }}
        >
          <i className="fa-solid fa-wallet" style={{ color: '#fff', fontSize: '18px' }} />
        </div>

        {/* Title and subtitle */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            স্মার্ট মানি ম্যানেজার
          </div>
          <div style={{ fontSize: '10px', color: 'var(--sub)' }}>
            বাজেট ট্র্যাকার • অফলাইন-ফার্স্ট
          </div>
        </div>

        {/* Online/Offline status badge */}
        <span
          className="badge-dot press"
          style={{ color: '#7dd3fc', padding: '5px 10px', cursor: 'default' }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              display: 'inline-block',
              background: isOnline ? '#34d399' : '#fbbf24',
              boxShadow: isOnline ? '0 0 8px #34d399' : '0 0 8px #fbbf24',
            }}
          />
          <span style={{ fontSize: '11px' }}>{isOnline ? 'অনলাইন' : 'অফলাইন'}</span>
        </span>

        {/* Alarm Bell Button */}
        <button
          onClick={onToggleAlarm}
          className="press"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--stroke)',
            background: 'rgba(148,163,184,.08)',
            color: alarmMuted ? 'var(--sub)' : 'var(--amber)',
            fontSize: '16px',
          }}
          title={alarmMuted ? 'এলার্ম চালু করুন' : 'এলার্ম বন্ধ করুন'}
        >
          <i className={`fa-solid ${alarmMuted ? 'fa-bell-slash' : 'fa-bell'}`} />
        </button>

        {/* Avatar Profile Button */}
        <button
          onClick={onOpenProfile}
          className="press"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--stroke)',
            background: 'rgba(56,189,248,.15)',
            color: '#7dd3fc',
            fontWeight: 'bold',
            fontSize: '15px',
          }}
          title="প্রোফাইল ও ক্লাউড"
        >
          {userName.trim() ? (
            <span className="num">{avatarLetter}</span>
          ) : (
            <i className="fa-solid fa-user" />
          )}
        </button>
      </div>
    </header>
  );
};
