import { Routes, Route, Navigate } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal.jsx';
import RutaProtegida from './components/layout/RutaProtegida.jsx';
import PaginaLogin from './pages/PaginaLogin.jsx';
import PaginaRegistro from './pages/PaginaRegistro.jsx';
import PaginaVehiculos from './pages/PaginaVehiculos.jsx';
import PaginaTrayectos from './pages/PaginaTrayectos.jsx';
import PaginaRevisiones from './pages/PaginaRevisiones.jsx';
import PaginaConductores from './pages/PaginaConductores.jsx';
import PaginaAverias from './pages/PaginaAverias.jsx';

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<PaginaLogin />} />
      <Route path="/registro" element={<PaginaRegistro />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <RutaProtegida>
            <LayoutPrincipal />
          </RutaProtegida>
        }
      >
        <Route index element={<Navigate to="/vehiculos" replace />} />
        <Route path="vehiculos" element={<PaginaVehiculos />} />
        <Route path="trayectos" element={<PaginaTrayectos />} />
        <Route path="revisiones" element={<PaginaRevisiones />} />
        <Route path="conductores" element={<PaginaConductores />} />
        <Route path="averias" element={<PaginaAverias />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/vehiculos" replace />} />
    </Routes>
  );
}

export default App;
