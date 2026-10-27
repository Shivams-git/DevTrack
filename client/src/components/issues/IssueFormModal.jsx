import React, { useState, useEffect } from 'react';
import { useIssues } from '../../context/IssueContext.jsx';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_OPTIONS = ['Backlog', 'Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const TYPE_OPTIONS = ['Task', 'Bug', 'Feature', 'Improvement'];

export function IssueFormModal() {
  const { activeModal, closeModal, handleCreateIssue, handleUpdateIssue } = useIssues();
  const isEdit = activeModal.type === 'edit';
  const isOpen = activeModal.type === 'create' || activeModal.type === 'edit';
  const issue = activeModal.issue;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Task',
    status: 'Backlog',
    priority: 'Medium',
    dueDate: '',
    estimatedHours: '',
    isBlocked: false,
    blockingReason: '',
    labels: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit && issue) {
      setFormData({
        title: issue.title || '',
        description: issue.description || '',
        type: issue.type || 'Task',
        status: issue.status || 'Backlog',
        priority: issue.priority || 'Medium',
        dueDate: issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: issue.estimatedHours !== null && issue.estimatedHours !== undefined ? String(issue.estimatedHours) : '',
        isBlocked: Boolean(issue.isBlocked),
        blockingReason: issue.blockingReason || '',
        labels: Array.isArray(issue.labels) ? issue.labels.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'Task',
        status: 'Backlog',
        priority: 'Medium',
        dueDate: '',
        estimatedHours: '',
        isBlocked: false,
        blockingReason: '',
        labels: '',
      });
    }
    setErrors({});
  }, [isEdit, issue, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    if (formData.estimatedHours !== '') {
      const hours = Number(formData.estimatedHours);
      if (isNaN(hours) || hours < 0) {
        newErrors.estimatedHours = 'Estimated hours must be 0 or greater';
      }
    }

    if (formData.isBlocked && !formData.blockingReason.trim()) {
      newErrors.blockingReason = 'Please provide a reason when flagging as blocked';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        estimatedHours: formData.estimatedHours !== '' ? Number(formData.estimatedHours) : null,
        isBlocked: formData.isBlocked,
        blockingReason: formData.isBlocked ? formData.blockingReason.trim() : '',
        labels: formData.labels
          ? formData.labels
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean)
          : [],
      };

      if (isEdit) {
        await handleUpdateIssue(issue.key || issue._id, payload);
      } else {
        await handleCreateIssue(payload);
      }
    } catch (err) {
      // Error is notified via toast in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit ? `Edit Issue: ${issue?.key}` : 'Create New Issue'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? 'Update fields and urgency will recalculate.' : 'Add a task, bug, or feature to your project backlog.'}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Issue Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix database connection pool timeout"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.title ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-300 focus:border-indigo-500'
              } focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Grid row: Type, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
              >
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-indigo-500"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Hours (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                placeholder="e.g., 4"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
              {errors.estimatedHours && (
                <p className="mt-1 text-xs text-rose-500">{errors.estimatedHours}</p>
              )}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Labels / Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
              placeholder="Backend, API, Security"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Blocked Flag */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isBlocked}
                onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs font-semibold text-slate-800">
                Flag this issue as blocked
              </span>
            </label>

            {formData.isBlocked && (
              <div className="pt-1">
                <input
                  type="text"
                  value={formData.blockingReason}
                  onChange={(e) => setFormData({ ...formData, blockingReason: e.target.value })}
                  placeholder="Reason for blockage (e.g. Waiting on Redis credentials)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-rose-50/50 focus:bg-white focus:outline-none focus:border-rose-500"
                />
                {errors.blockingReason && (
                  <p className="mt-1 text-xs text-rose-500">{errors.blockingReason}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide technical context, steps to reproduce, or acceptance criteria..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/20 disabled:opacity-50 transition-all"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
