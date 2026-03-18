import { Outlet } from 'react-router-dom';
import BarraNavegacion from './BarraNavegacion.jsx';
import { makeStyles, tokens } from '@fluentui/react-components';

const useEstilos = makeStyles({
  contenedor: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  contenido: {
    flex: 1,
    padding: tokens.spacingHorizontalXXL,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
});

const LayoutPrincipal = () => {
  const estilos = useEstilos();

  return (
    <div className={estilos.contenedor}>
      <BarraNavegacion />
      <main className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutPrincipal;
