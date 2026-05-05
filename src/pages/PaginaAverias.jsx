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
  Badge,
  Checkbox,
  Select,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Warning24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerAverias,
  crearAveria,
  actualizarAveria,
  eliminarAveria,
} from '../services/servicioAverias.js';
import { obtenerVehiculos, actualizarVehiculo } from '../services/servicioVehiculos.js';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';
import { crearAveriaVacia } from '../models/Averia.js';

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
  { nombre: 'Descripción', campo: 'descripcion' },
  { nombre: 'Vehículos afectados', campo: 'vehiculosAveriados' },
  { nombre: 'Conductor', campo: 'conductorDNI' },
  { nombre: 'Fecha avería', campo: 'fechaAveria' },
  { nombre: 'Fecha comienzo reparación', campo: 'fechaComienzoReparacion' },
  { nombre: 'Fecha fin reparación', campo: 'fechaFinReparacion' },
  { nombre: 'Lugar reparación', campo: 'lugarReparacion' },
  { nombre: 'Coste reparación', campo: 'costeReparacion' },
  { nombre: 'Estado', campo: 'estado' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaAverias = () => {
  const estilos = useEstilos();
  const { esAdmin, usuario } = useAuth();

  const [averias, setAverias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [averiaActual, setAveriaActual] = useState(crearAveriaVacia());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [vehiculosTexto, setVehiculosTexto] = useState('');
  const [listaVehiculos, setListaVehiculos] = useState([]);

  const cargarAverias = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerAverias();
      setAverias(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar las averías');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarAverias();
    obtenerVehiculos().then(setListaVehiculos).catch(console.error);
  }, [cargarAverias]);

  const abrirDialogoCrear = () => {
    const nueva = crearAveriaVacia();
    if (!esAdmin) {
      nueva.conductorDNI = usuario.dni;
      nueva.fechaAveria = new Date().toISOString().split('T')[0];
    }
    setAveriaActual(nueva);
    setVehiculosTexto('');
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (averia) => {
    setAveriaActual({ ...averia });
    setVehiculosTexto(averia.vehiculosAveriados.join(', '));
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    try {
      const datosGuardar = {
        ...averiaActual,
        vehiculosAveriados: vehiculosTexto.split(',').map((v) => v.trim()).filter(Boolean),
      };
      if (editando) {
        await actualizarAveria(averiaActual.id, datosGuardar);
      } else {
        await crearAveria(datosGuardar);
      }

      // Lógica de automatización de estado del vehículo
      const nuevoEstado = (datosGuardar.fechaFinReparacion || !datosGuardar.enReparacion && datosGuardar.fechaFinReparacion) 
        ? ESTADO_VEHICULO.DISPONIBLE 
        : ESTADO_VEHICULO.AVERIADO;

      // Si tiene fecha de fin de reparación, vuelve a estar disponible
      const estadoFinal = datosGuardar.fechaFinReparacion ? ESTADO_VEHICULO.DISPONIBLE : ESTADO_VEHICULO.AVERIADO;

      for (const matricula of datosGuardar.vehiculosAveriados) {
        await actualizarVehiculo(matricula, { estado: estadoFinal });
      }

      setDialogoAbierto(false);
      cargarAverias();
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
      const averiaAEliminar = averias.find(a => a.id === idEliminar);
      await eliminarAveria(idEliminar);
      
      // Al eliminar la avería, los vehículos vuelven a estar disponibles (según petición usuario)
      if (averiaAEliminar) {
        for (const matricula of averiaAEliminar.vehiculosAveriados) {
          await actualizarVehiculo(matricula, { estado: ESTADO_VEHICULO.DISPONIBLE });
        }
      }

      setConfirmacionAbierta(false);
      cargarAverias();
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambio = (campo, valor) => {
    setAveriaActual((prev) => ({ ...prev, [campo]: valor }));
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando averías..." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Warning24Regular style={{ fontSize: '28px', color: '#d13438' }} />
          <Title2>Averías</Title2>
        </div>
        <Toolbar>
          <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
            {esAdmin ? 'Registrar avería' : 'Reportar incidencia'}
          </ToolbarButton>
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
        <Table style={{ minWidth: '800px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {averias.map((averia) => (
              <TableRow key={averia.id}>
                <TableCell><strong>{averia.id}</strong></TableCell>
                <TableCell>{averia.descripcion}</TableCell>
                <TableCell>
                  {averia.vehiculosAveriados.map((matricula) => (
                    <Badge key={matricula} appearance="outline" style={{ marginRight: '4px' }}>
                      {matricula}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{averia.conductorDNI || '—'}</TableCell>
                <TableCell>
                  {averia.fechaAveria
                    ? new Date(averia.fechaAveria).toLocaleDateString('es-ES')
                    : '—'
                  }
                </TableCell>
                <TableCell>
                  {averia.fechaComienzoReparacion
                    ? new Date(averia.fechaComienzoReparacion).toLocaleDateString('es-ES')
                    : '—'
                  }
                </TableCell>
                <TableCell>
                  {averia.fechaFinReparacion
                    ? new Date(averia.fechaFinReparacion).toLocaleDateString('es-ES')
                    : (averia.enReparacion ? <Badge appearance="outline" color="warning">En taller</Badge> : '—')
                  }
                </TableCell>
                <TableCell>{averia.lugarReparacion || '—'}</TableCell>
                <TableCell>
                  {averia.costeReparacion ? `${averia.costeReparacion} €` : '—'}
                </TableCell>
                <TableCell>
                  {averia.fechaFinReparacion ? (
                    <Badge appearance="filled" color="success">Reparado</Badge>
                  ) : averia.enReparacion ? (
                    <Badge appearance="filled" color="warning">En reparación</Badge>
                  ) : (
                    <Badge appearance="filled" color="danger">Sin reparar</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {esAdmin && (
                    <>
                      <Tooltip content="Editar" relationship="label">
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(averia)} />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(averia.id)} />
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {averias.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay averías registradas</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '550px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar avería' : 'Registrar avería'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                {esAdmin ? (
                  <>
                    <Field label="Descripción" required>
                      <Input value={averiaActual.descripcion} onChange={(_, d) => manejarCambio('descripcion', d.value)} placeholder="Describe la avería..." />
                    </Field>
                    <Field label="Matrículas afectadas (separadas por comas)" required>
                      <Input value={vehiculosTexto} onChange={(_, d) => setVehiculosTexto(d.value)} placeholder="1234-ABC, 5678-DEF" />
                    </Field>
                    <div className={estilos.filaFormulario}>
                      <Field label="Fecha avería">
                        <Input type="date" value={averiaActual.fechaAveria} onChange={(_, d) => manejarCambio('fechaAveria', d.value)} />
                      </Field>
                      <Field label="Conductor">
                        <Input value={averiaActual.conductorDNI} onChange={(_, d) => manejarCambio('conductorDNI', d.value)} placeholder="DNI..." />
                      </Field>
                      <Field label="Fecha comienzo reparación">
                        <Input type="date" value={averiaActual.fechaComienzoReparacion} onChange={(_, d) => manejarCambio('fechaComienzoReparacion', d.value)} />
                      </Field>
                      <Field label="Fecha fin reparación">
                        <Input type="date" value={averiaActual.fechaFinReparacion} onChange={(_, d) => manejarCambio('fechaFinReparacion', d.value)} />
                      </Field>
                      <Field label="Lugar reparación">
                        <Input value={averiaActual.lugarReparacion} onChange={(_, d) => manejarCambio('lugarReparacion', d.value)} placeholder="Taller Central" />
                      </Field>
                      <Field label="Coste reparación">
                        <Input value={averiaActual.costeReparacion} onChange={(_, d) => manejarCambio('costeReparacion', d.value)} placeholder="1000" />
                      </Field>
                    </div>
                    <Field>
                      <Checkbox
                        label="¿Está actualmente en reparación?"
                        checked={averiaActual.enReparacion}
                        onChange={(_, d) => manejarCambio('enReparacion', !!d.checked)}
                      />
                    </Field>
                  </>
                ) : (
                  <>
                    <MessageBar intent="info">
                      <MessageBarBody>Reporta cualquier incidencia detectada en el vehículo. El administrador recibirá tu aviso.</MessageBarBody>
                    </MessageBar>
                    <Field label="Vehículo" required>
                      <Select
                        value={vehiculosTexto}
                        onChange={(_, d) => setVehiculosTexto(d.value)}
                      >
                        <option value="">Selecciona el vehículo...</option>
                        {listaVehiculos.map(v => (
                          <option key={v.matricula} value={v.matricula}>{v.matricula} - {v.marca} {v.modelo}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Descripción de la incidencia" required>
                      <Input
                        value={averiaActual.descripcion}
                        onChange={(_, d) => manejarCambio('descripcion', d.value)}
                        placeholder="Ej: El motor hace un ruido extraño al arrancar..."
                        textarea
                      />
                    </Field>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <Text size={200}><b>Conductor:</b> {usuario.dni}</Text>
                      <Text size={200}><b>Fecha:</b> {new Date().toLocaleDateString()}</Text>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar}>{editando ? 'Guardar cambios' : 'Registrar avería'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar avería"
        mensaje={`¿Estás seguro de que deseas eliminar la avería ${idEliminar}?`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setConfirmacionAbierta(false)}
      />
    </div>
  );
};

export default PaginaAverias;
