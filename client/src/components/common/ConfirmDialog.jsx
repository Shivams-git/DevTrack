import React from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog() {
  const { confirmDialog, closeConfirm } = useIssues();

  if (!confirmDialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              confirmDialog.isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{confirmDialog.title}</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={closeConfirm}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDialog.onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm transition-colors ${
              confirmDialog.isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
