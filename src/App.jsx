import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal.jsx';
import RutaProtegida from './components/layout/RutaProtegida.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaRegistro from './pages/PaginaRegistro.jsx';
import PaginaVehiculos from './pages/PaginaVehiculos.jsx';
import PaginaRevisiones from './pages/PaginaRevisiones.jsx';
import PaginaConductores from './pages/PaginaConductores.jsx';
import PaginaAverias from './pages/PaginaAverias.jsx';
import PaginaViajes from './pages/PaginaViajes.jsx';
import PaginaTrayectos from './pages/PaginaTrayectos.jsx';
import { useAuth } from './context/ContextoAuth.jsx';
import { Spinner } from '@fluentui/react-components';

function App() {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" label="Iniciando..." />
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta raíz: Login o Dashboard */}
      <Route 
        path="/" 
        element={estaAutenticado ? <Navigate to="/vehiculos" replace /> : <PaginaLogin />} 
      />
      
      {/* Compatibilidad y registro */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/registro" element={<PaginaRegistro />} />

      {/* Rutas protegidas */}
      <Route
        element={
          <RutaProtegida>
            <LayoutPrincipal />
          </RutaProtegida>
        }
      >
        <Route path="vehiculos" element={<PaginaVehiculos />} />
        <Route path="viajes" element={<PaginaViajes />} />
        <Route path="revisiones" element={<PaginaRevisiones />} />
        <Route path="conductores" element={<PaginaConductores />} />
        <Route path="averias" element={<PaginaAverias />} />
        <Route path="trayectos" element={<PaginaTrayectos />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
