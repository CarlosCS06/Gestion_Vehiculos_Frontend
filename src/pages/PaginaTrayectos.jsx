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
  Select,
  Card,
  Badge,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
  Toolbar,
  ToolbarButton,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Map24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerTrayectos,
  crearTrayecto,
  actualizarTrayecto,
  eliminarTrayecto,
} from '../services/servicioTrayectos.js';
import { obtenerConductores } from '../services/servicioConductores.js';
import { formatForDateTimeLocal, formatDisplayDate, safeIsoString } from '../utils/dateUtils.js';
import { crearTrayectoVacio } from '../models/Trayecto.js';

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
});

const obtenerBadgeEstadoTrayecto = (trayecto) => {
  if (trayecto.activo) return <Badge appearance="filled" color="warning">Activo</Badge>;
  if (trayecto.completado) return <Badge appearance="filled" color="success">Completado</Badge>;
  if (trayecto.programado) return <Badge appearance="filled" color="informative">Programado</Badge>;
  return <Badge appearance="filled" color="subtle">Pendiente</Badge>;
};

const columnas = [
  { nombre: 'ID', campo: 'id' },
  { nombre: 'Origen', campo: 'origen' },
  { nombre: 'Destino', campo: 'destino' },
  { nombre: 'Conductor', campo: 'conductor' },
  { nombre: 'Km', campo: 'kmRecorridos' },
  { nombre: 'Gasto (€)', campo: 'gastoGasolina' },
  { nombre: 'Estado', campo: 'estado' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaTrayectos = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  const [trayectos, setTrayectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [trayectoActual, setTrayectoActual] = useState(crearTrayectoVacio());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensajeCargando, setMensajeCargando] = useState('');
  const [listaConductores, setListaConductores] = useState([]);

  const cargarTrayectos = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
    }
    try {
      const datos = await obtenerTrayectos();
      console.log('Trayectos cargados:', datos);
      
      // Filtrar duplicados por ID (por si el servidor los devuelve)
      const unicos = [];
      const idsVistos = new Set();
      
      datos.forEach(t => {
        if (t && t.id && !idsVistos.has(t.id)) {
          unicos.push(t);
          idsVistos.add(t.id);
        } else if (t && !t.id) {
          // Si por alguna razón no tiene ID, lo incluimos pero con una clave temporal
          unicos.push({ ...t, id: t.id || `temp-${Math.random()}` });
        }
      });

      if (unicos.length !== datos.length) {
        console.warn(`Se filtraron ${datos.length - unicos.length} trayectos duplicados.`);
      }
      
      setTrayectos(unicos);
    } catch (err) {
      console.error('Error al cargar los trayectos:', err);
      setError('Error al cargar los trayectos');
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    cargarTrayectos();
    obtenerConductores().then(setListaConductores).catch(console.error);
  }, [cargarTrayectos]);

  const abrirDialogoCrear = () => {
    setTrayectoActual(crearTrayectoVacio());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (trayecto) => {
    setTrayectoActual({ ...trayecto });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    if (procesando) return;
    setProcesando(true);
    setMensajeCargando(editando ? "Modificando trayecto..." : "Creando trayecto...");
    try {
      if (editando) {
        // Al actualizar, quitamos el ID del cuerpo para evitar confusiones en el backend
        const { id, ...datosSinId } = trayectoActual;
        await actualizarTrayecto(trayectoActual.id, datosSinId);
        
        // Lógica de encadenamiento automático
        const siguienteTrayecto = trayectos.find(t => 
          t.conductor === trayectoActual.conductor && 
          t.id !== trayectoActual.id &&
          new Date(t.horaSalida) >= new Date(trayectoActual.horaLlegada || trayectoActual.horaSalida)
        );

        if (siguienteTrayecto && siguienteTrayecto.origen !== trayectoActual.destino) {
          const { id: sId, ...sDatosSinId } = siguienteTrayecto;
          await actualizarTrayecto(sId, { ...sDatosSinId, origen: trayectoActual.destino });
        }
      } else {
        const nuevoTrayecto = { ...trayectoActual };
        delete nuevoTrayecto.id;
        await crearTrayecto(nuevoTrayecto);
      }
      
      setDialogoAbierto(false);
      await cargarTrayectos(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
      setMensajeCargando('');
    }
  };

  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    if (procesando) return;
    setProcesando(true);
    setMensajeCargando("Eliminando trayecto...");
    try {
      console.log(`Intentando eliminar trayecto: ${idEliminar}`);
      await eliminarTrayecto(idEliminar);
      console.log('Eliminación exitosa en backend, recargando...');
      setConfirmacionAbierta(false);
      await cargarTrayectos(true);
    } catch (err) {
      console.error('Error al eliminar trayecto:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
      setMensajeCargando('');
    }
  };

  const manejarCambio = (campo, valor) => {
    if (campo === 'horaSalida' || campo === 'horaLlegada') {
      const isoValor = safeIsoString(valor);
      setTrayectoActual((prev) => ({ ...prev, [campo]: isoValor }));
    } else {
      setTrayectoActual((prev) => ({ ...prev, [campo]: valor }));
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando trayectos..." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Map24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Trayectos</Title2>
        </div>
        {esAdmin && (
          <Toolbar>
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Añadir trayecto
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
        <Table style={{ minWidth: '800px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {trayectos.map((trayecto) => (
              <TableRow key={trayecto.id}>
                <TableCell><strong>{trayecto.id}</strong></TableCell>
                <TableCell>{trayecto.origen}</TableCell>
                <TableCell>{trayecto.destino}</TableCell>
                <TableCell>{trayecto.conductor}</TableCell>
                <TableCell>{trayecto.kmRecorridos.toLocaleString('es-ES')} km</TableCell>
                <TableCell>{trayecto.gastoGasolina.toFixed(2)} €</TableCell>
                <TableCell>{obtenerBadgeEstadoTrayecto(trayecto)}</TableCell>
                <TableCell>
                  {esAdmin && (
                    <>
                      <Tooltip content="Editar" relationship="label">
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(trayecto)} />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(trayecto.id)} />
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {trayectos.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay trayectos registrados</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar trayecto' : 'Nuevo trayecto'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <div className={estilos.filaFormulario}>
                  <Field label="Origen" required>
                    <Input 
                      disabled={editando}
                      value={trayectoActual.origen || ''} 
                      onChange={(_, d) => manejarCambio('origen', d.value)} 
                      placeholder="Madrid" 
                    />
                  </Field>
                  <Field label="Destino" required>
                    <Input value={trayectoActual.destino || ''} onChange={(_, d) => manejarCambio('destino', d.value)} placeholder="Barcelona" />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Hora salida">
                    <Input type="datetime-local" value={formatForDateTimeLocal(trayectoActual.horaSalida)} onChange={(_, d) => manejarCambio('horaSalida', d.value)} />
                  </Field>
                  <Field label="Hora llegada">
                    <Input type="datetime-local" value={formatForDateTimeLocal(trayectoActual.horaLlegada)} onChange={(_, d) => manejarCambio('horaLlegada', d.value)} />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Km recorridos">
                    <Input type="number" value={String(trayectoActual.kmRecorridos || 0)} onChange={(_, d) => manejarCambio('kmRecorridos', Number(d.value))} />
                  </Field>
                  <Field label="Gasto gasolina (€)">
                    <Input type="number" step="0.01" value={String(trayectoActual.gastoGasolina || 0)} onChange={(_, d) => manejarCambio('gastoGasolina', Number(d.value))} />
                  </Field>
                </div>
                <Field label="Conductor">
                  <Select
                    value={trayectoActual.conductor || ''}
                    onChange={(_, d) => manejarCambio('conductor', d.value)}
                  >
                    <option value="">Selecciona un conductor...</option>
                    {listaConductores.map(c => (
                      <option key={c.dni} value={c.dni}>
                        {c.dni} - {c.nombre} {c.apellidos}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar}>{editando ? 'Guardar cambios' : 'Crear trayecto'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar trayecto"
        mensaje={`¿Estás seguro de que deseas eliminar el trayecto ${idEliminar}?`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setConfirmacionAbierta(false)}
      />

      {mensajeCargando && (
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
            label={mensajeCargando} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaTrayectos;
