import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { ToastContainer } from '../common/Toast.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { IssueFormModal } from '../issues/IssueFormModal.jsx';
import { IssueDetailModal } from '../issues/IssueDetailModal.jsx';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlays & Global Modals */}
      <ToastContainer />
      <ConfirmDialog />
      <IssueFormModal />
      <IssueDetailModal />
    </div>
  );
}
