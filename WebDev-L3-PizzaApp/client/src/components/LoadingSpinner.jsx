import React from 'react';

export default function LoadingSpinner({ fullScreen = true, message = 'Loading SliceMasters...' }) {
  return (
    <div
      className={`${fullScreen ? 'min-h-screen' : 'min-h-64'} w-full bg-slate-900 flex items-center justify-center px-6`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#dc2626,#f97316,#fbbf24,#dc2626)] animate-spin" />
          <div className="absolute inset-1.5 rounded-full bg-slate-900 flex items-center justify-center">
            <span className="text-3xl" aria-hidden="true">🍕</span>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-300">{message}</p>
      </div>
    </div>
  );
}
