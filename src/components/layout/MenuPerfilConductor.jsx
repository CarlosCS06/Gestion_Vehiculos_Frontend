import { useState, useEffect, useRef } from 'react';
import {
  makeStyles,
  tokens,
  Button,
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Field,
  Input,
  Label,
  Avatar,
  Text,
  Spinner,
  Toast,
  ToastTitle,
  ToastBody,
  useId,
  Toaster,
  useToastController,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Camera24Regular,
  Save24Regular,
  Key24Regular,
  Mail24Regular,
  Person24Regular,
  Phone24Regular,
  Home24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../../context/ContextoAuth.jsx';
import { obtenerConductorPorDni, actualizarConductor, crearConductor } from '../../services/servicioConductores.js';
import { actualizarUsuario } from '../../services/servicioAuth.js';
import { subirImagen } from '../../services/servicioImagenes.js';

const useEstilos = makeStyles({
  drawer: {
    width: '400px',
  },
  contenedorFoto: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalXXL,
  },
  avatarGrande: {
    width: '120px',
    height: '120px',
    cursor: 'pointer',
    position: 'relative',
    '&:hover .overlay-foto': {
      opacity: 1,
    },
  },
  overlayFoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease-in-out',
    color: 'white',
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalXXL,
  },
  seccionTitulo: {
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingBottom: tokens.spacingVerticalXS,
  },
  botonesAccion: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
    position: 'sticky',
    bottom: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    paddingTop: tokens.spacingVerticalM,
    paddingBottom: tokens.spacingVerticalM,
    zIndex: 1,
  },
  inputOculto: {
    display: 'none',
  },
});

const MenuPerfilConductor = ({ abierto, alCerrar }) => {
  const { usuario, actualizarDatosUsuario } = useAuth();
  const estilos = useEstilos();
  const inputFotoRef = useRef(null);
  const toastId = useId('toast');
  const { dispatchToast } = useToastController(toastId);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [datos, setDatos] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    password: '',
    fotoUrl: '',
    imageFile: null,
  });
  const [existeConductor, setExisteConductor] = useState(true);

  useEffect(() => {
    if (abierto && usuario?.dni) {
      cargarDatosConductor();
    }
  }, [abierto, usuario?.dni]);

  const cargarDatosConductor = async () => {
    setCargando(true);
    try {
      const conductor = await obtenerConductorPorDni(usuario.dni);
      if (conductor) {
        setDatos({
          nombre: conductor.nombre || '',
          apellidos: conductor.apellidos || '',
          email: usuario.email || '',
          telefono: conductor.telefono || '',
          direccion: conductor.direccion || '',
          password: '',
          fotoUrl: conductor.image?.url || '',
          imageFile: null,
        });
        setExisteConductor(true);
      } else {
        throw new Error('404'); // Force fallback to user data
      }
    } catch (error) {
      if (error.status === 404 || error.message === '404' || error.status === 500) {
        // Si no existe el registro o hay un error de servidor, usamos los datos del usuario
        setDatos({
          nombre: usuario.nombre || '',
          apellidos: usuario.apellido || '',
          email: usuario.email || '',
          telefono: '',
          direccion: '',
          password: '',
          fotoUrl: usuario.fotoUrl || '',
          imageFile: null,
        });
        setExisteConductor(false);
      } else {
        console.error('Error al cargar datos del conductor:', error);
        mostrarToast('Error', 'No se pudieron cargar los datos del perfil.', 'error');
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const manejarCambioFoto = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    // Crear URL de previsualización local
    const previewUrl = URL.createObjectURL(archivo);
    setDatos((prev) => ({ ...prev, fotoUrl: previewUrl, imageFile: archivo }));
  };

  const manejarGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      // 1. Actualizar o Crear datos de conductor
      const datosConductor = {
        dni: usuario.dni,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        telefono: datos.telefono,
        direccion: datos.direccion,
        image: datos.imageFile || (datos.fotoUrl ? { url: datos.fotoUrl } : null),
      };

      if (existeConductor) {
        await actualizarConductor(usuario.dni, datosConductor);
      } else {
        await crearConductor(datosConductor);
        setExisteConductor(true);
      }

      // 2. Actualizar datos de usuario (email, password si se cambió)
      const datosUsuario = { 
        email: datos.email,
        fullName: `${datos.nombre} ${datos.apellidos}`.trim()
      };

      if (datos.password) {
        datosUsuario.password = datos.password;
      }

      await actualizarUsuario(usuario.dni, datosUsuario);

      // 3. Actualizar estado global para que la barra de navegación muestre los cambios
      // Obtenemos la URL final de la foto (si se subió una nueva, el backend de conductor la devuelve)
      // Pero como actualizarUsuario devuelve el usuario mapeado, lo usamos.
      // Sin embargo, la fotoUrl está en el modelo Conductor.
      
      // Si subimos una imagen, la URL estará en datos.fotoUrl (que es blob ahora)
      // o en la respuesta del backend.
      // Para simplificar, si se guardó con éxito, actualizamos el estado global.
      actualizarDatosUsuario({
        nombre: datos.nombre,
        apellido: datos.apellidos,
        email: datos.email,
        fotoUrl: datos.fotoUrl, // Esta es la URL (o blob) que se está mostrando
      });

      mostrarToast('Éxito', 'Perfil actualizado correctamente.', 'success');
      
      // Opcional: Actualizar el usuario en el contexto si es necesario
      // Aunque como estamos usando sessionStorage, igual hace falta refrescar o actualizar el estado global.
      
      setTimeout(() => {
        alCerrar();
      }, 1500);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      mostrarToast('Error', 'Hubo un problema al guardar los cambios.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  const mostrarToast = (titulo, mensaje, intencion) => {
    dispatchToast(
      <Toast>
        <ToastTitle>{titulo}</ToastTitle>
        <ToastBody>{mensaje}</ToastBody>
      </Toast>,
      { intent: intencion }
    );
  };

  return (
    <>
      <Toaster toasterId={toastId} />
      <Drawer
        className={estilos.drawer}
        position="end"
        open={abierto}
        onOpenChange={(_, { open }) => !open && alCerrar()}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Cerrar"
                icon={<Dismiss24Regular />}
                onClick={alCerrar}
              />
            }
          >
            Mi Perfil
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          {cargando ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spinner label="Cargando perfil..." />
            </div>
          ) : (
            <form onSubmit={manejarGuardar} className={estilos.formulario}>
              <div className={estilos.contenedorFoto}>
                <div 
                  className={estilos.avatarGrande} 
                  onClick={() => inputFotoRef.current?.click()}
                >
                  <Avatar
                    size={120}
                    image={{ src: datos.fotoUrl }}
                    name={`${datos.nombre} ${datos.apellidos}`}
                  />
                  <div className={`overlay-foto ${estilos.overlayFoto}`}>
                    <Camera24Regular />
                  </div>
                </div>
                <input
                  type="file"
                  ref={inputFotoRef}
                  className={estilos.inputOculto}
                  accept="image/*"
                  onChange={manejarCambioFoto}
                  disabled={guardando}
                />
                <Text size={200} font="italic">Haz clic para cambiar la foto</Text>
              </div>

              <div className={estilos.seccionTitulo}>
                <Text weight="semibold">Información Personal</Text>
              </div>

              <Field label="DNI (No editable)">
                <Input value={usuario?.dni} disabled />
              </Field>

              <Field label="Nombre" required>
                <Input
                  name="nombre"
                  value={datos.nombre}
                  onChange={manejarCambio}
                  contentLeft={<Person24Regular />}
                  required
                />
              </Field>

              <Field label="Apellidos" required>
                <Input
                  name="apellidos"
                  value={datos.apellidos}
                  onChange={manejarCambio}
                  required
                />
              </Field>

              <Field label="Teléfono">
                <Input
                  name="telefono"
                  value={datos.telefono}
                  onChange={manejarCambio}
                  contentLeft={<Phone24Regular />}
                />
              </Field>

              <Field label="Dirección">
                <Input
                  name="direccion"
                  value={datos.direccion}
                  onChange={manejarCambio}
                  contentLeft={<Home24Regular />}
                />
              </Field>

              <div className={estilos.seccionTitulo}>
                <Text weight="semibold">Seguridad y Cuenta</Text>
              </div>

              <Field label="Correo Electrónico" required>
                <Input
                  type="email"
                  name="email"
                  value={datos.email}
                  onChange={manejarCambio}
                  contentLeft={<Mail24Regular />}
                  required
                />
              </Field>

              <Field label="Nueva Contraseña (dejar en blanco para no cambiar)">
                <Input
                  type="password"
                  name="password"
                  value={datos.password}
                  onChange={manejarCambio}
                  contentLeft={<Key24Regular />}
                />
              </Field>

              <div className={estilos.botonesAccion}>
                <Button 
                  type="submit" 
                  appearance="primary" 
                  icon={<Save24Regular />}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                <Button 
                  type="button" 
                  appearance="secondary" 
                  onClick={alCerrar}
                  disabled={guardando}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          )}
        </DrawerBody>
      </Drawer>
    </>
  );
};

export default MenuPerfilConductor;
