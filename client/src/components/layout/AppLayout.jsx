import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { ToastContainer } from '../common/Toast.jsx';
import { ConfirmDialog } from '../common/ConfirmDialog.jsx';
import { IssueFormModal } from '../issues/IssueFormModal.jsx';
import { IssueDetailModal } from '../issues/IssueDetailModal.jsx';

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(() => {
    return localStorage.getItem('devtrack_sidebar_visible') !== 'false';
  });

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem('devtrack_sidebar_width');
    return saved ? Math.max(190, Math.min(420, Number(saved))) : 256;
  });

  const toggleDesktopSidebar = () => {
    setDesktopSidebarVisible((prev) => {
      const next = !prev;
      localStorage.setItem('devtrack_sidebar_visible', String(next));
      return next;
    });
  };

  const handleWidthChange = (newWidth) => {
    const clamped = Math.max(190, Math.min(420, newWidth));
    setSidebarWidth(clamped);
    localStorage.setItem('devtrack_sidebar_width', String(clamped));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans transition-colors duration-200">
      {/* Sidebar with adjustable width, scroll, and hide/unhide */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isVisible={desktopSidebarVisible}
        onToggleVisibility={toggleDesktopSidebar}
        width={sidebarWidth}
        onWidthChange={handleWidthChange}
      />

      {/* Main Content Area dynamically adjusting padding for desktop sidebar */}
      <div
        style={{
          paddingLeft: desktopSidebarVisible ? `${sidebarWidth}px` : '0px',
        }}
        className="flex-1 flex flex-col min-w-0 transition-all duration-200"
      >
        <Navbar
          onMenuClick={() => setMobileSidebarOpen(true)}
          isSidebarVisible={desktopSidebarVisible}
          onToggleSidebar={toggleDesktopSidebar}
        />

        <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl w-full mx-auto">
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
