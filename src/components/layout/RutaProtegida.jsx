import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/ContextoAuth.jsx';
import { Spinner } from '@fluentui/react-components';

const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { estaAutenticado, esAdmin, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spinner size="large" label="Cargando..." />
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;
