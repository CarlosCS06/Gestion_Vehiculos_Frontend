import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/ContextoAuth.jsx';
import {
  makeStyles,
  tokens,
  TabList,
  Tab,
  Button,
  Avatar,
  Tooltip,
  Badge,
  Text,
} from '@fluentui/react-components';
import {
  VehicleCar24Regular,
  Map24Regular,
  Wrench24Regular,
  Person24Regular,
  Warning24Regular,
  SignOut24Regular,
  ShieldCheckmark24Regular,
} from '@fluentui/react-icons';

const useEstilos = makeStyles({
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    height: '56px',
    boxShadow: tokens.shadow4,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  logoContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginRight: tokens.spacingHorizontalL,
    cursor: 'pointer',
  },
  logoTexto: {
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorBrandForeground1,
    whiteSpace: 'nowrap',
  },
  tabs: {
    flex: 1,
  },
  usuarioContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginLeft: tokens.spacingHorizontalL,
  },
  nombreUsuario: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
  },
  rolBadge: {
    marginLeft: tokens.spacingHorizontalXS,
  },
});

const pestanas = [
  { valor: '/vehiculos', etiqueta: 'Vehículos', icono: <VehicleCar24Regular /> },
  { valor: '/trayectos', etiqueta: 'Trayectos', icono: <Map24Regular /> },
  { valor: '/revisiones', etiqueta: 'Revisiones', icono: <Wrench24Regular /> },
  { valor: '/conductores', etiqueta: 'Conductores', icono: <Person24Regular /> },
  { valor: '/averias', etiqueta: 'Averías', icono: <Warning24Regular /> },
];

const BarraNavegacion = () => {
  const { usuario, logout, esAdmin } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const rutaActual = ubicacion.pathname === '/' ? '/vehiculos' : ubicacion.pathname;

  const manejarCambioTab = (_, datos) => {
    navegar(datos.value);
  };

  const estilos = useEstilos();

  return (
    <nav className={estilos.navbar}>
      <div className={estilos.logoContenedor} onClick={() => navegar('/vehiculos')}>
        <VehicleCar24Regular style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} />
        <span className={estilos.logoTexto}>FlotaGest</span>
      </div>

      <TabList
        className={estilos.tabs}
        selectedValue={rutaActual}
        onTabSelect={manejarCambioTab}
        size="medium"
      >
        {pestanas.map((pestana) => (
          <Tab
            key={pestana.valor}
            value={pestana.valor}
            icon={pestana.icono}
          >
            {pestana.etiqueta}
          </Tab>
        ))}
      </TabList>

      <div className={estilos.usuarioContenedor}>
        {esAdmin && (
          <Tooltip content="Administrador" relationship="label">
            <Badge
              className={estilos.rolBadge}
              appearance="filled"
              color="brand"
              icon={<ShieldCheckmark24Regular />}
            >
              Admin
            </Badge>
          </Tooltip>
        )}
        <Avatar
          name={usuario?.nombre || 'Usuario'}
          size={32}
          color="brand"
        />
        <Text className={estilos.nombreUsuario}>
          {usuario?.nombre}
        </Text>
        <Tooltip content="Cerrar sesión" relationship="label">
          <Button
            icon={<SignOut24Regular />}
            appearance="subtle"
            onClick={logout}
          />
        </Tooltip>
      </div>
    </nav>
  );
};

export default BarraNavegacion;
