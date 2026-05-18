import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FluentProvider } from '@fluentui/react-components';
import { ProveedorAuth } from './context/ContextoAuth.jsx';
import { ProveedorTema, useTema } from './context/ContextoTema.jsx';
import App from './App.jsx';
import './index.css';

// Componente interno que consume el tema del contexto
const AppConTema = () => {
  const { tema } = useTema();
  return (
    <FluentProvider theme={tema}>
      <ProveedorAuth>
        <App />
      </ProveedorAuth>
    </FluentProvider>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorTema>
        <AppConTema />
      </ProveedorTema>
    </BrowserRouter>
  </StrictMode>,
);
