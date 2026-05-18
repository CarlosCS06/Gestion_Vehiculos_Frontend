import { createContext, useContext, useState, useEffect } from 'react';
import { webDarkTheme, webLightTheme } from '@fluentui/react-components';

const ContextoTema = createContext();

export const useTema = () => {
  const contexto = useContext(ContextoTema);
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de un ProveedorTema');
  }
  return contexto;
};

export const ProveedorTema = ({ children }) => {
  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem('flotaGestTemaOscuro');
    return guardado !== null ? JSON.parse(guardado) : true; // oscuro por defecto
  });

  useEffect(() => {
    localStorage.setItem('flotaGestTemaOscuro', JSON.stringify(modoOscuro));
    // Sincronizar el body para estilos globales CSS
    document.body.setAttribute('data-theme', modoOscuro ? 'dark' : 'light');
  }, [modoOscuro]);

  const alternarTema = () => setModoOscuro(prev => !prev);
  const tema = modoOscuro ? webDarkTheme : webLightTheme;

  return (
    <ContextoTema.Provider value={{ modoOscuro, alternarTema, tema }}>
      {children}
    </ContextoTema.Provider>
  );
};
