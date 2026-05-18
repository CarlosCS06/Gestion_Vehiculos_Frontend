import { useState } from 'react';
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
  VehicleBus24Regular,
  Wrench24Regular,
  Person24Regular,
  Warning24Regular,
  SignOut24Regular,
  ShieldCheckmark24Regular,
  PersonAccounts24Regular,
} from '@fluentui/react-icons';
import MenuPerfilConductor from './MenuPerfilConductor.jsx';

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
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  tabsContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  usuarioContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginLeft: 'auto',
  },
  nombreUsuario: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    whiteSpace: 'nowrap',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  rolBadge: {
    marginLeft: tokens.spacingHorizontalXS,
    '@media (max-width: 768px)': {
      display: 'none',
    },
  },
  bottomNav: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: tokens.colorNeutralBackground1,
      borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom)',
      justifyContent: 'space-around',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
      height: '64px',
    },
  },
  bottomNavButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    border: 'none',
    background: 'transparent',
    color: tokens.colorNeutralForeground2,
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: '8px 4px',
    '&:hover': {
      color: tokens.colorBrandForeground1,
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  bottomNavButtonActive: {
    color: tokens.colorBrandForeground1,
  },
  bottomNavIcon: {
    fontSize: '24px',
    marginBottom: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNavLabel: {
    fontSize: '10px',
    fontWeight: tokens.fontWeightMedium,
  },
  gestionUsuariosBoton: {
    '@media (max-width: 768px)': {
      '& span': {
        display: 'none !important',
      },
      paddingLeft: '8px !important',
      paddingRight: '8px !important',
      minWidth: 'auto !important',
    },
  },
});

const pestanas = [
  { valor: '/vehiculos', etiqueta: 'Vehículos', etiquetaCorta: 'Vehíc.', icono: <VehicleCar24Regular /> },
  { valor: '/viajes', etiqueta: 'Viajes', etiquetaCorta: 'Viajes', icono: <VehicleBus24Regular /> },
  { valor: '/revisiones', etiqueta: 'Revisiones', etiquetaCorta: 'Revis.', icono: <Wrench24Regular /> },
  { valor: '/conductores', etiqueta: 'Conductores', etiquetaCorta: 'Cond.', icono: <Person24Regular /> },
  { valor: '/averias', etiqueta: 'Averías', etiquetaCorta: 'Aver.', icono: <Warning24Regular /> },
];

const BarraNavegacion = () => {
  const { usuario, logout, esAdmin } = useAuth();
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const rutaActual = ubicacion.pathname === '/' ? '/vehiculos' : ubicacion.pathname;

  const manejarCambioTab = (_, datos) => {
    navegar(datos.value);
  };

  const estilos = useEstilos();

  return (
    <>
      <nav className={estilos.navbar}>
        <div className={estilos.logoContenedor} onClick={() => navegar('/vehiculos')}>
          <VehicleCar24Regular style={{ fontSize: '24px', color: tokens.colorBrandForeground1 }} />
          <span className={estilos.logoTexto}>FlotaGest</span>
        </div>

        <div className={estilos.tabsContainer}>
          <TabList
            selectedValue={rutaActual}
            onTabSelect={manejarCambioTab}
            size="medium"
          >
            {pestanas
              .filter(p => esAdmin || p.valor !== '/conductores')
              .map((pestana) => (
                <Tab
                  key={pestana.valor}
                  value={pestana.valor}
                  icon={pestana.icono}
                >
                  {pestana.etiqueta}
                </Tab>
              ))}
          </TabList>
        </div>

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
          {esAdmin && (
            <Tooltip content="Gestión de usuarios" relationship="label">
              <Button
                icon={<PersonAccounts24Regular />}
                appearance="subtle"
                className={estilos.gestionUsuariosBoton}
                onClick={() => navegar('/usuarios')}
              >
                Gestión de usuarios
              </Button>
            </Tooltip>
          )}
          <Avatar
            name={usuario?.nombre || 'Usuario'}
            image={{ src: usuario?.fotoUrl }}
            size={32}
            color="brand"
          />
          <Text className={estilos.nombreUsuario}>
            {usuario?.nombre}
          </Text>

          {!esAdmin && (
            <Tooltip content="Mi Perfil" relationship="label">
              <Button
                icon={<PersonAccounts24Regular />}
                appearance="subtle"
                onClick={() => setPerfilAbierto(true)}
              />
            </Tooltip>
          )}

          <Tooltip content="Cerrar sesión" relationship="label">
            <Button
              icon={<SignOut24Regular />}
              appearance="subtle"
              onClick={logout}
            />
          </Tooltip>
        </div>

        <MenuPerfilConductor 
          abierto={perfilAbierto} 
          alCerrar={() => setPerfilAbierto(false)} 
        />
      </nav>

      {/* Menú de navegación inferior para móviles */}
      <nav className={estilos.bottomNav}>
        {pestanas
          .filter(p => esAdmin || p.valor !== '/conductores')
          .map((pestana) => {
            const activo = rutaActual === pestana.valor;
            return (
              <button
                key={pestana.valor}
                type="button"
                className={`${estilos.bottomNavButton} ${activo ? estilos.bottomNavButtonActive : ''}`}
                onClick={() => navegar(pestana.valor)}
              >
                <div className={estilos.bottomNavIcon}>
                  {pestana.icono}
                </div>
                <span className={estilos.bottomNavLabel}>{pestana.etiquetaCorta}</span>
              </button>
            );
          })}
      </nav>
    </>
  );
};

export default BarraNavegacion;
