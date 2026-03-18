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

  const cargarTrayectos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerTrayectos();
      setTrayectos(datos);
    } catch {
      setError('Error al cargar los trayectos');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarTrayectos();
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
    try {
      if (editando) {
        await actualizarTrayecto(trayectoActual.id, trayectoActual);
      } else {
        await crearTrayecto(trayectoActual);
      }
      setDialogoAbierto(false);
      cargarTrayectos();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    try {
      await eliminarTrayecto(idEliminar);
      setConfirmacionAbierta(false);
      cargarTrayectos();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambio = (campo, valor) => {
    setTrayectoActual((prev) => ({ ...prev, [campo]: valor }));
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
                    <Input value={trayectoActual.origen} onChange={(_, d) => manejarCambio('origen', d.value)} placeholder="Madrid" />
                  </Field>
                  <Field label="Destino" required>
                    <Input value={trayectoActual.destino} onChange={(_, d) => manejarCambio('destino', d.value)} placeholder="Barcelona" />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Hora salida">
                    <Input type="datetime-local" value={trayectoActual.horaSalida} onChange={(_, d) => manejarCambio('horaSalida', d.value)} />
                  </Field>
                  <Field label="Hora llegada">
                    <Input type="datetime-local" value={trayectoActual.horaLlegada} onChange={(_, d) => manejarCambio('horaLlegada', d.value)} />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Km recorridos">
                    <Input type="number" value={String(trayectoActual.kmRecorridos)} onChange={(_, d) => manejarCambio('kmRecorridos', Number(d.value))} />
                  </Field>
                  <Field label="Gasto gasolina (€)">
                    <Input type="number" step="0.01" value={String(trayectoActual.gastoGasolina)} onChange={(_, d) => manejarCambio('gastoGasolina', Number(d.value))} />
                  </Field>
                </div>
                <Field label="DNI Conductor">
                  <Input value={trayectoActual.conductor} onChange={(_, d) => manejarCambio('conductor', d.value)} placeholder="12345678A" />
                </Field>
                <div className={estilos.filaFormulario}>
                  <Field label="Estado">
                    <Select
                      value={trayectoActual.activo ? 'activo' : trayectoActual.completado ? 'completado' : 'programado'}
                      onChange={(_, d) => {
                        const val = d.value;
                        manejarCambio('activo', val === 'activo');
                        manejarCambio('completado', val === 'completado');
                        manejarCambio('programado', val === 'programado');
                      }}
                    >
                      <option value="programado">Programado</option>
                      <option value="activo">Activo</option>
                      <option value="completado">Completado</option>
                    </Select>
                  </Field>
                </div>
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
    </div>
  );
};

export default PaginaTrayectos;
