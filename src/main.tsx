import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppRouter } from './app/AppRouter';
import { AuthProvider } from './auth';
import { SheetProvider } from './sheet';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SheetProvider>
        <AppRouter />
      </SheetProvider>
    </AuthProvider>
  </StrictMode>,
);
