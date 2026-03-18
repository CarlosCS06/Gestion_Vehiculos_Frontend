import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FluentProvider, webDarkTheme } from '@fluentui/react-components';
import { ProveedorAuth } from './context/ContextoAuth.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FluentProvider theme={webDarkTheme}>
        <ProveedorAuth>
          <App />
        </ProveedorAuth>
      </FluentProvider>
    </BrowserRouter>
  </StrictMode>,
);
