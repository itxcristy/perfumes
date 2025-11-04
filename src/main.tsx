import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';

// Initialize service worker for PWA and enhanced caching
import './utils/serviceWorker.ts';

// Initialize analytics and error tracking
import { initGA } from './services/analytics';
import { initSentry, ErrorBoundary } from './services/errorTracking';

// Initialize Sentry (error tracking)
initSentry();

// Initialize Google Analytics
initGA();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      showDialog={false}
    >
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
);
