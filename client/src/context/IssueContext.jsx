import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const IssueContext = createContext();

export function IssueProvider({ children }) {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Test Mode toggle state
  const [testMode, setTestMode] = useState(() => {
    return localStorage.getItem('devtrack_test_mode') === 'true';
  });

  // Modals & Dialogs
  const [activeModal, setActiveModal] = useState({ type: null, issue: null });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: false,
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check health and DB status on mount
  useEffect(() => {
    api
      .getHealth()
      .then((res) => setHealth(res))
      .catch((err) => {
        setHealth({ status: 'offline', error: err.message });
      });
  }, [refreshIndex]);

  // Fetch issues
  const refreshIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getIssues({ limit: 100 });
      if (res.success) {
        setIssues(res.data);
      }
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const toggleTestMode = useCallback((forcedVal) => {
    setTestMode((prev) => {
      const next = typeof forcedVal === 'boolean' ? forcedVal : !prev;
      localStorage.setItem('devtrack_test_mode', String(next));
      if (next) {
        addToast('Test Mode enabled: displaying sample demo issues.', 'info');
      } else {
        addToast('Test Mode disabled: displaying your personal issues.', 'info');
      }
      return next;
    });
  }, [addToast]);

  useEffect(() => {
    refreshIssues();
  }, [refreshIssues, refreshIndex, user, testMode]);

  const triggerRefresh = useCallback(() => {
    setRefreshIndex((prev) => prev + 1);
  }, []);

  // CRUD Actions
  const handleCreateIssue = async (issueData) => {
    try {
      const res = await api.createIssue(issueData);
      if (res.success) {
        addToast(`Issue ${res.data.key} created successfully!`, 'success');
        triggerRefresh();
        closeModal();
        return res.data;
      }
    } catch (err) {
      addToast(err.message || 'Failed to create issue', 'error');
      throw err;
    }
  };

  const handleUpdateIssue = async (idOrKey, updates) => {
    try {
      const res = await api.updateIssue(idOrKey, updates);
      if (res.success) {
        addToast(`Issue ${res.data.key} updated`, 'success');
        triggerRefresh();
        if (activeModal.type === 'edit') {
          closeModal();
        }
        return res.data;
      }
    } catch (err) {
      addToast(err.message || 'Failed to update issue', 'error');
      throw err;
    }
  };

  const handleStatusChange = async (idOrKey, newStatus) => {
    // Optimistic local update for instantaneous UI responsiveness
    setIssues((prev) =>
      prev.map((item) =>
        item.key === idOrKey || item._id === idOrKey
          ? { ...item, status: newStatus }
          : item
      )
    );

    try {
      const res = await api.updateIssue(idOrKey, { status: newStatus });
      if (res.success) {
        addToast(`Moved ${res.data.key} to ${newStatus}`, 'success');
        triggerRefresh();
      }
    } catch (err) {
      addToast(err.message || 'Failed to change status', 'error');
      refreshIssues(); // Rollback on failure
    }
  };

  const handleDeleteIssue = async (idOrKey) => {
    try {
      const res = await api.deleteIssue(idOrKey);
      if (res.success) {
        addToast(`Issue deleted`, 'info');
        triggerRefresh();
        closeModal();
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete issue', 'error');
      throw err;
    }
  };

  const openCreateModal = () => setActiveModal({ type: 'create', issue: null });
  const openEditModal = (issue) => setActiveModal({ type: 'edit', issue });
  const openDetailModal = (issue) => setActiveModal({ type: 'detail', issue });
  const closeModal = () => setActiveModal({ type: null, issue: null });

  const confirmAction = ({ title, message, onConfirm, isDestructive = false }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await onConfirm();
      },
      isDestructive,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        loading,
        error,
        health,
        searchQuery,
        setSearchQuery,
        refreshIssues,
        triggerRefresh,
        activeModal,
        openCreateModal,
        openEditModal,
        openDetailModal,
        closeModal,
        confirmDialog,
        confirmAction,
        closeConfirm,
        toasts,
        addToast,
        removeToast,
        handleCreateIssue,
        handleUpdateIssue,
        handleStatusChange,
        handleDeleteIssue,
        testMode,
        toggleTestMode,
        setTestMode,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssueProvider');
  }
  return context;
}
