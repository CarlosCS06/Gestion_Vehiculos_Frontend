import { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Divider,
  Caption1,
  Subtitle2,
  Checkbox,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  VehicleBus24Regular,
  ChevronDown24Regular,
  ChevronRight24Regular,
  Subtract24Regular,
  Location24Regular,
  ArrowRight16Regular,
  Eye24Regular,
  EyeOff24Regular,
  Search24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerViajes,
  crearViaje,
  actualizarViaje,
  eliminarViaje,
} from '../services/servicioViajes.js';
import { 
  actualizarTrayecto, 
  eliminarTrayecto, 
  crearTrayecto 
} from '../services/servicioTrayectos.js';
import { obtenerVehiculos, actualizarVehiculo } from '../services/servicioVehiculos.js';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';
import { crearViajeVacio, crearTrayectoDeViajeVacio, ESTADO_VIAJE, normalizarEstadoViaje } from '../models/Viaje.js';

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
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalM,
    '& > *': {
      flex: '1 1 200px',
      minWidth: '200px',
    },
  },
  filaExpandible: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  subTablaContenedor: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: tokens.spacingHorizontalL,
    borderRadius: tokens.borderRadiusMedium,
  },
  trayectoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} 0`,
  },
  seccionTrayectos: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    marginTop: tokens.spacingVerticalS,
  },
  trayectoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingHorizontalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  trayectoCardCabecera: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  botonAnadirTrayecto: {
    alignSelf: 'flex-start',
    marginTop: tokens.spacingVerticalXS,
  },
  rutaVisual: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
    padding: `${tokens.spacingVerticalXS} 0`,
  },
  puntoRuta: {
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorBrandForeground1,
  },
});

const obtenerBadgeEstadoViaje = (estado) => {
  const estadoNormalizado = normalizarEstadoViaje(estado);
  switch (estadoNormalizado) {
    case ESTADO_VIAJE.EN_CURSO:
      return <Badge appearance="filled" color="warning">En curso</Badge>;
    case ESTADO_VIAJE.COMPLETADO:
      return <Badge appearance="filled" color="success">Completado</Badge>;
    default:
      return <Badge appearance="filled" color="informative">Pendiente</Badge>;
  }
};

const calcularTotales = (trayectos) => {
  const kmTotales = trayectos.reduce((sum, t) => sum + (t.distanciaEnKm || 0), 0);
  return { kmTotales };
};

const construirRutaTexto = (trayectos) => {
  if (!trayectos || trayectos.length === 0) return [];
  const puntos = [trayectos[0].origen];
  trayectos.forEach((t) => {
    if (t.destino) puntos.push(t.destino);
  });
  return puntos.filter(Boolean);
};

const obtenerTextoConductor = (conductor) => {
  if (typeof conductor === 'object' && conductor !== null) {
    return `${conductor.nombre || ''} ${conductor.apellidos || ''}`.trim() || conductor.dni || 'Sin asignar';
  }
  return conductor || 'Sin asignar';
};

const obtenerTextoMatricula = (matricula) => {
  if (typeof matricula === 'object' && matricula !== null) {
    return matricula.matricula || '—';
  }
  return matricula || '—';
};

const columnas = [
  { nombre: '', campo: 'expandir' },
  { nombre: 'Descripción', campo: 'descripcion' },
  { nombre: 'Vehículo', campo: 'matricula' },
  { nombre: 'Conductor', campo: 'conductor' },
  { nombre: 'Fecha', campo: 'fecha' },
  { nombre: 'Trayectos', campo: 'numTrayectos' },
  { nombre: 'Km totales', campo: 'kmTotales' },
  { nombre: 'Gasto total', campo: 'gastoTotal' },
  { nombre: 'Estado', campo: 'estado' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaViajes = () => {
  const estilos = useEstilos();
  const { esAdmin, usuario } = useAuth();

  const [viajes, setViajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [viajeActual, setViajeActual] = useState(crearViajeVacio());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [expandidos, setExpandidos] = useState({});
  const [listaVehiculos, setListaVehiculos] = useState([]);
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const navegar = useNavigate();

  // Estados para eliminación de trayectos
  const [confirmacionTrayectoAbierta, setConfirmacionTrayectoAbierta] = useState(false);
  const [trayectoEliminarId, setTrayectoEliminarId] = useState('');
  
  // Función para asegurar la integridad de la cadena de trayectos
  const sincronizarCadenaTrayectos = (trayectos) => {
    if (!trayectos || trayectos.length <= 1) return trayectos;
    
    const nuevos = [...trayectos.map(t => ({ ...t }))];
    for (let i = 0; i < nuevos.length - 1; i++) {
      // El origen del siguiente trayecto DEBE ser el destino del actual
      if (nuevos[i].destino !== nuevos[i + 1].origen) {
        console.log(`Sincronizando cadena: Trayecto ${i+2} origen ajustado a ${nuevos[i].destino}`);
        nuevos[i + 1].origen = nuevos[i].destino;
      }
    }
    return nuevos;
  };

  const cargarViajes = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerViajes();
      
      // Filtrar duplicados por ID (evitar el problema reportado por el usuario)
      const idsVistos = new Set();
      const datosUnicos = datos.filter(v => {
        if (!v.id || idsVistos.has(v.id)) return false;
        idsVistos.add(v.id);
        return true;
      });

      const filtrados = (esAdmin ? datosUnicos : datosUnicos.filter(v => {
        const conductorObj = v.conductor;
        const conductorDni = (typeof conductorObj === 'object' && conductorObj !== null) ? conductorObj.dni : conductorObj;
        return conductorDni === usuario?.dni;
      })).map(viaje => {
        // LIMPIEZA AGRESIVA: Filtrar trayectos duplicados dentro de cada viaje
        const trayectosIdsVistos = new Set();
        const trayectosUnicos = (viaje.trayectos || []).filter(t => {
          if (!t.id) return true; // Si no tiene ID (nuevo), lo dejamos
          if (trayectosIdsVistos.has(t.id)) return false;
          trayectosIdsVistos.add(t.id);
          return true;
        });
        return {
          ...viaje,
          estado: normalizarEstadoViaje(viaje.estado),
          trayectos: trayectosUnicos,
        };
      });
      setViajes(filtrados);
    } catch (err) {
      setError(err.message || 'Error al cargar los viajes');
    }
    setCargando(false);
  }, [esAdmin, usuario?.dni]);

  const confirmarEliminarTrayecto = (id) => {
    setTrayectoEliminarId(id);
    setConfirmacionTrayectoAbierta(true);
  };

  const manejarEliminarTrayecto = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await eliminarTrayecto(trayectoEliminarId);
      setConfirmacionTrayectoAbierta(false);
      setTrayectoEliminarId('');
      await cargarViajes();
      setError('');
    } catch (err) {
      console.error('Error eliminando trayecto:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  useEffect(() => {
    cargarViajes();
    // Cargamos lista de vehículos para el desplegable
    obtenerVehiculos().then(setListaVehiculos).catch(console.error);
  }, [cargarViajes]);

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const abrirDialogoCrear = () => {
    setViajeActual(crearViajeVacio());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (viaje) => {
    setViajeActual({
      ...viaje,
      descripcion: viaje.descripcion || '',
      conductor: (typeof viaje.conductor === 'object' && viaje.conductor !== null) ? viaje.conductor.dni : (viaje.conductor || ''),
      matricula: (typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.matricula || ''),
      fecha: viaje.fecha || '',
      kmSalida: viaje.kmSalida ?? '',
      kmLlegada: viaje.kmLlegada ?? '',
      trayectos: viaje.trayectos.map((t) => ({ ...t })),
    });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const vehiculosSeleccionables = listaVehiculos.filter((v) =>
    v.estado !== ESTADO_VEHICULO.AVERIADO || v.matricula === viajeActual.matricula
  );

const manejarGuardar = async () => {
  if (procesando) return;
  setProcesando(true);
  try {
    if (
      viajeActual.kmSalida !== '' &&
      viajeActual.kmLlegada !== '' &&
      Number(viajeActual.kmLlegada) < Number(viajeActual.kmSalida)
    ) {
      setError('Los Km de llegada no pueden ser inferiores a los Km de salida.');
      setProcesando(false);
      return;
    }

    // Sincronizar la cadena antes de limpiar para el envío
    // const trayectosSincronizados = sincronizarCadenaTrayectos(viajeActual.trayectos || []);

      const datosGuardar = {
        ...viajeActual,
        kmSalida: viajeActual.kmSalida === '' ? null : Number(viajeActual.kmSalida),
        kmLlegada: viajeActual.kmLlegada === '' ? null : Number(viajeActual.kmLlegada),
        origen: viajeActual.origen || '',
        destino: viajeActual.destino || '',
        // trayectos: trayectosLimpios
      };

      // Solo enviar trayectos si hay elementos
      // if (datosGuardar.trayectos.length === 0) {
      //   delete datosGuardar.trayectos;
      // }

      console.log('Enviando datos de viaje (machacando info anterior):', datosGuardar);

      if (editando) {
        await actualizarViaje(viajeActual.id, datosGuardar);
      } else {
        await crearViaje(datosGuardar);
      }

      // Lógica de automatización de estado del vehículo
      if (viajeActual.matricula) {
        const estadoViajeNormalizado = normalizarEstadoViaje(viajeActual.estado);
        
        let nuevoEstadoVehiculo = null;
        if (estadoViajeNormalizado === ESTADO_VIAJE.EN_CURSO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.EN_TRAYECTO;
        } else if (estadoViajeNormalizado === ESTADO_VIAJE.COMPLETADO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.DISPONIBLE;
        } else if (estadoViajeNormalizado === ESTADO_VIAJE.PENDIENTE) {
          const vehiculoSeleccionado = listaVehiculos.find(v => 
            v.matricula && viajeActual.matricula && 
            v.matricula.trim().toUpperCase() === viajeActual.matricula.trim().toUpperCase()
          );
          nuevoEstadoVehiculo = vehiculoSeleccionado?.estado === ESTADO_VEHICULO.AVERIADO
            ? ESTADO_VEHICULO.AVERIADO
            : ESTADO_VEHICULO.DISPONIBLE;
        }

        if (nuevoEstadoVehiculo) {
          await actualizarVehiculo(viajeActual.matricula.trim().toUpperCase(), { estado: nuevoEstadoVehiculo });
        }
      }

      setDialogoAbierto(false);
      setViajeActual(crearViajeVacio());
      setEditando(false);
      await cargarViajes();
      // Recargar lista de vehículos para reflejar cambios de estado
      obtenerVehiculos().then(setListaVehiculos).catch(console.error);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const viajeOriginal = viajes.find(v => v.id === idEliminar);
      if (!viajeOriginal) throw new Error('Viaje no encontrado');

      // Normalizar datos: enviar solo DNI y Matrícula, no objetos completos
      const datosNormalizados = {
        ...viajeOriginal,
        visible: false,
        conductor: (typeof viajeOriginal.conductor === 'object' && viajeOriginal.conductor !== null) ? viajeOriginal.conductor.dni : (viajeOriginal.conductor || ''),
        matricula: (typeof viajeOriginal.matricula === 'object' && viajeOriginal.matricula !== null) ? viajeOriginal.matricula.matricula : (viajeOriginal.matricula || ''),
      };

      console.log('Soft delete - Enviando datos normalizados:', datosNormalizados);
      await actualizarViaje(idEliminar, datosNormalizados);
      
      setConfirmacionAbierta(false);
      setIdEliminar('');
      await cargarViajes();
      setError('');
    } catch (err) {
      console.error('Error en soft delete:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const manejarCompletarViaje = async (viaje) => {
    try {
      const viajeActualizado = { ...viaje, estado: ESTADO_VIAJE.COMPLETADO };
      await actualizarViaje(viaje.id, viajeActualizado);
      
      // Actualizar vehículo a disponible
      if (viaje.matricula) {
        await actualizarVehiculo(viaje.matricula.trim().toUpperCase(), { estado: ESTADO_VEHICULO.DISPONIBLE });
      }
      
      await cargarViajes();
      // Recargar lista de vehículos para reflejar cambios de estado
      obtenerVehiculos().then(setListaVehiculos).catch(console.error);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambioViaje = (campo, valor) => {
    setViajeActual((prev) => ({ ...prev, [campo]: valor }));
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando viajes..." />
      </div>
    );
  }

  const viajesFiltrados = viajes.filter(v => {
    if (!mostrarOcultos && v.visible === false) return false;

    if (filtroEstado !== 'Todos' && v.estado !== filtroEstado) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    
    const condText = typeof v.conductor === 'object' && v.conductor !== null 
      ? `${v.conductor.nombre} ${v.conductor.apellidos} ${v.conductor.dni}` 
      : String(v.conductor || '');
      
    return (
      (v.id || '').toLowerCase().includes(term) ||
      (v.descripcion || '').toLowerCase().includes(term) ||
      (typeof v.matricula === 'object' && v.matricula !== null ? v.matricula.matricula : String(v.matricula || '')).toLowerCase().includes(term) ||
      condText.toLowerCase().includes(term) ||
      (v.trayectos && v.trayectos.some(t => 
        (t.origen || '').toLowerCase().includes(term) || 
        (t.destino || '').toLowerCase().includes(term)
      ))
    );
  });

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <VehicleBus24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Viajes</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input 
            contentBefore={<Search24Regular />} 
            placeholder="Buscar viaje, matrícula, conductor, lugar..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '250px' }}
          />
          <Select value={filtroEstado} onChange={(e, d) => setFiltroEstado(d.value)}>
            <option value="Todos">Todos</option>
            <option value={ESTADO_VIAJE.PENDIENTE}>Pendientes</option>
            <option value={ESTADO_VIAJE.EN_CURSO}>En curso</option>
            <option value={ESTADO_VIAJE.COMPLETADO}>Completados</option>
          </Select>
          {esAdmin && (
            <>
              <ToolbarButton
                icon={mostrarOcultos ? <Eye24Regular /> : <EyeOff24Regular />}
                onClick={() => setMostrarOcultos(!mostrarOcultos)}
              >
                {mostrarOcultos ? 'Ocultar inactivos' : 'Ver ocultos'}
              </ToolbarButton>
              <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
                Añadir viaje
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

      <Card className={estilos.tarjetaTabla}>
        <Table style={{ minWidth: '900px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {viajesFiltrados.map((viaje) => {
              const { kmTotales } = calcularTotales(viaje.trayectos);
              const gastoTotal = viaje.gastoGasolina || 0;
              const expandido = expandidos[viaje.id];
              const puntosRuta = construirRutaTexto(viaje.trayectos);

              return (
                <Fragment key={viaje.id}>
                  <TableRow 
                    key={viaje.id} 
                    className={estilos.filaExpandible} 
                    onClick={() => toggleExpandir(viaje.id)}
                    style={viaje.visible === false ? { opacity: 0.6, backgroundColor: tokens.colorNeutralBackground3 } : undefined}
                  >
                    <TableCell>
                      {expandido
                        ? <ChevronDown24Regular />
                        : <ChevronRight24Regular />
                      }
                    </TableCell>
                    <TableCell>{viaje.descripcion}</TableCell>
                    <TableCell><strong>{(typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.matricula || '—')}</strong></TableCell>
                    <TableCell>{(typeof viaje.conductor === 'object' && viaje.conductor !== null) ? `${viaje.conductor.nombre} ${viaje.conductor.apellidos} (${viaje.conductor.dni})` : (viaje.conductor || 'Sin asignar')}</TableCell>
                    <TableCell>{viaje.fecha}</TableCell>
                    <TableCell>
                      <Badge appearance="outline" color="informative">{viaje.trayectos.length}</Badge>
                    </TableCell>
                    <TableCell>{kmTotales.toLocaleString('es-ES')} km</TableCell>
                    <TableCell>{gastoTotal.toFixed(2)} €</TableCell>
                    <TableCell>{obtenerBadgeEstadoViaje(viaje.estado)}</TableCell>
                    <TableCell>
                      {esAdmin ? (
                        <>
                          <Tooltip content="Editar" relationship="label">
                            <Button
                              icon={<Edit24Regular />}
                              appearance="subtle"
                              size="small"
                              onClick={(e) => { e.stopPropagation(); abrirDialogoEditar(viaje); }}
                            />
                          </Tooltip>
                          <Tooltip content="Eliminar" relationship="label">
                            <Button
                              icon={<Delete24Regular />}
                              appearance="subtle"
                              size="small"
                              onClick={(e) => { e.stopPropagation(); confirmarEliminar(viaje.id); }}
                            />
                          </Tooltip>
                        </>
                      ) : (
                        viaje.estado !== ESTADO_VIAJE.COMPLETADO && (
                          <Tooltip content="Marcar como completado" relationship="label">
                            <Button
                              icon={<Badge color="success" size="extra-small" style={{ minWidth: 0, padding: 0 }} />}
                              appearance="subtle"
                              size="small"
                              onClick={(e) => { e.stopPropagation(); manejarCompletarViaje(viaje); }}
                            >
                              Completar
                            </Button>
                          </Tooltip>
                        )
                      )}
                    </TableCell>
                  </TableRow>

                  {expandido && (
                    <TableRow key={`${viaje.id}-detalle`}>
                      <TableCell colSpan={columnas.length}>
                        <div className={estilos.subTablaContenedor}>
                          <div className={estilos.rutaVisual}>
                            <Location24Regular style={{ color: tokens.colorBrandForeground1 }} />
                            {puntosRuta.map((punto, i) => (
                              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className={estilos.puntoRuta}>{punto}</span>
                                {i < puntosRuta.length - 1 && (
                                  <ArrowRight16Regular style={{ color: tokens.colorNeutralForeground3 }} />
                                )}
                              </span>
                            ))}
                          </div>
                          <Divider style={{ margin: `${tokens.spacingVerticalS} 0` }} />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: tokens.spacingVerticalS }}>
                            <Button
                              appearance="outline"
                              icon={<Add24Regular />}
                              onClick={() => navegar('/trayectos?viajeId=' + viaje.id)}
                              size="small"
                            >
                              Añadir trayecto
                            </Button>
                          </div>
                          <Table size="small">
                            <TableHeader>
                              <TableRow>
                                <TableHeaderCell><strong>#</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Origen</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Destino</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Km</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Salida</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Llegada</strong></TableHeaderCell>
                                {esAdmin && <TableHeaderCell><strong>Acciones</strong></TableHeaderCell>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {viaje.trayectos.map((t, idx) => (
                                <TableRow key={t.id || idx}>
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>{t.origen}</TableCell>
                                  <TableCell>{t.destino}</TableCell>
                                  <TableCell>{t.distanciaEnKm.toLocaleString('es-ES')} km</TableCell>
                                  <TableCell>
                                    <Caption1>{t.horaSalida ? new Date(t.horaSalida).toLocaleString('es-ES') : '—'}</Caption1>
                                  </TableCell>
                                  <TableCell>
                                    <Caption1>{t.horaLlegada ? new Date(t.horaLlegada).toLocaleString('es-ES') : '—'}</Caption1>
                                  </TableCell>
                                  {esAdmin && (
                                    <TableCell>
                                      <Tooltip content="Editar trayecto" relationship="label">
                                        <Button
                                          icon={<Edit24Regular />}
                                          appearance="subtle"
                                          size="small"
                                          onClick={() => navegar('/trayectos?editar=' + t.id)}
                                        />
                                      </Tooltip>
                                      <Tooltip content="Eliminar trayecto" relationship="label">
                                        <Button
                                          icon={<Delete24Regular />}
                                          appearance="subtle"
                                          size="small"
                                          onClick={() => confirmarEliminarTrayecto(t.id)}
                                        />
                                      </Tooltip>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
            {viajes.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnas.length} style={{ textAlign: 'center', padding: '40px' }}>
                  <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay viajes registrados</Text>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Vista de Lista Móvil */}
      <div className={estilos.listaMovil}>
        {viajesFiltrados.map((viaje) => {
          const { kmTotales } = calcularTotales(viaje.trayectos);
          const gastoTotal = viaje.gastoGasolina || 0;
          const expandido = expandidos[viaje.id];
          const puntosRuta = construirRutaTexto(viaje.trayectos);

          return (
             <Card key={viaje.id} className={estilos.tarjetaMovil} style={viaje.visible === false ? { opacity: 0.6, backgroundColor: tokens.colorNeutralBackground3 } : undefined}>
                <div className={estilos.tarjetaMovilCabecera}>
                  <div>
                    <Text size={400} weight="bold">{viaje.descripcion}</Text>
                  </div>
                  {obtenerBadgeEstadoViaje(viaje.estado)}
                </div>
                
                <div className={estilos.tarjetaMovilCuerpo}>
                  <div>
                    <div className={estilos.datoEtiqueta}>Vehículo</div>
                    <div className={estilos.datoValor}>{obtenerTextoMatricula(viaje.matricula)}</div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Fecha</div>
                    <div className={estilos.datoValor}>{viaje.fecha ? new Date(viaje.fecha).toLocaleDateString('es-ES') : '—'}</div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Km totales</div>
                    <div className={estilos.datoValor}>{kmTotales.toLocaleString('es-ES')} km</div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Gasto</div>
                    <div className={estilos.datoValor}>{gastoTotal.toFixed(2)} €</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div className={estilos.datoEtiqueta}>Conductor</div>
                    <div className={estilos.datoValor}>{obtenerTextoConductor(viaje.conductor)}</div>
                  </div>
                </div>

                <div className={estilos.accionesMovil}>
                   <Button icon={expandido ? <ChevronDown24Regular /> : <ChevronRight24Regular />} appearance="subtle" onClick={() => toggleExpandir(viaje.id)}>
                     {viaje.trayectos.length} Trayectos
                   </Button>
                   {esAdmin ? (
                      <>
                        <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(viaje)}>Editar</Button>
                        <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(viaje.id)}>Borrar</Button>
                      </>
                   ) : (
                     viaje.estado !== ESTADO_VIAJE.COMPLETADO && (
                       <Button icon={<Badge color="success" size="extra-small" style={{ minWidth: 0, padding: 0 }} />} appearance="subtle" onClick={() => manejarCompletarViaje(viaje)}>
                         Completar
                       </Button>
                     )
                   )}
                </div>

                {expandido && (
                  <div style={{ marginTop: tokens.spacingVerticalS, backgroundColor: tokens.colorNeutralBackground2, padding: tokens.spacingHorizontalM, borderRadius: tokens.borderRadiusMedium }}>
                    <div className={estilos.rutaVisual} style={{ flexWrap: 'wrap' }}>
                      <Location24Regular style={{ color: tokens.colorBrandForeground1 }} />
                      {puntosRuta.map((punto, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className={estilos.puntoRuta}>{punto}</span>
                          {i < puntosRuta.length - 1 && <ArrowRight16Regular style={{ color: tokens.colorNeutralForeground3 }} />}
                        </span>
                      ))}
                    </div>
                    <div style={{ marginTop: tokens.spacingVerticalS, display: 'grid', gap: tokens.spacingVerticalS }}>
                      {viaje.trayectos.map((t, idx) => (
                        <div key={t.id || idx} style={{ padding: tokens.spacingVerticalS, borderTop: idx === 0 ? 'none' : `1px solid ${tokens.colorNeutralStroke2}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <div className={estilos.datoEtiqueta}>Trayecto</div>
                              <div className={estilos.datoValor}>{idx + 1}</div>
                            </div>
                            <div>
                              <div className={estilos.datoEtiqueta}>Km</div>
                              <div className={estilos.datoValor}>{(t.distanciaEnKm || 0).toLocaleString('es-ES')} km</div>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gap: tokens.spacingVerticalS, marginTop: tokens.spacingVerticalS }}>
                            <div>
                              <div className={estilos.datoEtiqueta}>Origen</div>
                              <div className={estilos.datoValor}>{t.origen || '—'}</div>
                            </div>
                            <div>
                              <div className={estilos.datoEtiqueta}>Destino</div>
                              <div className={estilos.datoValor}>{t.destino || '—'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                              <div>
                                <div className={estilos.datoEtiqueta}>Salida</div>
                                <div className={estilos.datoValor}>{t.horaSalida ? new Date(t.horaSalida).toLocaleString('es-ES') : '—'}</div>
                              </div>
                              <div>
                                <div className={estilos.datoEtiqueta}>Llegada</div>
                                <div className={estilos.datoValor}>{t.horaLlegada ? new Date(t.horaLlegada).toLocaleString('es-ES') : '—'}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
             </Card>
          );
        })}
        {viajes.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay viajes registrados</Text>
          </Card>
        )}
      </div>

      {/* Diálogo crear / editar viaje */}
      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { 
        if (!d.open) {
          setDialogoAbierto(false);
          setViajeActual(crearViajeVacio());
          setEditando(false);
        }
      }}>
        <DialogSurface style={{ maxWidth: '720px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar viaje' : 'Nuevo viaje'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                {/* Datos del viaje en una sola fila */}
                <div className={estilos.filaFormulario}>
                  <Field label="Descripción del viaje" required>
                    <Input
                      value={viajeActual.descripcion || ''}
                      onChange={(_, d) => manejarCambioViaje('descripcion', d.value)}
                      placeholder="Ruta sur peninsular"
                    />
                  </Field>
                  <Field label="DNI Conductor" required>
                    <Input
                      value={viajeActual.conductor || ''}
                      onChange={(_, d) => manejarCambioViaje('conductor', d.value)}
                      placeholder="12345678A"
                    />
                  </Field>
                  <Field label="Vehículo (Matrícula)" required>
                    <Select
                      value={viajeActual.matricula}
                      onChange={(_, d) => manejarCambioViaje('matricula', d.value)}
                    >
                      <option value="">Selecciona un vehículo...</option>
                      {vehiculosSeleccionables.map(v => (
                        <option key={v.matricula} value={v.matricula}>
                          {v.matricula} - {v.marca} {v.modelo}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Km salida">
                    <Input
                      type="number"
                      min="0"
                      value={viajeActual.kmSalida ?? ''}
                      onChange={(_, d) => manejarCambioViaje('kmSalida', d.value)}
                      placeholder="Ej: 12500"
                    />
                  </Field>
                  <Field label="Km llegada">
                    <Input
                      type="number"
                      min="0"
                      value={viajeActual.kmLlegada ?? ''}
                      onChange={(_, d) => manejarCambioViaje('kmLlegada', d.value)}
                      placeholder="Ej: 12680"
                    />
                  </Field>
                  <Field label="Fecha">
                    <Input
                      type="date"
                      value={viajeActual.fecha || ''}
                      onChange={(_, d) => manejarCambioViaje('fecha', d.value)}
                    />
                  </Field>
                  <Field label="Estado">
                    <Select
                      value={viajeActual.estado}
                      onChange={(_, d) => manejarCambioViaje('estado', d.value)}
                    >
                      <option value={ESTADO_VIAJE.PENDIENTE}>Pendiente</option>
                      <option value={ESTADO_VIAJE.EN_CURSO}>En curso</option>
                      <option value={ESTADO_VIAJE.COMPLETADO}>Completado</option>
                    </Select>
                  </Field>
                  <Field label="Gasto gasolina total (€)">
                    <Input
                      type="number"
                      step="0.01"
                      value={String(viajeActual.gastoGasolina || 0)}
                      onChange={(_, d) => manejarCambioViaje('gastoGasolina', Number(d.value))}
                      placeholder="0.00"
                    />
                  </Field>
                </div>

                {viajeActual.kmSalida !== '' && viajeActual.kmLlegada !== '' && (
                  <Text
                    size={300}
                    style={{
                      color:
                        Number(viajeActual.kmLlegada) >= Number(viajeActual.kmSalida)
                          ? tokens.colorNeutralForeground2
                          : tokens.colorPaletteRedForeground1,
                    }}
                  >
                    {Number(viajeActual.kmLlegada) >= Number(viajeActual.kmSalida)
                      ? `Km recorridos: ${(
                          Number(viajeActual.kmLlegada) - Number(viajeActual.kmSalida)
                        ).toLocaleString('es-ES')} km`
                      : 'Los Km de llegada no pueden ser inferiores a los Km de salida.'}
                  </Text>
                )}

                {esAdmin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Checkbox
                      label="Viaje visible para conductores"
                      checked={viajeActual.visible !== false}
                      onChange={(_, d) => manejarCambioViaje('visible', !!d.checked)}
                    />
                    <Tooltip content="Si se desmarca, el viaje solo será visible para administradores en el modo 'Ver ocultos'" relationship="label">
                      <Caption1 style={{ color: tokens.colorNeutralForeground3, cursor: 'help' }}>(?)</Caption1>
                    </Tooltip>
                  </div>
                )}

              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={manejarGuardar}>{editando ? 'Guardar cambios' : 'Crear viaje'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar viaje"
        mensaje={`¿Estás seguro de que deseas eliminar el viaje ${idEliminar}?`}
        onConfirmar={manejarEliminar}
        onCancelar={() => {
          setConfirmacionAbierta(false);
          setIdEliminar('');
        }}
      />

      <DialogoConfirmacion
        abierto={confirmacionTrayectoAbierta}
        titulo="Eliminar trayecto"
        mensaje="¿Estás seguro de que deseas eliminar este trayecto?"
        onConfirmar={manejarEliminarTrayecto}
        onCancelar={() => {
          setConfirmacionTrayectoAbierta(false);
          setTrayectoEliminarId('');
        }}
      />

    </div>
  );
};

export default PaginaViajes;
