'use client';

import { useState, useEffect } from 'react';

export default function MobileSupport() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    // Adicionar classes CSS mobile aos elementos existentes
    const sidebar = document.querySelector('[class*="sidebar"]');
    const chatArea = document.querySelector('[class*="chatArea"]');
    
    if (sidebar) {
      sidebar.classList.add('sidebar');
      if (sidebarOpen) {
        sidebar.classList.add('mobile-open');
      } else {
        sidebar.classList.remove('mobile-open');
      }
    }
    
    if (chatArea) {
      chatArea.classList.add('chatArea');
    }
  }, [isMobile, sidebarOpen]);

  if (!isMobile) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-toggle-button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className={`mobile-overlay ${sidebarOpen ? 'show' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}