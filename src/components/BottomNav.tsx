import React from 'react';

export type TabKey = 'home' | 'ledger' | 'charts' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="bnav">
      <div
        style={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <button
          className={`nbtn press ${activeTab === 'home' ? 'on' : ''}`}
          onClick={() => onTabChange('home')}
        >
          <i className="fa-solid fa-house-chimney-window" />
          <span>হোম ও বাজেট</span>
          <span className="ndot" />
        </button>

        <button
          className={`nbtn press ${activeTab === 'ledger' ? 'on' : ''}`}
          onClick={() => onTabChange('ledger')}
        >
          <i className="fa-solid fa-book-open" />
          <span>আয়-ব্যয়ের খাতা</span>
          <span className="ndot" />
        </button>

        <button
          className={`nbtn press ${activeTab === 'charts' ? 'on' : ''}`}
          onClick={() => onTabChange('charts')}
        >
          <i className="fa-solid fa-chart-pie" />
          <span>চার্ট ও রিপোর্ট</span>
          <span className="ndot" />
        </button>

        <button
          className={`nbtn press ${activeTab === 'profile' ? 'on' : ''}`}
          onClick={() => onTabChange('profile')}
        >
          <i className="fa-solid fa-cloud" />
          <span>ক্লাউড ও প্রোফাইল</span>
          <span className="ndot" />
        </button>
      </div>
    </nav>
  );
};
