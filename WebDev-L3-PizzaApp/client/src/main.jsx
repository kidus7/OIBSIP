import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update / refresh prompt
const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm('New version available! Click OK to update.')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('SliceMasters app is ready for offline usage.');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
