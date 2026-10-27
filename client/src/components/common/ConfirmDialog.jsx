import React from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = useIssues();

  if (!confirmDialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="theme-card text-[var(--theme-text)] rounded-2xl shadow-2xl max-w-md w-full p-6 border theme-border animate-scale-in">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              confirmDialog.isDestructive
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--theme-text)]">{confirmDialog.title}</h3>
        </div>
        <p className="text-sm text-[var(--theme-text-muted)] mb-6 leading-relaxed">
          {confirmDialog.message}
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium theme-surface-alt border theme-border text-[var(--theme-text)] hover:opacity-80 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-md transition-all ${
              confirmDialog.isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                : 'theme-btn-primary'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
