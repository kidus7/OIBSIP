import React, { useEffect, useState } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Check if user previously dismissed
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_installed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        zIndex: 9999,
        background: '#0f172a',
        color: '#f8fafc',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
        border: '1px solid #1e293b',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '480px',
        margin: '0 auto'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#f97316', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
            🍕
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>SliceMasters App</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
              Install SliceMasters App for faster ordering & live delivery updates!
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '4px',
            lineHeight: 1
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: '1px solid #334155',
            color: '#cbd5e1',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Dismiss
        </button>
        <button
          onClick={handleInstallClick}
          style={{
            background: '#f97316',
            border: 'none',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(249, 115, 22, 0.3)'
          }}
        >
          Install App
        </button>
      </div>
    </div>
  );
}
