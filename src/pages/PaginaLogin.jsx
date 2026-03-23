import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Card,
  Title1,
  Title3,
  Input,
  Button,
  Field,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
} from '@fluentui/react-components';
import {
  VehicleCar24Regular,
  LockClosed24Regular,
  Person24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';

const useEstilos = makeStyles({
  contenedor: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
  },
  tarjeta: {
    width: '100%',
    maxWidth: '420px',
    padding: tokens.spacingHorizontalXXL,
  },
  cabecera: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalXXL,
  },
  logoContenedor: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    marginBottom: tokens.spacingVerticalM,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  enlaceRegistro: {
    textAlign: 'center',
    marginTop: tokens.spacingVerticalL,
  },
  enlace: {
    color: tokens.colorBrandForeground1,
    textDecoration: 'none',
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      textDecoration: 'underline',
    },
  },
});

const PaginaLogin = () => {
  const estilos = useEstilos();
  const navegar = useNavigate();
  const { login } = useAuth();

  const [dni, setDni] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarLogin = async (e) => {
    e.preventDefault();
    if (!dni || !contrasena) {
      setError('Introduce tu DNI y contraseña');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await login(dni, contrasena);
      navegar('/vehiculos');
    } catch (err) {
      if (err.message === 'NUEVO_USUARIO_SIN_PASSWORD') {
        setError('¡Bienvenido! Es la primera vez que entras. Por favor, completa tu registro para establecer tu contraseña.');
        // Opcionalmente podemos redirigir automáticamente después de unos segundos
        setTimeout(() => navegar('/registro'), 3000);
      } else {
        setError(err.message);
      }
    }
    setCargando(false);
  };

  return (
    <div className={estilos.contenedor}>
      <Card className={estilos.tarjeta}>
        <div className={estilos.cabecera}>
          <div className={estilos.logoContenedor}>
            <VehicleCar24Regular style={{ fontSize: '32px', color: tokens.colorBrandForeground1 }} />
            <Title1 style={{ color: tokens.colorBrandForeground1 }}>FlotaGest</Title1>
          </div>
          <Title3>Iniciar sesión</Title3>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            Accede con tu DNI y contraseña
          </Text>
        </div>

        {error && (
          <MessageBar intent="error" style={{ marginBottom: '16px' }}>
            <MessageBarBody>
              <MessageBarTitle>Error</MessageBarTitle>
              {error}
            </MessageBarBody>
          </MessageBar>
        )}

        <form onSubmit={manejarLogin} className={estilos.formulario}>
          <Field label="DNI" required>
            <Input
              value={dni}
              onChange={(_, d) => setDni(d.value)}
              placeholder="Tu DNI"
              contentBefore={<Person24Regular />}
              size="large"
            />
          </Field>
          <Field label="Contraseña" required>
            <Input
              type="password"
              value={contrasena}
              onChange={(_, d) => setContrasena(d.value)}
              placeholder="Tu contraseña"
              contentBefore={<LockClosed24Regular />}
              size="large"
            />
          </Field>
          <Button
            appearance="primary"
            type="submit"
            size="large"
            style={{ marginTop: '8px' }}
            disabled={cargando}
          >
            {cargando ? <Spinner size="tiny" /> : 'Entrar'}
          </Button>
        </form>

        <div className={estilos.enlaceRegistro}>
          <Text size={200}>
            ¿Eres conductor y no tienes cuenta?{' '}
            <Link to="/registro" className={estilos.enlace}>
              Regístrate aquí
            </Link>
          </Text>
        </div>

        <div style={{ marginTop: '24px', padding: '12px', backgroundColor: tokens.colorNeutralBackground3, borderRadius: '8px' }}>
          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
            <strong>Credenciales de prueba:</strong><br />
            Admin: DNI <code>00000000Z</code> / Contraseña <code>admin123</code><br />
            Conductor: DNI <code>12345678A</code> / Contraseña <code>carlos123</code>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PaginaLogin;
