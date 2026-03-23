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
  Badge,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Text,
  Switch,
  Toolbar,
  ToolbarButton,
  Select,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Wrench24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerRevisiones,
  crearRevision,
  actualizarRevision,
  eliminarRevision,
} from '../services/servicioRevisiones.js';
import { obtenerVehiculos } from '../services/servicioVehiculos.js';
import { crearRevisionVacia } from '../models/Revision.js';

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

const columnas = [
  { nombre: 'ID', campo: 'id' },
  { nombre: 'Vehículo', campo: 'matricula' },
  { nombre: 'Fecha', campo: 'fecha' },
  { nombre: 'Lugar', campo: 'lugar' },
  { nombre: 'Activa', campo: 'activo' },
  { nombre: 'Aprobada', campo: 'aprobada' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaRevisiones = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  const [revisiones, setRevisiones] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [revisionActual, setRevisionActual] = useState(crearRevisionVacia());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [datosRevisiones, datosVehiculos] = await Promise.all([
        obtenerRevisiones(),
        obtenerVehiculos(),
      ]);
      setRevisiones(datosRevisiones);
      setVehiculos(datosVehiculos);
    } catch {
      setError('Error al cargar los datos');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirDialogoCrear = () => {
    setRevisionActual(crearRevisionVacia());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (revision) => {
    setRevisionActual({ ...revision });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    try {
      if (editando) {
        await actualizarRevision(revisionActual.id, revisionActual);
      } else {
        await crearRevision(revisionActual);
      }
      setDialogoAbierto(false);
      cargarDatos();
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
      await eliminarRevision(idEliminar);
      setConfirmacionAbierta(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambio = (campo, valor) => {
    setRevisionActual((prev) => ({ ...prev, [campo]: valor }));
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando revisiones..." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Wrench24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Revisiones</Title2>
        </div>
        {esAdmin && (
          <Toolbar>
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Añadir revisión
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
        <Table style={{ minWidth: '600px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {revisiones.map((revision) => (
              <TableRow key={revision.id}>
                <TableCell><strong>{revision.id}</strong></TableCell>
                <TableCell>
                  <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                    {revision.matricula}
                  </Text>
                </TableCell>
                <TableCell>{new Date(revision.fecha).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>{revision.lugar}</TableCell>
                <TableCell>
                  <Badge appearance="filled" color={revision.activo ? 'warning' : 'subtle'}>
                    {revision.activo ? 'Sí' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge appearance="filled" color={revision.aprobada ? 'success' : 'danger'}>
                    {revision.aprobada ? 'Aprobada' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {esAdmin && (
                    <>
                      <Tooltip content="Editar" relationship="label">
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(revision)} />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(revision.id)} />
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {revisiones.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay revisiones registradas</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '500px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar revisión' : 'Nueva revisión'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <Field label="Vehículo" required>
                  <Select
                    value={revisionActual.matricula}
                    onChange={(_, d) => manejarCambio('matricula', d.value)}
                    disabled={editando}
                  >
                    <option value="">Seleccionar vehículo...</option>
                    {vehiculos.map((v) => (
                      <option key={v.matricula} value={v.matricula}>
                        {v.matricula} - {v.marca} {v.modelo}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Fecha" required>
                  <Input type="date" value={revisionActual.fecha} onChange={(_, d) => manejarCambio('fecha', d.value)} />
                </Field>
                <Field label="Lugar" required>
                  <Input value={revisionActual.lugar} onChange={(_, d) => manejarCambio('lugar', d.value)} placeholder="Taller Central Madrid" />
                </Field>
                <div className={estilos.filaFormulario}>
                  <Field label="Activa">
                    <Switch checked={revisionActual.activo} onChange={(_, d) => manejarCambio('activo', d.checked)} />
                  </Field>
                  <Field label="Aprobada">
                    <Switch checked={revisionActual.aprobada} onChange={(_, d) => manejarCambio('aprobada', d.checked)} />
                  </Field>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar}>{editando ? 'Guardar cambios' : 'Crear revisión'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar revisión"
        mensaje={`¿Estás seguro de que deseas eliminar la revisión ${idEliminar}?`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setConfirmacionAbierta(false)}
      />
    </div>
  );
};

export default PaginaRevisiones;
