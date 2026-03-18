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
  Badge,
} from '@fluentui/react-components';
import {
  VehicleCar24Regular,
  LockClosed24Regular,
  Person24Regular,
  Mail24Regular,
  Checkmark24Regular,
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
    maxWidth: '460px',
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
  conductorInfo: {
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  enlaceLogin: {
    textAlign: 'center',
    marginTop: tokens.spacingVerticalL,
  },
});

const PaginaRegistro = () => {
  const estilos = useEstilos();
  const navegar = useNavigate();
  const { verificarDni, registro } = useAuth();

  const [paso, setPaso] = useState(1); // 1 = introducir DNI, 2 = crear contraseña
  const [dni, setDni] = useState('');
  const [datosConductor, setDatosConductor] = useState(null);
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const manejarVerificarDni = async (e) => {
    e.preventDefault();
    if (!dni) {
      setError('Introduce tu DNI');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const datos = await verificarDni(dni);
      setDatosConductor(datos);
      setPaso(2);
    } catch (err) {
      setError(err.message);
    }
    setCargando(false);
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    if (!contrasena || !email) {
      setError('Completa todos los campos');
      return;
    }
    if (contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    setError('');
    try {
      await registro(dni, contrasena, email);
      navegar('/vehiculos');
    } catch (err) {
      setError(err.message);
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
          <Title3>Registro de conductor</Title3>
          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
            {paso === 1
              ? 'Introduce tu DNI para verificar tu identidad'
              : 'Crea tu contraseña para completar el registro'
            }
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

        {paso === 1 ? (
          <form onSubmit={manejarVerificarDni} className={estilos.formulario}>
            <Field label="DNI" required>
              <Input
                value={dni}
                onChange={(_, d) => setDni(d.value)}
                placeholder="12345678A"
                contentBefore={<Person24Regular />}
                size="large"
              />
            </Field>
            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
              Tu DNI debe haber sido dado de alta previamente por un administrador.
            </Text>
            <Button
              appearance="primary"
              type="submit"
              size="large"
              disabled={cargando}
            >
              {cargando ? <Spinner size="tiny" /> : 'Verificar DNI'}
            </Button>
          </form>
        ) : (
          <form onSubmit={manejarRegistro} className={estilos.formulario}>
            {/* Mostrar datos del conductor encontrado */}
            <div className={estilos.conductorInfo}>
              <Checkmark24Regular style={{ color: '#0f7b0f', fontSize: '24px' }} />
              <div>
                <Text weight="semibold">{datosConductor.nombre} {datosConductor.apellidos}</Text>
                <br />
                <Badge appearance="outline">DNI: {datosConductor.dni}</Badge>
              </div>
            </div>

            <Field label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(_, d) => setEmail(d.value)}
                placeholder="tucorreo@empresa.com"
                contentBefore={<Mail24Regular />}
                size="large"
              />
            </Field>
            <Field label="Contraseña" required>
              <Input
                type="password"
                value={contrasena}
                onChange={(_, d) => setContrasena(d.value)}
                placeholder="Mínimo 6 caracteres"
                contentBefore={<LockClosed24Regular />}
                size="large"
              />
            </Field>
            <Field label="Confirmar contraseña" required>
              <Input
                type="password"
                value={confirmarContrasena}
                onChange={(_, d) => setConfirmarContrasena(d.value)}
                placeholder="Repite la contraseña"
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
              {cargando ? <Spinner size="tiny" /> : 'Completar registro'}
            </Button>
            <Button
              appearance="secondary"
              size="medium"
              onClick={() => { setPaso(1); setError(''); setDatosConductor(null); }}
            >
              Volver
            </Button>
          </form>
        )}

        <div className={estilos.enlaceLogin}>
          <Text size={200}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" style={{ color: tokens.colorBrandForeground1, textDecoration: 'none', fontWeight: 600 }}>
              Inicia sesión
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default PaginaRegistro;
