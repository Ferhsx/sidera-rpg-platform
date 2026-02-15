import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1c1917',
          color: '#e5e5e5',
          border: '1px solid #444',
        },
      }} />
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);