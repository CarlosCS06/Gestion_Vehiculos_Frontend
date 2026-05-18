import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Title2,
  Button,
  Spinner,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Input,
  Field,
  Card,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
  Toolbar,
  ToolbarButton,
  Badge,
  Checkbox,
  Select,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  PersonAccounts24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerTodosLosUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../services/servicioUsuarios.js';
import {
  validarDNI,
  validarTelefono,
  validarEmail,
} from '../utils/validaciones.js';

const useEstilos = makeStyles({
  pagina: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  cabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
  },
  tituloConIcono: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  tarjetaTabla: {
    padding: tokens.spacingHorizontalL,
    overflow: 'auto',
    '@media (max-width: 768px)': {
      display: 'none',
    }
  },
  listaMovil: {
    display: 'none',
    '@media (max-width: 768px)': {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacingVerticalM,
    }
  },
  tarjetaMovil: {
    padding: tokens.spacingHorizontalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  tarjetaMovilCabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomColor: tokens.colorNeutralStroke2,
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    paddingBottom: tokens.spacingVerticalS,
  },
  tarjetaMovilCuerpo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  datoEtiqueta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: '2px',
  },
  datoValor: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
  },
  accionesMovil: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  filaFormulario: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
});

const crearUsuarioVacio = () => ({
  dni: '',
  email: '',
  password: '',
  fullName: '',
  telefono: '',
  isActive: true,
  roles: ['user'],
});

const PaginaUsuarios = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  // Si no es admin, redirigir inmediatamente a la página de vehículos
  if (!esAdmin) {
    return <Navigate to="/vehiculos" replace />;
  }

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState(crearUsuarioVacio());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState({});

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await obtenerTodosLosUsuarios();
      setUsuarios(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios de la base de datos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const manejarCambio = (campo, valor) => {
    setUsuarioActual((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    // Limpiar error específico del campo al editarlo
    if (erroresValidacion[campo]) {
      setErroresValidacion((prev) => ({
        ...prev,
        [campo]: '',
      }));
    }
  };

  const abrirDialogoCrear = () => {
    setUsuarioActual(crearUsuarioVacio());
    setErroresValidacion({});
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (usuario) => {
    setUsuarioActual({
      dni: usuario.dni || '',
      email: usuario.email || '',
      password: '', // Opcional al editar
      fullName: usuario.fullName || '',
      telefono: usuario.telefono || '',
      isActive: usuario.isActive !== undefined ? usuario.isActive : true,
      roles: usuario.roles || ['user'],
    });
    setErroresValidacion({});
    setEditando(true);
    setDialogoAbierto(true);
  };

  const confirmarEliminar = (dni) => {
    setIdEliminar(dni);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    setEliminando(true);
    setConfirmacionAbierta(false);
    try {
      await eliminarUsuario(idEliminar);
      setUsuarios((prev) => prev.filter((u) => u.dni !== idEliminar));
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario.');
    } finally {
      setEliminando(false);
    }
  };

  const manejarGuardar = async () => {
    // --- VALIDACIONES DE FORMULARIO ---
    const errores = {};
    
    if (!editando) {
      const resDni = validarDNI(usuarioActual.dni);
      if (!resDni.valido) {
        errores.dni = resDni.mensaje;
      }
    }

    if (!usuarioActual.fullName || usuarioActual.fullName.trim() === '') {
      errores.fullName = 'El nombre completo es obligatorio.';
    }

    const resEmail = validarEmail(usuarioActual.email);
    if (!resEmail.valido) {
      errores.email = resEmail.mensaje;
    }

    if (usuarioActual.telefono && usuarioActual.telefono.trim() !== '') {
      const resTel = validarTelefono(usuarioActual.telefono);
      if (!resTel.valido) {
        errores.telefono = resTel.mensaje;
      }
    }

    if (!editando && (!usuarioActual.password || usuarioActual.password.trim() === '')) {
      errores.password = 'La contraseña es obligatoria para nuevos usuarios.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      return;
    }
    // --- FIN VALIDACIONES ---

    setGuardando(true);
    setDialogoAbierto(false);
    try {
      if (editando) {
        const respuesta = await actualizarUsuario(usuarioActual.dni, usuarioActual);
        setUsuarios((prev) =>
          prev.map((u) => (u.dni === usuarioActual.dni ? { ...u, ...respuesta } : u))
        );
      } else {
        const respuesta = await crearUsuario(usuarioActual);
        setUsuarios((prev) => [...prev, respuesta]);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar el usuario en el backend.');
    } finally {
      setGuardando(false);
    }
  };

  // Convertir roles array a una cadena bonita para mostrar
  const formatearRoles = (roles) => {
    if (!roles || roles.length === 0) return 'Ninguno';
    return roles
      .map((r) => {
        if (r === 'admin') return 'Administrador';
        if (r === 'user') return 'Conductor';
        return r;
      })
      .join(', ');
  };

  // Filtrado reactivo en memoria
  const usuariosFiltrados = usuarios.filter((u) => {
    const busqueda = terminoBusqueda.toLowerCase().trim();
    if (!busqueda) return true;
    
    return (
      (u.fullName || '').toLowerCase().includes(busqueda) ||
      (u.email || '').toLowerCase().includes(busqueda) ||
      (u.dni || '').toLowerCase().includes(busqueda) ||
      (u.telefono || '').toLowerCase().includes(busqueda)
    );
  });

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <PersonAccounts24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Gestión de Usuarios</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input
            contentBefore={<Search24Regular />}
            placeholder="Buscar usuario..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '220px' }}
          />
          <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
            Registrar usuario
          </ToolbarButton>
        </Toolbar>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error del Servidor</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      {cargando ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Spinner size="large" label="Cargando base de datos de usuarios..." />
        </div>
      ) : (
        <>
          {/* Vista de Tabla para Escritorio */}
          <Card className={estilos.tarjetaTabla}>
            <Table style={{ minWidth: '800px' }}>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell><strong>DNI</strong></TableHeaderCell>
                  <TableHeaderCell><strong>Nombre Completo</strong></TableHeaderCell>
                  <TableHeaderCell><strong>Email</strong></TableHeaderCell>
                  <TableHeaderCell><strong>Teléfono</strong></TableHeaderCell>
                  <TableHeaderCell><strong>Estado</strong></TableHeaderCell>
                  <TableHeaderCell><strong>Roles</strong></TableHeaderCell>
                  <TableHeaderCell style={{ width: '100px' }}><strong>Acciones</strong></TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltrados.map((u) => (
                  <TableRow key={u.dni}>
                    <TableCell>{u.dni}</TableCell>
                    <TableCell>{u.fullName || '—'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.telefono || '—'}</TableCell>
                    <TableCell>
                      {u.isActive ? (
                        <Badge appearance="filled" color="success">Activo</Badge>
                      ) : (
                        <Badge appearance="filled" color="warning">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatearRoles(u.roles)}</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Tooltip content="Editar" relationship="label">
                          <Button
                            icon={<Edit24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => abrirDialogoEditar(u)}
                          />
                        </Tooltip>
                        <Tooltip content="Eliminar" relationship="label">
                          <Button
                            icon={<Delete24Regular />}
                            appearance="subtle"
                            size="small"
                            style={{ color: tokens.colorPaletteRedForeground1 }}
                            onClick={() => confirmarEliminar(u.dni)}
                          />
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                      <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                        No se encontraron usuarios registrados.
                      </Text>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Vista de Tarjetas Móvil */}
          <div className={estilos.listaMovil}>
            {usuariosFiltrados.map((u) => (
              <Card key={u.dni} className={estilos.tarjetaMovil}>
                <div className={estilos.tarjetaMovilCabecera}>
                  <div>
                    <Text size={300} weight="semibold" block>{u.fullName || 'Sin nombre'}</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{u.dni}</Text>
                  </div>
                  <div>
                    {u.isActive ? (
                      <Badge appearance="filled" color="success">Activo</Badge>
                    ) : (
                      <Badge appearance="filled" color="warning">Inactivo</Badge>
                    )}
                  </div>
                </div>
                <div className={estilos.tarjetaMovilCuerpo}>
                  <div>
                    <div className={estilos.datoEtiqueta}>Email</div>
                    <div className={estilos.datoValor}>{u.email}</div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Teléfono</div>
                    <div className={estilos.datoValor}>{u.telefono || '—'}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div className={estilos.datoEtiqueta}>Roles</div>
                    <div className={estilos.datoValor}>{formatearRoles(u.roles)}</div>
                  </div>
                </div>
                <div className={estilos.accionesMovil}>
                  <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(u)}>
                    Editar
                  </Button>
                  <Button
                    icon={<Delete24Regular />}
                    appearance="subtle"
                    style={{ color: tokens.colorPaletteRedForeground1 }}
                    onClick={() => confirmarEliminar(u.dni)}
                  >
                    Borrar
                  </Button>
                </div>
              </Card>
            ))}
            {usuariosFiltrados.length === 0 && (
              <Card style={{ padding: '40px', textAlign: 'center' }}>
                <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>
                  No se encontraron usuarios registrados.
                </Text>
              </Card>
            )}
          </div>
        </>
      )}

      {/* Ventana Modal para Crear / Editar Usuario */}
      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '550px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar usuario' : 'Registrar usuario'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <div className={estilos.filaFormulario}>
                  <Field
                    label="DNI / NIE"
                    required
                    validationState={erroresValidacion.dni ? 'error' : 'none'}
                    validationMessage={erroresValidacion.dni}
                  >
                    <Input
                      value={usuarioActual.dni}
                      disabled={editando}
                      placeholder="12345678Z"
                      onChange={(_, d) => manejarCambio('dni', d.value)}
                    />
                  </Field>
                  <Field
                    label="Nombre Completo"
                    required
                    validationState={erroresValidacion.fullName ? 'error' : 'none'}
                    validationMessage={erroresValidacion.fullName}
                  >
                    <Input
                      value={usuarioActual.fullName}
                      placeholder="Ej: Álvaro López"
                      onChange={(_, d) => manejarCambio('fullName', d.value)}
                    />
                  </Field>
                </div>

                <div className={estilos.filaFormulario}>
                  <Field
                    label="Correo Electrónico"
                    required
                    validationState={erroresValidacion.email ? 'error' : 'none'}
                    validationMessage={erroresValidacion.email}
                  >
                    <Input
                      type="email"
                      value={usuarioActual.email}
                      placeholder="ejemplo@correo.com"
                      onChange={(_, d) => manejarCambio('email', d.value)}
                    />
                  </Field>
                  <Field
                    label="Teléfono"
                    validationState={erroresValidacion.telefono ? 'error' : 'none'}
                    validationMessage={erroresValidacion.telefono}
                  >
                    <Input
                      value={usuarioActual.telefono}
                      placeholder="683774821"
                      onChange={(_, d) => manejarCambio('telefono', d.value)}
                    />
                  </Field>
                </div>

                <div className={estilos.filaFormulario}>
                  <Field
                    label="Contraseña"
                    required={!editando}
                    validationState={erroresValidacion.password ? 'error' : 'none'}
                    validationMessage={erroresValidacion.password}
                    hint={editando ? 'Dejar en blanco para no modificar' : 'Mínimo 6 caracteres'}
                  >
                    <Input
                      type="password"
                      value={usuarioActual.password}
                      placeholder={editando ? '••••••••' : 'Ingresa contraseña'}
                      onChange={(_, d) => manejarCambio('password', d.value)}
                    />
                  </Field>
                  <Field label="Rol del Usuario" required>
                    <Select
                      value={
                        usuarioActual.roles && usuarioActual.roles.includes('admin') && usuarioActual.roles.includes('user')
                          ? 'user,admin'
                          : usuarioActual.roles && usuarioActual.roles.includes('admin')
                          ? 'admin'
                          : 'user'
                      }
                      onChange={(_, d) => {
                        const vals = d.value.split(',');
                        manejarCambio('roles', vals);
                      }}
                    >
                      <option value="user">Conductor / Usuario</option>
                      <option value="admin">Administrador</option>
                      <option value="user,admin">Ambos (Conductor y Admin)</option>
                    </Select>
                  </Field>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                  <Checkbox
                    label="¿Usuario habilitado y activo?"
                    checked={!!usuarioActual.isActive}
                    onChange={(_, d) => manejarCambio('isActive', !!d.checked)}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogActions style={{ marginTop: '20px' }}>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>
                Cancelar
              </Button>
              <Button appearance="primary" onClick={manejarGuardar}>
                Guardar
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Ventana de Confirmación de Borrado */}
      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        onCancelar={() => setConfirmacionAbierta(false)}
        onConfirmar={manejarEliminar}
        titulo="Eliminar usuario del sistema"
        mensaje="¿Está completamente seguro de que desea eliminar a este usuario? Esta acción es irreversible, revocará inmediatamente todos sus permisos de acceso y desvinculará sus registros asociados en la base de datos."
      />

      {(guardando || eliminando) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
        }}>
          <Spinner 
            size="large" 
            label={eliminando ? "Eliminando usuario..." : (editando ? "Modificando usuario..." : "Creando usuario...")} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaUsuarios;
