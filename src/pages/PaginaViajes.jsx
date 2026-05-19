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
import { obtenerConductores } from '../services/servicioConductores.js';
import { formatForDateTimeLocal, formatDisplayDate, safeIsoString, formatForDate } from '../utils/dateUtils.js';
import { validarFechasViaje } from '../utils/validaciones.js';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';
import { crearViajeVacio, crearTrayectoDeViajeVacio, ESTADO_VIAJE, normalizarEstadoViaje, calcularEstadoViaje } from '../models/Viaje.js';
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
  { nombre: 'Salida', campo: 'fechaSalida' },
  { nombre: 'Llegada', campo: 'fechaLlegada' },
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
  const [mensajeCargando, setMensajeCargando] = useState('');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [listaConductores, setListaConductores] = useState([]);

  const navegar = useNavigate();

  // Estados para eliminación de trayectos
  const [confirmacionTrayectoAbierta, setConfirmacionTrayectoAbierta] = useState(false);
  const [trayectoEliminarId, setTrayectoEliminarId] = useState('');
  
  // Estados para gestión inline de trayectos (Diálogo Trayectos)
  const [dialogoTrayectoAbierto, setDialogoTrayectoAbierto] = useState(false);
  const [trayectoActualInline, setTrayectoActualInline] = useState(crearTrayectoVacio());
  const [editandoTrayectoInline, setEditandoTrayectoInline] = useState(false);
  const [viajePadreId, setViajePadreId] = useState('');
  const [origenFijado, setOrigenFijado] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState({});
  
  // Función para asegurar la integridad de la cadena de trayectos
  const sincronizarCadenaTrayectos = (trayectos) => {
    if (!trayectos || trayectos.length <= 1) return trayectos;
    
    const nuevos = [...trayectos.map(t => ({ ...t }))];
    for (let i = 0; i < nuevos.length - 1; i++) {
      // El origen del siguiente trayecto DEBE ser el destino del actual
      if (nuevos[i].destino !== nuevos[i + 1].origen) {
        nuevos[i + 1].origen = nuevos[i].destino;
      }
    }
    return nuevos;
  };

  const cargarViajes = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
    }
    try {
      const [datos, vehiculosActualizados] = await Promise.all([
        obtenerViajes(),
        obtenerVehiculos()
      ]);
      
      setListaVehiculos(vehiculosActualizados);

      // Filtrar duplicados por ID
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
        // LIMPIEZA AGRESIVA
        const trayectosIdsVistos = new Set();
        const trayectosUnicos = (viaje.trayectos || []).filter(t => {
          if (!t.id) return true;
          if (trayectosIdsVistos.has(t.id)) return false;
          trayectosIdsVistos.add(t.id);
          return true;
        });

        const viajeLimpio = {
          ...viaje,
          trayectos: trayectosUnicos,
        };

        const estadoCalculado = calcularEstadoViaje(viajeLimpio);
        const estadoActual = normalizarEstadoViaje(viaje.estado);
        
        // Aseguramos que el objeto viajeLimpio tenga el estado normalizado para las comparaciones
        viajeLimpio.estado = estadoActual;

        if (estadoCalculado !== estadoActual) {
          const cuerpoActualizacion = { estado: estadoCalculado };
          viajeLimpio.estado = estadoCalculado;
          
          // Enviar SOLO el estado para evitar conflictos con relaciones en el backend
          actualizarViaje(viaje.id, cuerpoActualizacion)
            .catch(err => console.error(`Error actualizando viaje ${viaje.id}:`, err));
        }

        return viajeLimpio;
      });

      // --- NUEVA LÓGICA DE SINCRONIZACIÓN GLOBAL DE VEHÍCULOS ---
      // 1. Identificar qué vehículos DEBEN estar en trayecto (tienen al menos un viaje ACTIVO)
      const matriculasEnTrayecto = new Set(
        filtrados
          .filter(v => v.estado === ESTADO_VIAJE.EN_CURSO && v.vehiculoMatricula)
          .map(v => v.vehiculoMatricula.trim().toUpperCase())
      );

      // 2. Sincronizar estados basándonos en la realidad de los viajes actuales
      for (const vehiculo of vehiculosActualizados) {
        if (!vehiculo.matricula) continue;
        
        const matricula = vehiculo.matricula.trim().toUpperCase();
        const vEstado = String(vehiculo.estado || '').toUpperCase();
        const debeEstarEnTrayecto = matriculasEnTrayecto.has(matricula);
        
        // No tocamos vehículos averiados
        if (vEstado === ESTADO_VEHICULO.AVERIADO) continue;

        if (debeEstarEnTrayecto && vEstado !== ESTADO_VEHICULO.EN_TRAYECTO) {
          actualizarVehiculo(matricula, { estado: ESTADO_VEHICULO.EN_TRAYECTO })
            .catch(err => console.error(`[SYNC] Error activando ${matricula}:`, err));
        } 
        else if (!debeEstarEnTrayecto && vEstado === ESTADO_VEHICULO.EN_TRAYECTO) {
          actualizarVehiculo(matricula, { estado: ESTADO_VEHICULO.DISPONIBLE })
            .catch(err => console.error(`[SYNC] Error liberando ${matricula}:`, err));
        }
      }

      setViajes(filtrados);
    } catch (err) {
      setError(err.message || 'Error al cargar los viajes');
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  }, [esAdmin, usuario?.dni]);

  const confirmarEliminarTrayecto = (viajeId, trayectoId) => {
    setViajePadreId(viajeId);
    setTrayectoEliminarId(trayectoId);
    setConfirmacionTrayectoAbierta(true);
  };

  const manejarEliminarTrayecto = async () => {
    if (procesando) return;
    setProcesando(true);
    setMensajeCargando("Eliminando trayecto...");
    try {
      await eliminarTrayecto(trayectoEliminarId);
      
      // Sincronizar viajeActual si es el viaje que estamos editando
      if (editando && viajeActual.id === viajePadreId) {
        setViajeActual(prev => ({
          ...prev,
          trayectos: (prev.trayectos || []).filter(t => t.id !== trayectoEliminarId)
        }));
      }

      setConfirmacionTrayectoAbierta(false);
      setTrayectoEliminarId('');
      await cargarViajes(true);
      setError('');
    } catch (err) {
      console.error('Error eliminando trayecto:', err);
      setError('Error eliminando trayecto: ' + err.message);
    } finally {
      setProcesando(false);
      setMensajeCargando('');
    }
  };

  // Alias para mantener compatibilidad con lo reportado por el usuario
  const eliminarTrayectoInline = manejarEliminarTrayecto;

  const abrirDialogoCrearTrayectoInline = (viajeId) => {
    const nuevoTrayecto = crearTrayectoVacio();
    // Pre-poblamos con datos del viaje si es necesario
    const viaje = viajes.find(v => v.id === viajeId);
    setOrigenFijado(false);

    if (viaje) {
      nuevoTrayecto.conductor = (typeof viaje.conductor === 'object' && viaje.conductor !== null) ? viaje.conductor.dni : (viaje.conductor || '');
      
      // LOGICA DE ENCADENAMIENTO: El origen del nuevo trayecto es el destino del último
      if (viaje.trayectos && viaje.trayectos.length > 0) {
        // Ordenamos por hora de salida o simplemente tomamos el último del array
        const ultimoTrayecto = [...viaje.trayectos].sort((a, b) => new Date(a.horaSalida) - new Date(b.horaSalida)).pop();
        if (ultimoTrayecto && ultimoTrayecto.destino) {
          nuevoTrayecto.origen = ultimoTrayecto.destino;
          setOrigenFijado(true);
        }
      }
    }
    
    setTrayectoActualInline(nuevoTrayecto);
    setViajePadreId(viajeId);
    setEditandoTrayectoInline(false);
    setDialogoTrayectoAbierto(true);
  };

  const abrirDialogoEditarTrayectoInline = (viajeId, trayecto) => {
    setTrayectoActualInline({ ...trayecto });
    setViajePadreId(viajeId);
    setEditandoTrayectoInline(true);
    setOrigenFijado(true);
    setDialogoTrayectoAbierto(true);
  };

  const guardarTrayectoInline = async () => {
    if (procesando) return;
    setProcesando(true);
    setMensajeCargando(editandoTrayectoInline ? "Modificando trayecto..." : "Creando trayecto...");
    setError('');

    // Validar horas del trayecto
    if (trayectoActualInline.horaSalida && trayectoActualInline.horaLlegada) {
      const resFechas = validarFechasViaje(trayectoActualInline.horaSalida, trayectoActualInline.horaLlegada);
      if (!resFechas.valido) {
        setError('La hora de llegada del trayecto debe ser posterior a la hora de salida.');
        setProcesando(false);
        setMensajeCargando('');
        return;
      }
    }

    try {
      const datosGuardar = {
        ...trayectoActualInline,
        viajeId: viajePadreId,
        distanciaEnKm: Number(trayectoActualInline.distanciaEnKm || trayectoActualInline.kmRecorridos || 0),
        gastoGasolina: 0,
      };

      // Limpieza de campos para el backend (evitar enviar IDs temporales o datos nulos)
      if (!editandoTrayectoInline) {
        delete datosGuardar.id;
      }

      if (editandoTrayectoInline) {
        // Al actualizar, quitamos el ID del cuerpo para evitar confusiones en el backend (el ID ya va en la URL)
        const { id, ...datosSinId } = datosGuardar;
        const actualizado = await actualizarTrayecto(trayectoActualInline.id, datosSinId);
        
        // Sincronizar viajeActual si es el viaje que estamos editando
        if (editando && viajeActual.id === viajePadreId) {
          setViajeActual(prev => ({
            ...prev,
            trayectos: (prev.trayectos || []).map(t => t.id === trayectoActualInline.id ? { ...t, ...actualizado } : t)
          }));
        }

        // LOGICA DE ENCADENAMIENTO...
        const viaje = viajes.find(v => v.id === viajePadreId);
        if (viaje && viaje.trayectos) {
          const trayectosOrdenados = [...viaje.trayectos].sort((a, b) => new Date(a.horaSalida) - new Date(b.horaSalida));
          const indiceActual = trayectosOrdenados.findIndex(t => t.id === trayectoActualInline.id);
          
          if (indiceActual !== -1 && indiceActual < trayectosOrdenados.length - 1) {
            const siguienteTrayecto = trayectosOrdenados[indiceActual + 1];
            if (siguienteTrayecto.origen !== datosGuardar.destino) {
              const { id: sId, ...sDatosSinId } = siguienteTrayecto;
              await actualizarTrayecto(sId, { ...sDatosSinId, origen: datosGuardar.destino });
            }
          }
        }
      } else {
        const nuevo = await crearTrayecto(datosGuardar);
        
        // Sincronizar viajeActual si es el viaje que estamos editando
        if (editando && viajeActual.id === viajePadreId) {
          setViajeActual(prev => ({
            ...prev,
            trayectos: [...(prev.trayectos || []), nuevo]
          }));
        }
      }

      setDialogoTrayectoAbierto(false);
      await cargarViajes(true);
      // Forzar recarga de vehículos para ver el cambio de estado
      obtenerVehiculos().then(setListaVehiculos).catch(console.error);
    } catch (err) {
      console.error('Error guardando trayecto inline:', err);
      setError('Error al guardar trayecto: ' + err.message);
    } finally {
      setProcesando(false);
      setMensajeCargando('');
    }
  };

  useEffect(() => {
    cargarViajes();
    // Cargamos lista de vehículos para el desplegable
    obtenerVehiculos().then(setListaVehiculos).catch(console.error);
    // Cargamos lista de conductores para el desplegable
    obtenerConductores().then(setListaConductores).catch(console.error);

    // TEMPORIZADOR DE ACTUALIZACIÓN AUTOMÁTICA: Revisar estados cada minuto
    const intervalo = setInterval(() => {
      cargarViajes(true);
    }, 60000);

    return () => clearInterval(intervalo);
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
      conductorDni: (typeof viaje.conductor === 'object' && viaje.conductor !== null) ? viaje.conductor.dni : (viaje.conductor || viaje.conductorDni || ''),
      vehiculoMatricula: (typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.matricula || viaje.vehiculoMatricula || ''),
      fechaSalida: viaje.fechaSalida || '',
      fechaLlegada: viaje.fechaLlegada || '',
      kmSalida: viaje.kmSalida ?? '',
      kmLlegada: viaje.kmLlegada ?? '',
      trayectos: viaje.trayectos.map((t) => ({ ...t })),
    });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const vehiculosSeleccionables = listaVehiculos.filter((v) =>
    v.estado !== ESTADO_VEHICULO.AVERIADO || v.matricula === viajeActual.vehiculoMatricula
  );

const manejarGuardar = async () => {
  if (procesando) return;
  setProcesando(true);
  setMensajeCargando(editando ? "Modificando viaje..." : "Creando viaje...");

  // --- VALIDACIONES ---
  const errores = {};

  if (!viajeActual.descripcion || !viajeActual.descripcion.trim()) {
    errores.descripcion = 'La descripción es obligatoria.';
  }
  if (!viajeActual.conductorDni) {
    errores.conductorDni = 'Debe seleccionar un conductor.';
  }
  if (!viajeActual.vehiculoMatricula) {
    errores.vehiculoMatricula = 'Debe seleccionar un vehículo.';
  }
  if (!viajeActual.fechaSalida) {
    errores.fechaSalida = 'La fecha de salida es obligatoria.';
  }

  // Validar fechas: llegada debe ser posterior a salida
  if (viajeActual.fechaSalida && viajeActual.fechaLlegada) {
    const resFechas = validarFechasViaje(viajeActual.fechaSalida, viajeActual.fechaLlegada);
    if (!resFechas.valido) {
      errores.fechaLlegada = resFechas.mensaje;
    }
  }

  if (Object.keys(errores).length > 0) {
    setErroresValidacion(errores);
    setProcesando(false);
    setMensajeCargando('');
    return;
  }
  setErroresValidacion({});
  // --- FIN VALIDACIONES ---

  try {
    setDialogoAbierto(false);
    if (
      viajeActual.kmSalida !== '' &&
      viajeActual.kmLlegada !== '' &&
      Number(viajeActual.kmLlegada) < Number(viajeActual.kmSalida)
    ) {
      setError('Los Km de llegada no pueden ser inferiores a los Km de salida.');
      setProcesando(false);
      setMensajeCargando('');
      return;
    }

    // Sincronizar la cadena antes de limpiar para el envío
    // const trayectosSincronizados = sincronizarCadenaTrayectos(viajeActual.trayectos || []);

      const datosGuardar = {
        ...viajeActual,
        conductorDni: String(viajeActual.conductorDni || ''),
        vehiculoMatricula: String(viajeActual.vehiculoMatricula || ''),
        kmSalida: viajeActual.kmSalida === '' ? null : Number(viajeActual.kmSalida),
        kmLlegada: viajeActual.kmLlegada === '' ? null : Number(viajeActual.kmLlegada),
        origen: viajeActual.origen || '',
        destino: viajeActual.destino || '',
      };

      // Eliminar campos antiguos o innecesarios para el backend
      delete datosGuardar.conductor;
      delete datosGuardar.matricula;
      if (editando) {
        delete datosGuardar.trayectos; // Evitar duplicados: los trayectos se gestionan por separado de forma inline
        await actualizarViaje(viajeActual.id, datosGuardar);
      } else {
        await crearViaje(datosGuardar);
      }

      // Lógica de automatización de estado del vehículo
      if (viajeActual.vehiculoMatricula) {
        const estadoViajeNormalizado = normalizarEstadoViaje(viajeActual.estado);
        
        let nuevoEstadoVehiculo = null;
        if (estadoViajeNormalizado === ESTADO_VIAJE.EN_CURSO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.EN_TRAYECTO;
        } else if (estadoViajeNormalizado === ESTADO_VIAJE.COMPLETADO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.DISPONIBLE;
        } else if (estadoViajeNormalizado === ESTADO_VIAJE.PENDIENTE) {
          const vehiculoSeleccionado = listaVehiculos.find(v => 
            v.matricula && viajeActual.vehiculoMatricula && 
            v.matricula.trim().toUpperCase() === viajeActual.vehiculoMatricula.trim().toUpperCase()
          );
          nuevoEstadoVehiculo = vehiculoSeleccionado?.estado === ESTADO_VEHICULO.AVERIADO
            ? ESTADO_VEHICULO.AVERIADO
            : ESTADO_VEHICULO.DISPONIBLE;
        }

        if (nuevoEstadoVehiculo) {
          await actualizarVehiculo(viajeActual.vehiculoMatricula.trim().toUpperCase(), { estado: nuevoEstadoVehiculo });
        }
      }

      setViajeActual(crearViajeVacio());
      setEditando(false);
      await cargarViajes(true);
      // Recargar lista de vehículos para reflejar cambios de estado
      obtenerVehiculos().then(setListaVehiculos).catch(console.error);
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
    setMensajeCargando("Eliminando viaje...");
    try {
      const viajeOriginal = viajes.find(v => v.id === idEliminar);
      if (!viajeOriginal) throw new Error('Viaje no encontrado');

      // Normalizar datos: enviar solo DNI y Matrícula como strings
      const datosNormalizados = {
        ...viajeOriginal,
        visible: false,
        conductorDni: (typeof viajeOriginal.conductor === 'object' && viajeOriginal.conductor !== null) ? viajeOriginal.conductor.dni : (viajeOriginal.conductor || viajeOriginal.conductorDni || ''),
        vehiculoMatricula: (typeof viajeOriginal.matricula === 'object' && viajeOriginal.matricula !== null) ? viajeOriginal.matricula.matricula : (viajeOriginal.matricula || viajeOriginal.vehiculoMatricula || ''),
      };
      const viajeEliminar = viajes.find(v => v.id === idEliminar);
      if (!viajeEliminar) throw new Error('Viaje no encontrado');

      // Limpieza de campos antiguos
      delete datosNormalizados.conductor;
      delete datosNormalizados.matricula;

      await eliminarViaje(viajeEliminar.id);
      setConfirmacionAbierta(false);
      setIdEliminar('');
      await cargarViajes(true);
      setError('');
    } catch (err) {
      console.error('Error en soft delete:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
      setMensajeCargando('');
    }
  };

  const manejarCompletarViaje = async (viaje) => {
    setMensajeCargando("Modificando viaje...");
    try {
      const viajeActualizado = { 
        ...viaje, 
        estado: ESTADO_VIAJE.COMPLETADO,
        conductorDni: (typeof viaje.conductor === 'object' && viaje.conductor !== null) ? viaje.conductor.dni : (viaje.conductor || viaje.conductorDni || ''),
        vehiculoMatricula: (typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.matricula || viaje.vehiculoMatricula || ''),
      };
      
      delete viajeActualizado.conductor;
      delete viajeActualizado.matricula;

      await actualizarViaje(viaje.id, viajeActualizado);
      
      // Actualizar vehículo a disponible
      if (viajeActualizado.vehiculoMatricula) {
        await actualizarVehiculo(viajeActualizado.vehiculoMatricula.trim().toUpperCase(), { estado: ESTADO_VEHICULO.DISPONIBLE });
      }
      
      await cargarViajes(true);
      // Recargar lista de vehículos para reflejar cambios de estado
      obtenerVehiculos().then(setListaVehiculos).catch(console.error);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setMensajeCargando('');
    }
  };

  const manejarCambioViaje = (campo, valor) => {
    setViajeActual((prev) => {
      // Si cambiamos fechas, recalculamos el estado automáticamente
      if (campo === 'fechaSalida' || campo === 'fechaLlegada') {
        const isoValor = safeIsoString(valor);
        const nuevo = { ...prev, [campo]: isoValor };
        nuevo.estado = calcularEstadoViaje(nuevo);
        return nuevo;
      }
      
      return { ...prev, [campo]: valor };
    });
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
      (typeof v.matricula === 'object' && v.matricula !== null ? v.matricula.matricula : String(v.vehiculoMatricula || v.matricula || '')).toLowerCase().includes(term) ||
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
                    <TableCell>
                      {(() => {
                        const mat = (typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.vehiculoMatricula || viaje.matricula || '—');
                        const v = listaVehiculos.find(veh => veh.matricula?.trim().toUpperCase() === mat.trim().toUpperCase());
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong>{mat}</strong>
                            {v && <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{v.marca} {v.modelo}</Text>}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell>{(typeof viaje.conductor === 'object' && viaje.conductor !== null) ? `${viaje.conductor.nombre} ${viaje.conductor.apellidos} (${viaje.conductor.dni})` : (viaje.conductorDni || viaje.conductor || 'Sin asignar')}</TableCell>
                    <TableCell>{viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString('es-ES') : '—'}</TableCell>
                    <TableCell>{viaje.fechaLlegada ? new Date(viaje.fechaLlegada).toLocaleDateString('es-ES') : '—'}</TableCell>
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
                              type="button"
                              appearance="outline"
                              icon={<Add24Regular />}
                              onClick={(e) => { e.stopPropagation(); abrirDialogoCrearTrayectoInline(viaje.id); }}
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
                                    <Caption1>{formatDisplayDate(t.horaSalida)}</Caption1>
                                  </TableCell>
                                  <TableCell>
                                    <Caption1>{formatDisplayDate(t.horaLlegada)}</Caption1>
                                  </TableCell>
                                  {esAdmin && (
                                    <TableCell>
                                      <Tooltip content="Editar trayecto" relationship="label">
                                        <Button
                                          type="button"
                                          icon={<Edit24Regular />}
                                          appearance="subtle"
                                          size="small"
                                          onClick={(e) => { e.stopPropagation(); abrirDialogoEditarTrayectoInline(viaje.id, t); }}
                                        />
                                      </Tooltip>
                                      <Tooltip content="Eliminar trayecto" relationship="label">
                                        <Button
                                          type="button"
                                          icon={<Delete24Regular />}
                                          appearance="subtle"
                                          size="small"
                                          onClick={(e) => { e.stopPropagation(); confirmarEliminarTrayecto(viaje.id, t.id); }}
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
                    <div className={estilos.datoValor}>
                      {(() => {
                        const mat = (typeof viaje.matricula === 'object' && viaje.matricula !== null) ? viaje.matricula.matricula : (viaje.vehiculoMatricula || viaje.matricula || '—');
                        const v = listaVehiculos.find(veh => veh.matricula?.trim().toUpperCase() === mat.trim().toUpperCase());
                        return v ? `${mat} - ${v.marca} ${v.modelo}` : mat;
                      })()}
                    </div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Salida</div>
                    <div className={estilos.datoValor}>{viaje.fechaSalida ? new Date(viaje.fechaSalida).toLocaleDateString('es-ES') : '—'}</div>
                  </div>
                  <div>
                    <div className={estilos.datoEtiqueta}>Llegada</div>
                    <div className={estilos.datoValor}>{viaje.fechaLlegada ? new Date(viaje.fechaLlegada).toLocaleDateString('es-ES') : '—'}</div>
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
                    <div className={estilos.datoValor}>{(typeof viaje.conductor === 'object' && viaje.conductor !== null) ? `${viaje.conductor.nombre} ${viaje.conductor.apellidos} (${viaje.conductor.dni})` : (viaje.conductorDni || viaje.conductor || 'Sin asignar')}</div>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacingVerticalS, flexWrap: 'wrap', gap: '8px' }}>
                      <div className={estilos.rutaVisual} style={{ flexWrap: 'wrap', padding: 0 }}>
                        <Location24Regular style={{ color: tokens.colorBrandForeground1 }} />
                        {puntosRuta.map((punto, i) => (
                          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className={estilos.puntoRuta}>{punto}</span>
                            {i < puntosRuta.length - 1 && <ArrowRight16Regular style={{ color: tokens.colorNeutralForeground3 }} />}
                          </span>
                        ))}
                      </div>
                      {esAdmin && (
                        <Button
                          type="button"
                          appearance="outline"
                          icon={<Add24Regular />}
                          onClick={(e) => { e.stopPropagation(); abrirDialogoCrearTrayectoInline(viaje.id); }}
                          size="small"
                        >
                          Añadir trayecto
                        </Button>
                      )}
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
                          {esAdmin && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalS }}>
                              <Button
                                type="button"
                                icon={<Edit24Regular />}
                                appearance="subtle"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); abrirDialogoEditarTrayectoInline(viaje.id, t); }}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                icon={<Delete24Regular />}
                                appearance="subtle"
                                size="small"
                                style={{ color: tokens.colorPaletteRedForeground1 }}
                                onClick={(e) => { e.stopPropagation(); confirmarEliminarTrayecto(viaje.id, t.id); }}
                              >
                                Eliminar
                              </Button>
                            </div>
                          )}
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
                  <Field label="Descripción del viaje" required validationState={erroresValidacion.descripcion ? 'error' : undefined} validationMessage={erroresValidacion.descripcion}>
                    <Input
                      value={viajeActual.descripcion || ''}
                      onChange={(_, d) => { manejarCambioViaje('descripcion', d.value); setErroresValidacion(prev => ({...prev, descripcion: undefined})); }}
                      placeholder="Ruta sur peninsular"
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Conductor" required validationState={erroresValidacion.conductorDni ? 'error' : undefined} validationMessage={erroresValidacion.conductorDni}>
                    <Select
                      value={viajeActual.conductorDni || ''}
                      onChange={(_, d) => { manejarCambioViaje('conductorDni', d.value); setErroresValidacion(prev => ({...prev, conductorDni: undefined})); }}
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
                <div className={estilos.filaFormulario}>
                  <Field label="Vehículo (Matrícula)" required validationState={erroresValidacion.vehiculoMatricula ? 'error' : undefined} validationMessage={erroresValidacion.vehiculoMatricula}>
                    {editando ? (
                      (() => {
                        const vAsociado = listaVehiculos.find(v => v.matricula?.trim().toUpperCase() === viajeActual.vehiculoMatricula?.trim().toUpperCase());
                        const displayVal = vAsociado 
                          ? `${viajeActual.vehiculoMatricula} - ${vAsociado.marca} ${vAsociado.modelo}`
                          : viajeActual.vehiculoMatricula;
                        return <Input value={displayVal || ''} disabled />;
                      })()
                    ) : (
                      <Select
                        value={viajeActual.vehiculoMatricula || ''}
                        onChange={(_, d) => { manejarCambioViaje('vehiculoMatricula', d.value); setErroresValidacion(prev => ({...prev, vehiculoMatricula: undefined})); }}
                      >
                        <option value="">Selecciona un vehículo...</option>
                        {vehiculosSeleccionables.map(v => (
                          <option key={v.matricula} value={v.matricula}>
                            {v.matricula} - {v.marca} {v.modelo}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
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
                  <Field label="Fecha Salida" required validationState={erroresValidacion.fechaSalida ? 'error' : undefined} validationMessage={erroresValidacion.fechaSalida}>
                    <Input
                      type="date"
                      value={formatForDate(viajeActual.fechaSalida)}
                      onChange={(_, d) => { manejarCambioViaje('fechaSalida', d.value); setErroresValidacion(prev => ({ ...prev, fechaSalida: undefined, fechaLlegada: undefined })); }}
                    />
                  </Field>
                  <Field label="Fecha Llegada" validationState={erroresValidacion.fechaLlegada ? 'error' : undefined} validationMessage={erroresValidacion.fechaLlegada}>
                    <Input
                      type="date"
                      value={formatForDate(viajeActual.fechaLlegada)}
                      onChange={(_, d) => { manejarCambioViaje('fechaLlegada', d.value); setErroresValidacion(prev => ({ ...prev, fechaLlegada: undefined })); }}
                    />
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

      {/* Diálogo para gestión INLINE de trayectos */}
      <Dialog open={dialogoTrayectoAbierto} onOpenChange={(_, d) => { 
        if (!d.open) {
          setDialogoTrayectoAbierto(false);
        }
      }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>{editandoTrayectoInline ? 'Editar trayecto' : 'Nuevo trayecto'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <div className={estilos.filaFormulario}>
                  <Field label="Origen" required>
                    <Input 
                      disabled={origenFijado}
                      value={trayectoActualInline.origen || ''} 
                      onChange={(_, d) => setTrayectoActualInline(prev => ({ ...prev, origen: d.value }))} 
                      placeholder="Madrid" 
                    />
                  </Field>
                  <Field label="Destino" required>
                    <Input 
                      value={trayectoActualInline.destino || ''} 
                      onChange={(_, d) => setTrayectoActualInline(prev => ({ ...prev, destino: d.value }))} 
                      placeholder="Barcelona" 
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Hora salida">
                    <Input 
                      type="datetime-local" 
                      value={formatForDateTimeLocal(trayectoActualInline.horaSalida)} 
                      onChange={(_, d) => {
                        const isoHora = safeIsoString(d.value);
                        setTrayectoActualInline(prev => {
                          const actualizado = { ...prev, horaSalida: isoHora };
                          // Intentamos recalcular el estado sugerido para el viaje si estamos en modo edición
                          if (editando) {
                            const viajeSimulado = { 
                              ...viajeActual, 
                              trayectos: viajeActual.trayectos.map(t => t.id === actualizado.id ? actualizado : t)
                            };
                            if (!viajeSimulado.trayectos.some(t => t.id === actualizado.id) && !editandoTrayectoInline) {
                              viajeSimulado.trayectos.push(actualizado);
                            }
                            const nuevoEstado = calcularEstadoViaje(viajeSimulado);
                            setViajeActual(v => ({ ...v, estado: nuevoEstado }));
                          }
                          return actualizado;
                        });
                      }} 
                    />
                  </Field>
                  <Field label="Hora llegada">
                    <Input 
                      type="datetime-local" 
                      value={formatForDateTimeLocal(trayectoActualInline.horaLlegada)} 
                      onChange={(_, d) => {
                        const isoHora = safeIsoString(d.value);
                        setTrayectoActualInline(prev => {
                          const actualizado = { ...prev, horaLlegada: isoHora };
                          if (editando) {
                            const viajeSimulado = { 
                              ...viajeActual, 
                              trayectos: viajeActual.trayectos.map(t => t.id === actualizado.id ? actualizado : t)
                            };
                            if (!viajeSimulado.trayectos.some(t => t.id === actualizado.id) && !editandoTrayectoInline) {
                              viajeSimulado.trayectos.push(actualizado);
                            }
                            const nuevoEstado = calcularEstadoViaje(viajeSimulado);
                            setViajeActual(v => ({ ...v, estado: nuevoEstado }));
                          }
                          return actualizado;
                        });
                      }} 
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Km recorridos">
                    <Input 
                      type="number" 
                      value={String(trayectoActualInline.distanciaEnKm || trayectoActualInline.kmRecorridos || 0)} 
                      onChange={(_, d) => setTrayectoActualInline(prev => ({ ...prev, distanciaEnKm: Number(d.value) }))} 
                    />
                  </Field>
                </div>
                <Field label="Conductor">
                  <Select
                    value={trayectoActualInline.conductor || ''}
                    onChange={(_, d) => setTrayectoActualInline(prev => ({ ...prev, conductor: d.value }))}
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
              <Button type="button" appearance="secondary" onClick={() => setDialogoTrayectoAbierto(false)}>Cancelar</Button>
              <Button type="button" appearance="primary" onClick={guardarTrayectoInline}>{editandoTrayectoInline ? 'Guardar cambios' : 'Añadir trayecto'}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

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

export default PaginaViajes;
