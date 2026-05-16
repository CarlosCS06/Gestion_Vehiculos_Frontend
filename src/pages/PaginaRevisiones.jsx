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
  Search24Regular,
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
import { formatForDate } from '../utils/dateUtils.js';

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
  panelItv: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalL,
  },
  contenedorTarjetasItv: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  tarjetaItv: {
    padding: tokens.spacingHorizontalM,
    borderLeftWidth: '4px',
    borderLeftStyle: 'solid',
    transition: 'all 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  vencida: {
    borderLeftColor: tokens.colorPaletteRedBorderActive,
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
  proxima: {
    borderLeftColor: tokens.colorPaletteYellowBorderActive,
    backgroundColor: tokens.colorPaletteYellowBackground1,
  },
  alDia: {
    borderLeftColor: tokens.colorPaletteGreenBorderActive,
    backgroundColor: tokens.colorPaletteGreenBackground1,
  },
  infoItv: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const columnas = [
  { nombre: 'Vehículo', campo: 'vehiculoMatricula' },
  { nombre: 'Fecha', campo: 'fecha' },
  { nombre: 'Lugar', campo: 'lugar' },
  { nombre: 'Coste', campo: 'costo' },
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
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [datosRevisiones, datosVehiculos] = await Promise.all([
        obtenerRevisiones(),
        obtenerVehiculos(),
      ]);
      setRevisiones(datosRevisiones);
      setVehiculos(datosVehiculos);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
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
        await actualizarRevision(revisionActual.id, { ...revisionActual, aprobada: false });
      } else {
        await crearRevision({ ...revisionActual, aprobada: false });
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

  const revisionesFiltradas = revisiones.filter(r => {
    if (filtroEstado === 'Aprobadas' && !r.aprobada) return false;
    if (filtroEstado === 'Pendientes' && r.aprobada) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    return (
      (r.id || '').toLowerCase().includes(term) ||
      (r.vehiculoMatricula || '').toLowerCase().includes(term) ||
      (r.lugar || '').toLowerCase().includes(term) ||
      (r.activo ? 'activa' : 'inactiva').includes(term) ||
      (r.aprobada ? 'aprobada' : 'pendiente').includes(term)
    );
  });

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando inspecciones..." />
      </div>
    );
  }

  // Identificar vehículos con ITV próxima o vencida
  const obtenerEstadoItv = (proximaItv) => {
    if (!proximaItv) return { estado: 'desconocido', color: 'subtle', texto: 'No definida' };
    
    // Si incluye (Pendiente), es una sugerencia basada en el año
    if (proximaItv.includes('(Pendiente)')) {
      const anio = parseInt(proximaItv);
      const anioActual = new Date().getFullYear();
      if (anio < anioActual) return { estado: 'vencida', color: 'danger', texto: 'Atrasada' };
      if (anio === anioActual) return { estado: 'proxima', color: 'warning', texto: 'Este año' };
      return { estado: 'alDia', color: 'success', texto: 'Al día' };
    }

    // Si es una fecha ISO
    const hoy = new Date();
    const fecha = new Date(proximaItv);
    if (isNaN(fecha.getTime())) return { estado: 'desconocido', color: 'subtle', texto: proximaItv };

    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    if (diferenciaDias < 0) return { estado: 'vencida', color: 'danger', texto: 'VENCIDA' };
    if (diferenciaDias < 30) return { estado: 'proxima', color: 'warning', texto: `En ${diferenciaDias} días` };
    return { estado: 'alDia', color: 'success', texto: 'Al día' };
  };

  const vehiculosConItv = vehiculos
    .map(v => ({ ...v, infoItv: obtenerEstadoItv(v.proximaItv) }))
    .sort((a, b) => {
      // Priorizar vencidas y próximas
      const prioridad = { 'vencida': 0, 'proxima': 1, 'alDia': 2, 'desconocido': 3 };
      return prioridad[a.infoItv.estado] - prioridad[b.infoItv.estado];
    });

  const itvsUrgentes = vehiculosConItv.filter(v => v.infoItv.estado !== 'alDia' && v.infoItv.estado !== 'desconocido');

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Wrench24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Gestión de Inspecciones ITV</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input 
            contentBefore={<Search24Regular />} 
            placeholder="Buscar inspección..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          <Select value={filtroEstado} onChange={(e, d) => setFiltroEstado(d.value)}>
            <option value="Todas">Todas</option>
            <option value="Aprobadas">Aprobadas</option>
            <option value="Pendientes">Pendientes</option>
          </Select>
          {esAdmin && (
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Registrar ITV pasada
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

      {/* Panel de Seguimiento ITV */}
      <div className={estilos.panelItv}>
        <Title2 size={400}>Seguimiento de Próximas Inspecciones</Title2>
        <div className={estilos.contenedorTarjetasItv}>
          {itvsUrgentes.length > 0 ? (
            itvsUrgentes.map(v => (
              <Card 
                key={v.matricula} 
                className={`${estilos.tarjetaItv} ${estilos[v.infoItv.estado]}`}
              >
                <div className={estilos.infoItv}>
                  <div>
                    <Text weight="bold" size={400}>{v.matricula}</Text>
                    <Text size={200} block>{v.marca} {v.modelo}</Text>
                  </div>
                  <Badge color={v.infoItv.color} appearance="filled">
                    {v.infoItv.texto}
                  </Badge>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text size={300} italic color="neutralTertiary">Próxima: {v.proximaItv}</Text>
                </div>
              </Card>
            ))
          ) : (
            <MessageBar intent="success">
              <MessageBarBody>Todas las inspecciones ITV están al día.</MessageBarBody>
            </MessageBar>
          )}
        </div>
      </div>

      <Title2 size={500}>Historial de Inspecciones Pasadas</Title2>

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
            {revisionesFiltradas.map((revision) => (
              <TableRow key={revision.id}>
                <TableCell>
                  <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                    {revision.vehiculoMatricula}
                  </Text>
                </TableCell>
                <TableCell>{new Date(revision.fecha).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>{revision.lugar}</TableCell>
                <TableCell>
                  <Text weight="semibold">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(revision.costo || 0)}
                  </Text>
                </TableCell>
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

      {/* Vista de Lista Móvil */}
      <div className={estilos.listaMovil}>
        {revisionesFiltradas.map((revision) => (
          <Card key={revision.id} className={estilos.tarjetaMovil}>
            <div className={estilos.tarjetaMovilCabecera}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Vehículo</Text>
                <Text size={400} weight="bold" style={{ color: tokens.colorBrandForeground1 }}>{revision.vehiculoMatricula}</Text>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Badge appearance="filled" color={revision.aprobada ? 'success' : 'danger'}>
                  {revision.aprobada ? 'Aprobada' : 'Pendiente'}
                </Badge>
                <Badge appearance="outline" color={revision.activo ? 'warning' : 'subtle'}>
                  {revision.activo ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </div>
            
            <div className={estilos.tarjetaMovilCuerpo}>
              <div>
                <div className={estilos.datoEtiqueta}>Fecha</div>
                <div className={estilos.datoValor}>{new Date(revision.fecha).toLocaleDateString('es-ES')}</div>
              </div>
              <div>
                <div className={estilos.datoEtiqueta}>Coste</div>
                <div className={estilos.datoValor}>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(revision.costo || 0)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className={estilos.datoEtiqueta}>Lugar</div>
                <div className={estilos.datoValor}>{revision.lugar}</div>
              </div>
            </div>

            {esAdmin && (
              <div className={estilos.accionesMovil}>
                <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(revision)}>
                  Editar
                </Button>
                <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(revision.id)}>
                  Borrar
                </Button>
              </div>
            )}
          </Card>
        ))}
        {revisiones.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay revisiones registradas</Text>
          </Card>
        )}
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '500px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar registro ITV' : 'Nuevo registro ITV'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <Field label="Vehículo" required>
                  <Select
                    value={revisionActual.vehiculoMatricula}
                    onChange={(_, d) => manejarCambio('vehiculoMatricula', d.value)}
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
                  <Input type="date" value={formatForDate(revisionActual.fecha)} onChange={(_, d) => manejarCambio('fecha', d.value)} />
                </Field>
                <Field label="Lugar" required>
                  <Input value={revisionActual.lugar} onChange={(_, d) => manejarCambio('lugar', d.value)} placeholder="Taller Central Madrid" />
                </Field>
                <div className={estilos.filaFormulario}>
                  <Field label="Coste (€)" required>
                    <Input 
                      type="number" 
                      value={revisionActual.costo} 
                      onChange={(_, d) => manejarCambio('costo', parseFloat(d.value) || 0)} 
                      contentBefore="€"
                    />
                  </Field>
                  <Field label="Activa">
                    <Switch checked={revisionActual.activo} onChange={(_, d) => manejarCambio('activo', d.checked)} />
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
