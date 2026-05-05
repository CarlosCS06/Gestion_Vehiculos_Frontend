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
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Person24Regular,
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
import { subirImagen, subirImagenPorUrl } from '../services/servicioImagenes.js';
import { crearConductorVacio } from '../models/Conductor.js';
import { crearImagenVacia } from '../models/Imagenes.js';

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
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Cleanup preview URL
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

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
    setConductorActual(crearConductorVacio());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (conductor) => {
    setConductorActual({ ...conductor });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
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

  const manejarSubidaUrl = async (url) => {
    if (!url || !url.startsWith('http')) return;
    setSubiendoImagen(true);
    setError('');
    try {
      const datosImagen = {
        url: url,
        name: `conductor_${conductorActual.dni || 'nuevo'}`,
      };

      // Guardamos la URL para la vista previa y el ID para el backend
      manejarCambio('image', {
        name: datosImagen.name,
        url: datosImagen.url
      });

      // Si había una previsualización de archivo, la quitamos
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err) {
      setError('Error al procesar imagen de internet: ' + err.message);
    } finally {
      setSubiendoImagen(false);
    }
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
    try {
      await eliminarConductor(dniEliminar);
      setConfirmacionAbierta(false);
      cargarConductores();
    } catch (err) {
      setError(err.message);
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

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Person24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Conductores</Title2>
        </div>
        {esAdmin && (
          <Toolbar>
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Dar de alta conductor
            </ToolbarButton>
          </Toolbar>
        )}
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
            {conductores.map((conductor) => (
              <TableRow key={conductor.dni}>
                <TableCell><strong>{conductor.dni}</strong></TableCell>
                <TableCell>
                  <Avatar
                    image={{ src: conductor.image?.url }}
                    name={`${conductor.nombre} ${conductor.apellidos}`}
                    size={32}
                  />
                </TableCell>
                <TableCell>{conductor.nombre}</TableCell>
                <TableCell>{conductor.apellidos}</TableCell>
                <TableCell>{conductor.telefono}</TableCell>
                <TableCell>{conductor.direccion}</TableCell>
                <TableCell>{new Date(conductor.fechaNacimiento).toLocaleDateString('es-ES')}</TableCell>
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
                <Field label="DNI" required>
                  <Input value={conductorActual.dni} onChange={(_, d) => manejarCambio('dni', d.value)} disabled={editando} placeholder="12345678A" />
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
                        <Spinner label={subiendoImagen ? "Procesando imagen..." : "Guardando conductor..."} />
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

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <Field label="O pega una URL de internet" style={{ flexGrow: 1 }}>
                        <Input
                          placeholder="https://ejemplo.com/foto_conductor.jpg"
                          onBlur={(e) => manejarSubidaUrl(e.target.value)}
                        />
                      </Field>
                    </div>

                    {(previewUrl || conductorActual.image?.url) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', borderRadius: tokens.borderRadiusLarge, border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                        <Avatar
                          image={{ src: previewUrl || conductorActual.image?.url }}
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
                  <Field label="Nombre" required>
                    <Input
                      value={conductorActual.nombre}
                      onChange={(_, d) => manejarCambio('nombre', d.value)}
                      placeholder="Carlos"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                  <Field label="Apellidos" required>
                    <Input
                      value={conductorActual.apellidos}
                      onChange={(_, d) => manejarCambio('apellidos', d.value)}
                      placeholder="García López"
                      disabled={!esAdmin && usuario && usuario.dni === conductorActual.dni}
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Teléfono">
                    <Input
                      value={conductorActual.telefono}
                      onChange={(_, d) => manejarCambio('telefono', d.value)}
                      placeholder="612345678"
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
                  <Field label="Fecha de nacimiento">
                    <Input
                      type="date"
                      value={conductorActual.fechaNacimiento}
                      onChange={(_, d) => manejarCambio('fechaNacimiento', d.value)}
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
    </div>
  );
};

export default PaginaConductores;
