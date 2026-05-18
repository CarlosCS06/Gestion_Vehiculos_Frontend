import { useState, useEffect, useCallback } from 'react';
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
  Avatar,
  Badge,
  Select,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Person24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerConductores,
  crearConductor,
  actualizarConductor,
  eliminarConductor,
} from '../services/servicioConductores.js';
import { actualizarUsuario } from '../services/servicioAuth.js';
import { subirImagen } from '../services/servicioImagenes.js';
import { crearConductorVacio } from '../models/Conductor.js';
import { crearImagenVacia } from '../models/Imagenes.js';
import { formatForDate } from '../utils/dateUtils.js';
import { validarDNI, validarTelefono, validarEdadMinima } from '../utils/validaciones.js';

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
    alignItems: 'center',
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
  uploadZone: {
    borderTopWidth: '2px',
    borderBottomWidth: '2px',
    borderLeftWidth: '2px',
    borderRightWidth: '2px',
    borderTopStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderRadius: tokens.borderRadiusLarge,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingVerticalL,
    paddingRight: tokens.spacingVerticalL,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground2,
    transition: 'all 0.3s ease',
    ':hover': {
      borderTopColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
  uploadZoneActive: {
    borderTopColor: tokens.colorBrandStroke1,
    borderBottomColor: tokens.colorBrandStroke1,
    borderLeftColor: tokens.colorBrandStroke1,
    borderRightColor: tokens.colorBrandStroke1,
    backgroundColor: tokens.colorBrandBackground2,
    transform: 'scale(1.01)',
  },
});

const columnas = [
  { nombre: 'DNI', campo: 'dni' },
  { nombre: 'Imagen', campo: 'image' },
  { nombre: 'Nombre', campo: 'nombre' },
  { nombre: 'Apellidos', campo: 'apellidos' },
  { nombre: 'Teléfono', campo: 'telefono' },
  { nombre: 'Dirección', campo: 'direccion' },
  { nombre: 'Fecha de nacimiento', campo: 'fechaNacimiento' },
  { nombre: 'Trayectos', campo: 'trayectos' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaConductores = () => {
  const estilos = useEstilos();
  const { esAdmin, preRegistrarUsuario, usuario } = useAuth();

  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [conductorActual, setConductorActual] = useState(crearConductorVacio());
  const [editando, setEditando] = useState(false);
  const [dniEliminar, setDniEliminar] = useState('');
  const [error, setError] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroActividad, setFiltroActividad] = useState('Todos');
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});

  useEffect(() => {
    // Cleanup preview URL
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!dialogoAbierto) {
      // Limpiar estados de carga e imágenes temporales al cerrar el diálogo
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setErroresValidacion({});
      setError('');
    }
  }, [dialogoAbierto]);

  const cargarConductores = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerConductores();
      setConductores(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar los conductores');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarConductores();
  }, [cargarConductores]);

  const abrirDialogoCrear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErroresValidacion({});
    setError('');
    setConductorActual(crearConductorVacio());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (conductor) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErroresValidacion({});
    setError('');
    setConductorActual({ ...conductor });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    // --- VALIDACIONES ---
    const errores = {};

    // Validar DNI
    const resDni = validarDNI(conductorActual.dni);
    if (!resDni.valido) errores.dni = resDni.mensaje;

    // Validar teléfono (solo si se ha rellenado)
    if (conductorActual.telefono && conductorActual.telefono.trim()) {
      const resTel = validarTelefono(conductorActual.telefono);
      if (!resTel.valido) errores.telefono = resTel.mensaje;
    }

    // Validar edad (mayor de 18)
    if (conductorActual.fechaNacimiento) {
      const resEdad = validarEdadMinima(conductorActual.fechaNacimiento, 18);
      if (!resEdad.valido) errores.fechaNacimiento = resEdad.mensaje;
    }

    // Validar nombre y apellidos obligatorios
    if (!conductorActual.nombre || !conductorActual.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio.';
    }
    if (!conductorActual.apellidos || !conductorActual.apellidos.trim()) {
      errores.apellidos = 'Los apellidos son obligatorios.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      return;
    }
    setErroresValidacion({});
    // --- FIN VALIDACIONES ---

    setGuardando(true);
    try {
      if (editando) {
        await actualizarConductor(conductorActual.dni, conductorActual);
        
        // Sincronizar con la cuenta de usuario
        const datosUsuario = {
          fullName: `${conductorActual.nombre} ${conductorActual.apellidos}`.trim()
        };
        if (conductorActual.telefono) {
          const telLimpio = conductorActual.telefono.replace(/\s+/g, '');
          if (!isNaN(telLimpio)) {
            datosUsuario.telefono = Number(telLimpio);
          }
        }
        await actualizarUsuario(conductorActual.dni, datosUsuario).catch(err => {
          console.warn('No se pudo sincronizar la cuenta de usuario:', err);
        });
      } else {
        await crearConductor(conductorActual);
        await preRegistrarUsuario(conductorActual);
      }
      setDialogoAbierto(false);
      cargarConductores();
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const manejarSubidaArchivo = (archivo) => {
    if (!archivo) return;
    manejarCambio('image', archivo);

    // Crear URL de previsualización local
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(archivo));
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      manejarSubidaArchivo(e.dataTransfer.files[0]);
    }
  };

  const confirmarEliminar = (dni) => {
    setDniEliminar(dni);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    setEliminando(true);
    try {
      await eliminarConductor(dniEliminar);
      setConfirmacionAbierta(false);
      cargarConductores();
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  };

  const manejarCambio = (campo, valor) => {
    setConductorActual((prev) => ({ ...prev, [campo]: valor }));
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando conductores..." />
      </div>
    );
  }

  const conductoresFiltrados = conductores.filter(c => {
    const numViajes = c.trayectos?.length || 0;
    if (filtroActividad === 'Con viajes' && numViajes === 0) return false;
    if (filtroActividad === 'Sin viajes' && numViajes > 0) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    return (
      (c.dni || '').toLowerCase().includes(term) ||
      (c.nombre || '').toLowerCase().includes(term) ||
      (c.apellidos || '').toLowerCase().includes(term) ||
      (c.telefono || '').toLowerCase().includes(term) ||
      (c.direccion || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Person24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Conductores</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input 
            contentBefore={<Search24Regular />} 
            placeholder="Buscar conductor..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          <Select value={filtroActividad} onChange={(e, d) => setFiltroActividad(d.value)}>
            <option value="Todos">Todos</option>
            <option value="Con viajes">Con viajes asignados</option>
            <option value="Sin viajes">Sin viajes</option>
          </Select>
          {esAdmin && (
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Dar de alta conductor
            </ToolbarButton>
          )}
        </Toolbar>
      </div>

      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      <Card className={estilos.tarjetaTabla}>
        <Table style={{ minWidth: '750px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {conductoresFiltrados.map((conductor) => (
              <TableRow key={conductor.dni}>
                <TableCell><strong>{conductor.dni}</strong></TableCell>
                <TableCell>
                  <Avatar
                    image={{ src: typeof conductor.image === 'string' ? conductor.image : conductor.image?.url }}
                    name={`${conductor.nombre} ${conductor.apellidos}`}
                    size={32}
                  />
                </TableCell>
                <TableCell>{conductor.nombre}</TableCell>
                <TableCell>{conductor.apellidos}</TableCell>
                <TableCell>{conductor.telefono}</TableCell>
                <TableCell>{conductor.direccion}</TableCell>
                <TableCell>{conductor.fechaNacimiento ? new Date(conductor.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A'}</TableCell>
                <TableCell>{conductor.trayectos?.length || 0}</TableCell>
                <TableCell>
                  {(esAdmin || (usuario && usuario.dni === conductor.dni)) && (
                    <Tooltip content="Editar" relationship="label">
                      <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(conductor)} />
                    </Tooltip>
                  )}
                  {esAdmin && (
                    <Tooltip content="Eliminar" relationship="label">
                      <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(conductor.dni)} />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {conductores.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay conductores registrados</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Vista de Lista Móvil */}
      <div className={estilos.listaMovil}>
        {conductoresFiltrados.map((conductor) => (
          <Card key={conductor.dni} className={estilos.tarjetaMovil}>
            <div className={estilos.tarjetaMovilCabecera}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar
                  image={{ src: typeof conductor.image === 'string' ? conductor.image : conductor.image?.url }}
                  name={`${conductor.nombre} ${conductor.apellidos}`}
                  size={40}
                />
                <div>
                  <Text size={400} weight="bold" block>{conductor.nombre} {conductor.apellidos}</Text>
                  <Text size={200} style={{ color: tokens.colorBrandForeground1 }}>{conductor.dni}</Text>
                </div>
              </div>
            </div>
            
            <div className={estilos.tarjetaMovilCuerpo}>
              <div>
                <div className={estilos.datoEtiqueta}>Teléfono</div>
                <div className={estilos.datoValor}>{conductor.telefono || '—'}</div>
              </div>
              <div>
                <div className={estilos.datoEtiqueta}>Nacimiento</div>
                <div className={estilos.datoValor}>{conductor.fechaNacimiento ? new Date(conductor.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className={estilos.datoEtiqueta}>Dirección</div>
                <div className={estilos.datoValor}>{conductor.direccion || '—'}</div>
              </div>
            </div>

            <div className={estilos.accionesMovil}>
              {(esAdmin || (usuario && usuario.dni === conductor.dni)) && (
                <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(conductor)}>
                  Editar
                </Button>
              )}
              {esAdmin && (
                <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(conductor.dni)}>
                  Borrar
                </Button>
              )}
            </div>
          </Card>
        ))}
        {conductores.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay conductores registrados</Text>
          </Card>
        )}
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '550px' }}>
          <DialogBody>
            <DialogTitle>
              {editando
                ? (usuario && usuario.dni === conductorActual.dni && !esAdmin ? 'Mi perfil' : 'Editar conductor')
                : 'Dar de alta conductor'}
            </DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <Field label="DNI" required validationState={erroresValidacion.dni ? 'error' : undefined} validationMessage={erroresValidacion.dni}>
                  <Input value={conductorActual.dni} onChange={(_, d) => { manejarCambio('dni', d.value.toUpperCase()); setErroresValidacion(prev => ({ ...prev, dni: undefined })); }} disabled={editando} placeholder="12345678A" />
                </Field>
                <Field label="Foto de perfil (Cloudinary)" hint="Se subirá automáticamente al seleccionar archivo o pegar URL">
                  <div className={estilos.formulario}>
                    <div
                      className={`${estilos.uploadZone} ${isDragging ? estilos.uploadZoneActive : ''}`}
                      onClick={() => document.getElementById('conductor-file-input').click()}
                      onDragOver={onDragOver}
                      onDragEnter={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      {guardando || subiendoImagen ? (
                        <Spinner label={subiendoImagen ? "Procesando imagen..." : (editando ? "Modificando conductor..." : "Creando conductor...")} />
                      ) : (
                        <>
                          <Title2 size={400}>
                            {isDragging ? '¡Suelta la imagen aquí!' : 'Haz clic o arrastra una imagen'}
                          </Title2>
                          <Text size={200} block>
                            {isDragging ? 'Cualquier imagen es bienvenida' : 'La foto oficial del conductor'}
                          </Text>
                        </>
                      )}
                      <input
                        id="conductor-file-input"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => manejarSubidaArchivo(e.target.files[0])}
                      />
                    </div>

                    {(previewUrl || conductorActual.image?.url) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: tokens.borderRadiusLarge, border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                        <Avatar
                          image={{ src: previewUrl || (typeof conductorActual.image === 'string' ? conductorActual.image : conductorActual.image?.url) }}
                          name={`${conductorActual.nombre} ${conductorActual.apellidos}`}
                          size={96}
                        />
                        <div>
                          <Badge appearance="filled" color={previewUrl ? 'warning' : 'success'}>
                            {previewUrl ? 'Pendiente de subir' : 'Imagen verificada'}
                          </Badge>
                          <Text size={200} block style={{ marginTop: '4px', color: tokens.colorNeutralForeground4 }}>
                            {previewUrl ? 'Archivo local seleccionado' : (conductorActual.image?.nombre || 'Cloudinary Hosting')}
                          </Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Field>
                <div className={estilos.filaFormulario}>
                    <Field label="Nombre" required validationState={erroresValidacion.nombre ? 'error' : undefined} validationMessage={erroresValidacion.nombre}>
                    <Input
                      value={conductorActual.nombre}
                      onChange={(_, d) => { manejarCambio('nombre', d.value); setErroresValidacion(prev => ({ ...prev, nombre: undefined })); }}
                      placeholder="Carlos"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                  <Field label="Apellidos" required validationState={erroresValidacion.apellidos ? 'error' : undefined} validationMessage={erroresValidacion.apellidos}>
                    <Input
                      value={conductorActual.apellidos}
                      onChange={(_, d) => { manejarCambio('apellidos', d.value); setErroresValidacion(prev => ({ ...prev, apellidos: undefined })); }}
                      placeholder="García López"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Teléfono" validationState={erroresValidacion.telefono ? 'error' : undefined} validationMessage={erroresValidacion.telefono} hint="Formato: +34 612 345 678">
                    <Input
                      value={conductorActual.telefono}
                      onChange={(_, d) => { manejarCambio('telefono', d.value); setErroresValidacion(prev => ({ ...prev, telefono: undefined })); }}
                      placeholder="+34 612 345 678"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                  <Field label="Dirección">
                    <Input
                      value={conductorActual.direccion}
                      onChange={(_, d) => manejarCambio('direccion', d.value)}
                      placeholder="Calle Mayor 10"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                  <Field label="Fecha de nacimiento" validationState={erroresValidacion.fechaNacimiento ? 'error' : undefined} validationMessage={erroresValidacion.fechaNacimiento}>
                    <Input
                      type="date"
                      value={formatForDate(conductorActual.fechaNacimiento)}
                      onChange={(_, d) => { manejarCambio('fechaNacimiento', d.value); setErroresValidacion(prev => ({ ...prev, fechaNacimiento: undefined })); }}
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)} disabled={guardando}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar} disabled={guardando}>
                {editando ? 'Guardar cambios' : 'Dar de alta'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar conductor"
        mensaje={`¿Estás seguro de que deseas eliminar al conductor con DNI ${dniEliminar}?`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setConfirmacionAbierta(false)}
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
            label={eliminando ? "Eliminando conductor..." : (editando ? "Modificando conductor..." : "Creando conductor...")} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaConductores;
