import React, { useState, useEffect } from 'react';
import { FirebaseConfig } from '../types';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  currentConfig: FirebaseConfig | null;
  onClose: () => void;
  onSave: (config: FirebaseConfig) => void;
  onClear: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  currentConfig,
  onClose,
  onSave,
  onClear,
}) => {
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (currentConfig) {
        setRawText(JSON.stringify(currentConfig, null, 2));
      } else {
        setRawText('');
      }
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    setError(null);
    const trimmed = rawText.trim();
    if (!trimmed) {
      setError('Config পেস্ট করুন');
      return;
    }

    try {
      let js = trimmed.replace(/^[\s\S]*?firebaseConfig\s*=\s*/i, '').replace(/;?\s*$/, '');
      if (!js.trim().startsWith('{')) js = trimmed;
      const parsed = new Function('return (' + js + ');')() as FirebaseConfig;
      if (!parsed.apiKey || !parsed.projectId) {
        setError('apiKey অথবা projectId পাওয়া যায়নি');
        return;
      }
      onSave(parsed);
    } catch (e: unknown) {
      setError('Config পার্স করা যায়নি: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div
      className="modal-wrap"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '18px' }}>
            <i className="fa-solid fa-fire" style={{ color: '#fbbf24', marginRight: '6px' }} />
            Firebase Config
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

        <div style={{ fontSize: '12px', marginBottom: '12px', color: 'var(--sub)', lineHeight: '1.4' }}>
          Firebase Console → Project Settings থেকে Web App config কপি করে এখানে পেস্ট করুন। JSON অথবা{' '}
          <code style={{ color: '#7dd3fc' }}>const firebaseConfig = &#123;...&#125;</code> — দুটোই চলবে। কনফিগ না দিলেও অ্যাপ সম্পূর্ণ অফলাইনে চলবে।
        </div>

        <textarea
          rows={7}
          value={rawText}
          onChange={e => setRawText(e.target.value)}
          placeholder='{"apiKey":"...","authDomain":"...","projectId":"...","appId":"..."}'
          style={{ fontFamily: 'monospace', fontSize: '12px', width: '100%', marginBottom: '10px' }}
        />

        {error && (
          <div style={{ color: '#fda4af', fontSize: '12px', marginBottom: '10px' }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '4px' }} />
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            onClick={handleSave}
            className="press glow-btn"
            style={{ padding: '14px', fontWeight: 'bold', fontSize: '14px' }}
          >
            <i className="fa-solid fa-cloud" style={{ marginRight: '6px' }} />
            সেভ ও সংযোগ
          </button>
          <button
            onClick={onClear}
            className="press"
            style={{
              padding: '14px',
              fontWeight: 600,
              fontSize: '14px',
              borderRadius: '16px',
              background: 'rgba(244,63,94,.1)',
              border: '1px solid rgba(244,63,94,.35)',
              color: '#fda4af',
            }}
          >
            <i className="fa-solid fa-trash" style={{ marginRight: '6px' }} />
            মুছে দিন
          </button>
        </div>
      </div>
    </div>
  );
};
