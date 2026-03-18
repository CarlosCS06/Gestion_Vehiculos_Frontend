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
import { crearConductorVacio } from '../models/Conductor.js';

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
  { nombre: 'DNI', campo: 'dni' },
  { nombre: 'Nombre', campo: 'nombre' },
  { nombre: 'Apellidos', campo: 'apellidos' },
  { nombre: 'Teléfono', campo: 'telefono' },
  { nombre: 'Dirección', campo: 'direccion' },
  { nombre: 'Trayectos', campo: 'trayectos' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaConductores = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  const [conductores, setConductores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [conductorActual, setConductorActual] = useState(crearConductorVacio());
  const [editando, setEditando] = useState(false);
  const [dniEliminar, setDniEliminar] = useState('');
  const [error, setError] = useState('');

  const cargarConductores = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerConductores();
      setConductores(datos);
    } catch {
      setError('Error al cargar los conductores');
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
    try {
      if (editando) {
        await actualizarConductor(conductorActual.dni, conductorActual);
      } else {
        await crearConductor(conductorActual);
      }
      setDialogoAbierto(false);
      cargarConductores();
      setError('');
    } catch (err) {
      setError(err.message);
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
                <TableCell>{conductor.nombre}</TableCell>
                <TableCell>{conductor.apellidos}</TableCell>
                <TableCell>{conductor.telefono}</TableCell>
                <TableCell>{conductor.direccion}</TableCell>
                <TableCell>{conductor.trayectos.length}</TableCell>
                <TableCell>
                  {esAdmin && (
                    <>
                      <Tooltip content="Editar" relationship="label">
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(conductor)} />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(conductor.dni)} />
                      </Tooltip>
                    </>
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
            <DialogTitle>{editando ? 'Editar conductor' : 'Dar de alta conductor'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <Field label="DNI" required>
                  <Input value={conductorActual.dni} onChange={(_, d) => manejarCambio('dni', d.value)} disabled={editando} placeholder="12345678A" />
                </Field>
                <div className={estilos.filaFormulario}>
                  <Field label="Nombre" required>
                    <Input value={conductorActual.nombre} onChange={(_, d) => manejarCambio('nombre', d.value)} placeholder="Carlos" />
                  </Field>
                  <Field label="Apellidos" required>
                    <Input value={conductorActual.apellidos} onChange={(_, d) => manejarCambio('apellidos', d.value)} placeholder="García López" />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Teléfono">
                    <Input value={conductorActual.telefono} onChange={(_, d) => manejarCambio('telefono', d.value)} placeholder="612345678" />
                  </Field>
                  <Field label="Dirección">
                    <Input value={conductorActual.direccion} onChange={(_, d) => manejarCambio('direccion', d.value)} placeholder="Calle Mayor 10" />
                  </Field>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar}>{editando ? 'Guardar cambios' : 'Dar de alta'}</Button>
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
