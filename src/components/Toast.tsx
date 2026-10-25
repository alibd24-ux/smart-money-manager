import React from 'react';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'ok' | 'err' | 'warn';
  icon?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <div id="toasts">
      {toasts.map(t => {
        const ic =
          t.icon ||
          (t.type === 'ok'
            ? 'fa-circle-check'
            : t.type === 'err'
              ? 'fa-circle-xmark'
              : 'fa-triangle-exclamation');

        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <i className={`fa-solid ${ic}`} />
            <span>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
};
