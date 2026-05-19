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
  Eye24Regular,
  EyeOff24Regular,
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
  { nombre: 'Descripción', campo: 'descripcion' },
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
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [mensajeCargando, setMensajeCargando] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [revisionActual, setRevisionActual] = useState(crearRevisionVacia());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [mostrarOcultos, setMostrarOcultos] = useState(false);

  // Función robusta para obtener la matrícula del vehículo asociado a la revisión
  const obtenerMatricula = (rev) => {
    if (!rev) return '';
    if (typeof rev.matricula === 'object' && rev.matricula !== null) {
      return rev.matricula.matricula || '';
    }
    return rev.vehiculoMatricula || rev.matricula || '';
  };
  const cargarDatos = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
    }
    try {
      const [datosRevisiones, datosVehiculos] = await Promise.all([
        obtenerRevisiones(),
        obtenerVehiculos(),
      ]);

      // Recuperar revisiones que el backend filtró por tener visible:false
      // Buscar en localStorage los IDs marcados como ocultos
      const idsOcultosLocal = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('revision_oculta_')) {
          idsOcultosLocal.push(key.replace('revision_oculta_', ''));
        }
      }

      // IDs que están en localStorage pero NO vinieron del backend → el backend los filtró
      const idsPresentes = new Set(datosRevisiones.map(r => r.id));
      const idsFaltantes = idsOcultosLocal.filter(id => !idsPresentes.has(id));

      if (idsFaltantes.length > 0) {
        // Restaurar cada revisión faltante en el backend con visible:true
        await Promise.all(
          idsFaltantes.map(id =>
            actualizarRevision(id, { visible: true }).catch(() => {
              // Si falla (revisión eliminada, etc.), limpiar su marca local
              localStorage.removeItem(`revision_oculta_${id}`);
            })
          )
        );
        // Recargar para obtener las revisiones restauradas
        const [datosRecuperados, datosVeh2] = await Promise.all([
          obtenerRevisiones(),
          obtenerVehiculos(),
        ]);
        setRevisiones(datosRecuperados);
        setVehiculos(datosVeh2);
      } else {
        setRevisiones(datosRevisiones);
        setVehiculos(datosVehiculos);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
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
    setRevisionActual({ 
      ...revision,
      vehiculoMatricula: obtenerMatricula(revision),
      visible: obtenerVisibleRevision(revision)
    });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    // --- VALIDACIONES DE FORMULARIO ---
    const errores = {};
    if (!revisionActual.vehiculoMatricula) errores.vehiculoMatricula = 'Debe seleccionar un vehículo.';
    if (!revisionActual.descripcion || revisionActual.descripcion.trim() === '') errores.descripcion = 'La descripción es obligatoria.';
    if (!revisionActual.fecha) errores.fecha = 'La fecha es obligatoria.';

    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      return;
    }
    setErroresValidacion({});
    // --- FIN VALIDACIONES ---

    // Formatear los datos según la plantilla del backend
    const datosGuardar = {
      descripcion: revisionActual.descripcion ? revisionActual.descripcion.trim() : null,
      lugar: revisionActual.lugar && revisionActual.lugar.trim() !== '' ? revisionActual.lugar.trim() : null,
      aprobada: revisionActual.aprobada ?? false,
      fecha: revisionActual.fecha || null,
      costo: (revisionActual.costo !== '' && revisionActual.costo !== null && !isNaN(revisionActual.costo)) ? parseFloat(revisionActual.costo) : null,
      visible: true, // Siempre true en backend para que no filtre; visibilidad gestionada en localStorage
      vehiculoMatricula: revisionActual.vehiculoMatricula || null,
      viajeId: revisionActual.viajeId || null,
      plantillaId: revisionActual.plantillaId || null,
      kilometrosActuales: revisionActual.kilometrosActuales ? parseInt(revisionActual.kilometrosActuales, 10) : null,
      esItv: revisionActual.esItv ?? false,
      activo: revisionActual.activo ?? false,
    };

    setMensajeCargando(editando ? 'Guardando cambios...' : 'Creando revisión...');
    setGuardando(true);
    setDialogoAbierto(false);
    try {
      if (editando) {
        await actualizarRevision(revisionActual.id, datosGuardar);
        // Sincronizar visibilidad local
        if (revisionActual.visible === false) {
          localStorage.setItem(`revision_oculta_${revisionActual.id}`, 'true');
        } else {
          localStorage.removeItem(`revision_oculta_${revisionActual.id}`);
        }
      } else {
        await crearRevision(datosGuardar);
      }
      await cargarDatos(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    setMensajeCargando('Eliminando revisión...');
    setEliminando(true);
    setConfirmacionAbierta(false);
    try {
      await eliminarRevision(idEliminar);
      await cargarDatos(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
    }
  };

  const obtenerVisibleRevision = (r) => {
    if (localStorage.getItem(`revision_oculta_${r.id}`) === 'true') {
      return false;
    }
    return r.visible !== false && r.visible !== 'false' && r.visible !== 0 && r.visible !== '0';
  };

  const manejarToggleVisibilidad = (revision) => {
    // Gestión de visibilidad 100% local (localStorage), sin llamar al backend
    // para evitar que el backend filtre y no devuelva las revisiones ocultas
    const esVisibleActual = obtenerVisibleRevision(revision);
    if (esVisibleActual) {
      localStorage.setItem(`revision_oculta_${revision.id}`, 'true');
    } else {
      localStorage.removeItem(`revision_oculta_${revision.id}`);
    }
    // Forzar re-render actualizando el array de revisiones con una copia
    setRevisiones(prev => [...prev]);
  };

  const manejarCambio = (campo, valor) => {
    setRevisionActual((prev) => ({ ...prev, [campo]: valor }));
  };

  const revisionesFiltradas = revisiones.filter(r => {
    const esVisible = obtenerVisibleRevision(r);
    if (!mostrarOcultos && !esVisible) return false;

    if (filtroEstado === 'Aprobadas' && !r.aprobada) return false;
    if (filtroEstado === 'Pendientes' && r.aprobada) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    return (
      (r.id || '').toLowerCase().includes(term) ||
      obtenerMatricula(r).toLowerCase().includes(term) ||
      (r.descripcion || '').toLowerCase().includes(term) ||
      (r.lugar || '').toLowerCase().includes(term) ||
      (r.activo ? 'activa' : 'inactiva').includes(term) ||
      (r.aprobada ? 'aprobada' : 'pendiente').includes(term)
    );
  });

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando revisiones..." />
      </div>
    );
  }

  // Identificar revisiones programadas o vencidas
  const obtenerInfoRevisionProxima = (r) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(r.fecha);
    const diferenciaDias = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
    const tipoText = r.esItv ? 'ITV' : 'Revisión';
    
    if (diferenciaDias < 0) {
      return {
        estado: 'vencida',
        color: 'danger',
        texto: `Atrasada (${Math.abs(diferenciaDias)} días)`,
        tipoText
      };
    }
    if (diferenciaDias < 30) {
      return {
        estado: 'proxima',
        color: 'warning',
        texto: diferenciaDias === 0 ? 'Hoy' : `En ${diferenciaDias} días`,
        tipoText
      };
    }
    return {
      estado: 'alDia',
      color: 'success',
      texto: `En ${diferenciaDias} días`,
      tipoText
    };
  };

  const hoyFecha = new Date();
  hoyFecha.setHours(0, 0, 0, 0);

  const revisionesUrgentes = revisiones
    .filter(r => {
      if (!r.fecha) return false;
      const fechaRev = new Date(r.fecha);
      const esFutura = fechaRev >= hoyFecha;
      const esVencida = fechaRev < hoyFecha && !r.aprobada;
      return (esFutura || esVencida) && obtenerVisibleRevision(r);
    })
    .map(r => {
      const mat = obtenerMatricula(r);
      const vAsociado = vehiculos.find(v => v.matricula?.trim().toUpperCase() === mat.trim().toUpperCase());
      return {
        ...r,
        info: obtenerInfoRevisionProxima(r),
        modeloVehiculo: vAsociado ? `${vAsociado.marca} ${vAsociado.modelo}` : 'Vehículo'
      };
    })
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Wrench24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Gestión de Revisiones e ITV</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input 
            contentBefore={<Search24Regular />} 
            placeholder="Buscar revisión..." 
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
            <>
              <ToolbarButton
                icon={mostrarOcultos ? <Eye24Regular /> : <EyeOff24Regular />}
                onClick={() => setMostrarOcultos(!mostrarOcultos)}
              >
                {mostrarOcultos ? 'Ocultar invisibles' : 'Mostrar ocultas'}
              </ToolbarButton>
              <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
                Agregar revisión
              </ToolbarButton>
            </>
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

      {/* Panel de Seguimiento Revisiones */}
      <div className={estilos.panelItv}>
        <Title2 size={400}>Seguimiento de Próximas Revisiones</Title2>
        <div className={estilos.contenedorTarjetasItv}>
          {revisionesUrgentes.length > 0 ? (
            revisionesUrgentes.map(r => (
              <Card 
                key={r.id || r.fecha + obtenerMatricula(r)} 
                className={`${estilos.tarjetaItv} ${estilos[r.info.estado]}`}
              >
                <div className={estilos.infoItv}>
                  <div>
                    <Text weight="bold" size={400}>{obtenerMatricula(r)}</Text>
                    <Text size={200} block>{r.modeloVehiculo}</Text>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <Badge color={r.info.color} appearance="filled">
                      {r.info.texto}
                    </Badge>
                    <Badge appearance="outline">
                      {r.info.tipoText}
                    </Badge>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text size={300} weight="semibold" block>{r.descripcion}</Text>
                  <Text size={200} italic color="neutralTertiary">Programada: {new Date(r.fecha).toLocaleDateString('es-ES')}</Text>
                </div>
              </Card>
            ))
          ) : (
            <MessageBar intent="success">
              <MessageBarBody>No hay revisiones programadas o pendientes.</MessageBarBody>
            </MessageBar>
          )}
        </div>
      </div>

      <Title2 size={500}>Revisiones</Title2>

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
            {revisionesFiltradas.map((revision) => {
              const esOculta = !obtenerVisibleRevision(revision);
              return (
                <TableRow 
                  key={revision.id} 
                  style={esOculta ? { opacity: 0.6, backgroundColor: tokens.colorNeutralBackground3 } : undefined}
                >
                <TableCell>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <Text weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                      {obtenerMatricula(revision)}
                    </Text>
                    {(() => {
                      const mat = obtenerMatricula(revision);
                      const v = vehiculos.find(veh => veh.matricula?.trim().toUpperCase() === mat.trim().toUpperCase());
                      return v ? <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{v.marca} {v.modelo}</Text> : null;
                    })()}
                  </div>
                </TableCell>
                <TableCell>{revision.descripcion || '—'}</TableCell>
                <TableCell>{new Date(revision.fecha).toLocaleDateString('es-ES')}</TableCell>
                <TableCell>{revision.lugar || '—'}</TableCell>
                <TableCell>
                  <Text weight="semibold">
                    {revision.costo !== null && revision.costo !== undefined 
                      ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(revision.costo) 
                      : '—'}
                  </Text>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <Badge appearance="filled" color={revision.activo ? 'warning' : 'subtle'}>
                      {revision.activo ? 'Sí' : 'No'}
                    </Badge>
                    {!obtenerVisibleRevision(revision) && (
                      <Badge appearance="filled" color="severe">Oculta</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge appearance="filled" color={revision.aprobada ? 'success' : 'danger'}>
                    {revision.aprobada ? 'Aprobada' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {esAdmin && (
                    <>
                      {(() => {
                        const esOculta = !obtenerVisibleRevision(revision);
                        return (
                          <Tooltip content={esOculta ? "Mostrar en lista" : "Ocultar en lista"} relationship="label">
                            <Button 
                              icon={esOculta ? <Eye24Regular /> : <EyeOff24Regular />} 
                              appearance="subtle" 
                              size="small" 
                              onClick={() => manejarToggleVisibilidad(revision)} 
                            />
                          </Tooltip>
                        );
                      })()}
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
            ); })}
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
        {revisionesFiltradas.map((revision) => {
          const esOculta = !obtenerVisibleRevision(revision);
          return (
            <Card 
              key={revision.id} 
              className={estilos.tarjetaMovil}
              style={esOculta ? { opacity: 0.6, backgroundColor: tokens.colorNeutralBackground3 } : undefined}
            >
            <div className={estilos.tarjetaMovilCabecera}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Vehículo</Text>
                <Text size={400} weight="bold" style={{ color: tokens.colorBrandForeground1 }}>{obtenerMatricula(revision)}</Text>
                {(() => {
                  const mat = obtenerMatricula(revision);
                  const v = vehiculos.find(veh => veh.matricula?.trim().toUpperCase() === mat.trim().toUpperCase());
                  return v ? <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{v.marca} {v.modelo}</Text> : null;
                })()}
              </div>
              <div style={{ display: 'flex', gap: '4px', flexDirection: 'column', alignItems: 'flex-end' }}>
                <Badge appearance="filled" color={revision.aprobada ? 'success' : 'danger'}>
                  {revision.aprobada ? 'Aprobada' : 'Pendiente'}
                </Badge>
                <Badge appearance="outline" color={revision.activo ? 'warning' : 'subtle'}>
                  {revision.activo ? 'Activa' : 'Inactiva'}
                </Badge>
                {!obtenerVisibleRevision(revision) && (
                  <Badge appearance="filled" color="severe">Oculta</Badge>
                )}
              </div>
            </div>
            
            <div className={estilos.tarjetaMovilCuerpo}>
              <div style={{ gridColumn: 'span 2' }}>
                <div className={estilos.datoEtiqueta}>Descripción</div>
                <div className={estilos.datoValor}>{revision.descripcion || '—'}</div>
              </div>
              <div>
                <div className={estilos.datoEtiqueta}>Fecha</div>
                <div className={estilos.datoValor}>{new Date(revision.fecha).toLocaleDateString('es-ES')}</div>
              </div>
              <div>
                <div className={estilos.datoEtiqueta}>Coste</div>
                <div className={estilos.datoValor}>
                  {revision.costo !== null && revision.costo !== undefined 
                    ? new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(revision.costo) 
                    : '—'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className={estilos.datoEtiqueta}>Lugar</div>
                <div className={estilos.datoValor}>{revision.lugar || '—'}</div>
              </div>
            </div>

            {esAdmin && (
              <div className={estilos.accionesMovil}>
                {(() => {
                  const esOculta = !obtenerVisibleRevision(revision);
                  return (
                    <Button 
                      icon={esOculta ? <Eye24Regular /> : <EyeOff24Regular />} 
                      appearance="subtle" 
                      onClick={() => manejarToggleVisibilidad(revision)}
                    >
                      {esOculta ? 'Mostrar' : 'Ocultar'}
                    </Button>
                  );
                })()}
                <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(revision)}>
                  Editar
                </Button>
                <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(revision.id)}>
                  Borrar
                </Button>
              </div>
            )}
          </Card>
        ); })}
        {revisiones.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay revisiones registradas</Text>
          </Card>
        )}
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '500px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar revisión' : 'Nueva revisión'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <Field label="Vehículo" required validationState={erroresValidacion?.vehiculoMatricula ? 'error' : undefined} validationMessage={erroresValidacion?.vehiculoMatricula}>
                  {editando ? (
                    (() => {
                      const vAsociado = vehiculos.find(v => v.matricula?.trim().toUpperCase() === revisionActual.vehiculoMatricula?.trim().toUpperCase());
                      const displayVal = vAsociado 
                        ? `${revisionActual.vehiculoMatricula} - ${vAsociado.marca} ${vAsociado.modelo}`
                        : revisionActual.vehiculoMatricula;
                      return <Input value={displayVal || ''} disabled />;
                    })()
                  ) : (
                    <Select
                      value={revisionActual.vehiculoMatricula || ''}
                      onChange={(_, d) => { manejarCambio('vehiculoMatricula', d.value); setErroresValidacion(prev => ({...prev, vehiculoMatricula: undefined})); }}
                    >
                      <option value="">Seleccionar vehículo...</option>
                      {vehiculos.map((v) => (
                        <option key={v.matricula} value={v.matricula}>
                          {v.matricula} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
                <Field label="Descripción" required validationState={erroresValidacion?.descripcion ? 'error' : undefined} validationMessage={erroresValidacion?.descripcion}>
                  <Input 
                    value={revisionActual.descripcion || ''} 
                    onChange={(_, d) => { manejarCambio('descripcion', d.value); setErroresValidacion(prev => ({...prev, descripcion: undefined})); }} 
                    placeholder="Ej: Revisión rutinaria de filtros e ITV" 
                  />
                </Field>
                <Field label="Fecha" required validationState={erroresValidacion?.fecha ? 'error' : undefined} validationMessage={erroresValidacion?.fecha}>
                  <Input type="date" value={formatForDate(revisionActual.fecha)} onChange={(_, d) => { manejarCambio('fecha', d.value); setErroresValidacion(prev => ({...prev, fecha: undefined})); }} />
                </Field>
                <div className={estilos.filaFormulario}>
                  <Field label="Lugar">
                    <Input value={revisionActual.lugar || ''} onChange={(_, d) => manejarCambio('lugar', d.value)} placeholder="Taller Central Madrid" />
                  </Field>
                  <Field label="Coste (€)">
                    <Input 
                      type="number" 
                      value={revisionActual.costo ?? ''} 
                      onChange={(_, d) => manejarCambio('costo', d.value === '' ? '' : parseFloat(d.value))} 
                      contentBefore="€"
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Activa">
                    <Switch checked={revisionActual.activo} onChange={(_, d) => manejarCambio('activo', d.checked)} />
                  </Field>
                  <Field label="Visible">
                    <Switch checked={revisionActual.visible !== false} onChange={(_, d) => manejarCambio('visible', d.checked)} />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Aprobada">
                    <Switch checked={revisionActual.aprobada} onChange={(_, d) => manejarCambio('aprobada', d.checked)} />
                  </Field>
                  <Field label="Es ITV">
                    <Switch checked={revisionActual.esItv} onChange={(_, d) => manejarCambio('esItv', d.checked)} />
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
            label={mensajeCargando || "Cargando..."} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaRevisiones;
