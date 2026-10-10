import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/archivo/wdth.css';
import './index.css';
import './i18n';
import App from './App.jsx';
import { AuthProvider } from './auth/AuthProvider.jsx';
import { ToastProvider } from './components/toast/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
);
