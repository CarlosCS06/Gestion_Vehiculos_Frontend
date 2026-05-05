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
  Navigation24Regular,
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
  { valor: '/viajes', etiqueta: 'Viajes', icono: <VehicleBus24Regular /> },
  { valor: '/revisiones', etiqueta: 'Revisiones', icono: <Wrench24Regular /> },
  { valor: '/conductores', etiqueta: 'Conductores', icono: <Person24Regular /> },
  { valor: '/averias', etiqueta: 'Averías', icono: <Warning24Regular /> },
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
          image={{ src: usuario?.fotoUrl }}
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

        {!esAdmin && (
          <Tooltip content="Mi Perfil" relationship="label">
            <Button
              icon={<Navigation24Regular />}
              appearance="subtle"
              onClick={() => setPerfilAbierto(true)}
            />
          </Tooltip>
        )}
      </div>

      <MenuPerfilConductor 
        abierto={perfilAbierto} 
        alCerrar={() => setPerfilAbierto(false)} 
      />
    </nav>
  );
};

export default BarraNavegacion;
