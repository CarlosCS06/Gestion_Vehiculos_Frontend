import { useState, useEffect, useCallback, Fragment } from 'react';
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
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
  // Estado para edición inline de trayectos desde la vista expandida
  const [dialogoTrayectoAbierto, setDialogoTrayectoAbierto] = useState(false);
  const [trayectoInline, setTrayectoInline] = useState({ viajeId: '', indice: -1, datos: null });
  const [confirmacionTrayectoAbierta, setConfirmacionTrayectoAbierta] = useState(false);
  const [trayectoEliminarInfo, setTrayectoEliminarInfo] = useState({ viajeId: '', indice: -1 });
  const [listaVehiculos, setListaVehiculos] = useState([]);
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  
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
      // Sincronizar la cadena antes de limpiar para el envío
      const trayectosSincronizados = sincronizarCadenaTrayectos(viajeActual.trayectos || []);

      // Limpiar trayectos para asegurar que se "machacan" correctamente
      const trayectosLimpios = trayectosSincronizados.map(t => {
        const limpio = { ...t };
        // Si el ID está vacío, lo eliminamos para que el backend lo trate como nuevo
        if (limpio.id === '') delete limpio.id;
        return limpio;
      });

      const datosGuardar = {
        ...viajeActual,
        origen: trayectosLimpios[0]?.origen || viajeActual.origen || '',
        destino: trayectosLimpios[trayectosLimpios.length - 1]?.destino || viajeActual.destino || '',
        trayectos: trayectosLimpios
      };

      // Solo enviar trayectos si hay elementos
      if (datosGuardar.trayectos.length === 0) {
        delete datosGuardar.trayectos;
      }

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

  const manejarCambioTrayecto = (indice, campo, valor) => {
    setViajeActual((prev) => {
      const nuevosTrayectos = prev.trayectos.map((t) => ({ ...t }));
      nuevosTrayectos[indice] = { ...nuevosTrayectos[indice], [campo]: valor };
      // Si se cambia el destino, encadenar: el origen del siguiente trayecto = este destino
      if (campo === 'destino' && indice < nuevosTrayectos.length - 1) {
        nuevosTrayectos[indice + 1] = { ...nuevosTrayectos[indice + 1], origen: valor };
      }
      return { ...prev, trayectos: nuevosTrayectos };
    });
  };

  const anadirTrayecto = () => {
    setViajeActual((prev) => {
      const ultimoTrayecto = prev.trayectos[prev.trayectos.length - 1];
      const nuevo = crearTrayectoDeViajeVacio();
      // Aseguramos que el ID esté vacío para que el backend sepa que es nuevo
      nuevo.id = '';
      
      // El origen del nuevo trayecto es el destino del anterior
      if (ultimoTrayecto && ultimoTrayecto.destino) {
        nuevo.origen = ultimoTrayecto.destino;
      }
      return { ...prev, trayectos: [...prev.trayectos, nuevo] };
    });
  };

  const eliminarTrayectoDelViaje = (indice) => {
    setViajeActual((prev) => {
      const nuevosTrayectos = prev.trayectos.filter((_, i) => i !== indice);
      // Reencadenar: cada trayecto (excepto el primero) hereda el destino del anterior como origen
      for (let i = 1; i < nuevosTrayectos.length; i++) {
        nuevosTrayectos[i] = { ...nuevosTrayectos[i], origen: nuevosTrayectos[i - 1].destino };
      }
      return { ...prev, trayectos: nuevosTrayectos };
    });
  };

  // --- Edición inline de trayectos desde la vista expandida ---

  const abrirEditarTrayectoInline = (viajeId, indice, trayecto) => {
    setTrayectoInline({ viajeId, indice, datos: { ...trayecto } });
    setDialogoTrayectoAbierto(true);
  };

  const manejarCambioTrayectoInline = (campo, valor) => {
    setTrayectoInline((prev) => ({
      ...prev,
      datos: { ...prev.datos, [campo]: valor },
    }));
  };

  const guardarTrayectoInline = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const { viajeId, indice, datos } = trayectoInline;
      
      // Buscar el viaje original para obtener todos sus trayectos
      const viajeOriginal = viajes.find(v => v.id === viajeId);
      if (!viajeOriginal) throw new Error('Viaje no encontrado');

      // Crear copia de los trayectos y actualizar el que se editó
      let nuevosTrayectos = viajeOriginal.trayectos.map(t => ({ ...t }));
      nuevosTrayectos[indice] = { ...datos };

      // Sincronizar la cadena completa del viaje
      nuevosTrayectos = sincronizarCadenaTrayectos(nuevosTrayectos);

      console.log('Guardando cambio en cadena de trayectos para el viaje:', viajeId);
      
      // Actualizamos el viaje completo para asegurar la integridad en el backend
      const viajeActualizado = {
        ...viajeOriginal,
        // Normalizar conductor y matrícula por si son objetos
        conductor: (typeof viajeOriginal.conductor === 'object' && viajeOriginal.conductor !== null) ? viajeOriginal.conductor.dni : (viajeOriginal.conductor || ''),
        matricula: (typeof viajeOriginal.matricula === 'object' && viajeOriginal.matricula !== null) ? viajeOriginal.matricula.matricula : (viajeOriginal.matricula || ''),
        trayectos: nuevosTrayectos
      };

      await actualizarViaje(viajeId, viajeActualizado);
      
      setDialogoTrayectoAbierto(false);
      setTrayectoInline({ viajeId: '', indice: -1, datos: null });
      await cargarViajes();
      setError('');
    } catch (err) {
      console.error('Error guardando trayecto inline:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEliminarTrayectoInline = (viajeId, indice) => {
    setTrayectoEliminarInfo({ viajeId, indice });
    setConfirmacionTrayectoAbierta(true);
  };

  const eliminarTrayectoInline = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const viajeOriginal = viajes.find((v) => v.id === trayectoEliminarInfo.viajeId);
      if (!viajeOriginal) throw new Error('Viaje no encontrado');
      
      const trayectoAEliminar = viajeOriginal.trayectos[trayectoEliminarInfo.indice];
      if (!trayectoAEliminar?.id) throw new Error('ID de trayecto no encontrado para eliminación');

      console.log(`Eliminando trayecto individualmente (ID: ${trayectoAEliminar.id})`);
      await eliminarTrayecto(trayectoAEliminar.id);
      
      setConfirmacionTrayectoAbierta(false);
      setTrayectoEliminarInfo({ viajeId: '', indice: -1 });
      await cargarViajes();
      setError('');
    } catch (err) {
      console.error('Error eliminando trayecto inline:', err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
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
                                          onClick={() => abrirEditarTrayectoInline(viaje.id, idx, t)}
                                        />
                                      </Tooltip>
                                      <Tooltip 
                                        content={viaje.trayectos.length > 1 ? "Eliminar trayecto" : "No se puede eliminar el último trayecto de un viaje"} 
                                        relationship="label"
                                      >
                                        <Button
                                          icon={<Delete24Regular />}
                                          appearance="subtle"
                                          size="small"
                                          disabled={viaje.trayectos.length <= 1 || procesando}
                                          onClick={() => confirmarEliminarTrayectoInline(viaje.id, idx)}
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
                {/* Datos del viaje */}
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
                </div>
                <div className={estilos.filaFormulario}>
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

                <Divider />

                {/* Trayectos dinámicos */}
                <Subtitle2>Trayectos del viaje</Subtitle2>
                <div className={estilos.seccionTrayectos}>
                  {viajeActual.trayectos.map((trayecto, idx) => (
                    <div key={idx} className={estilos.trayectoCard}>
                      <div className={estilos.trayectoCardCabecera}>
                        <Badge appearance="outline" color="brand">Trayecto {idx + 1}</Badge>
                        <Tooltip 
                          content={viajeActual.trayectos.length > 1 ? "Quitar trayecto" : "Un viaje debe tener al menos un trayecto"} 
                          relationship="label"
                        >
                          <Button
                            icon={<Subtract24Regular />}
                            appearance="subtle"
                            size="small"
                            disabled={viajeActual.trayectos.length <= 1}
                            onClick={() => eliminarTrayectoDelViaje(idx)}
                          />
                        </Tooltip>
                      </div>
                      <div className={estilos.filaFormulario}>
                        <Field label="Origen" required hint={idx > 0 ? 'Se hereda del destino anterior' : undefined}>
                          <Input
                            value={trayecto.origen || ''}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'origen', d.value)}
                            placeholder="Madrid"
                            readOnly={idx > 0}
                            style={idx > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                          />
                        </Field>
                        <Field label="Destino" required>
                          <Input
                            value={trayecto.destino || ''}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'destino', d.value)}
                            placeholder="Toledo"
                          />
                        </Field>
                      </div>
                      <div className={estilos.filaFormulario}>
                        <Field label="Km recorridos">
                          <Input
                            type="number"
                            value={String(trayecto.distanciaEnKm || 0)}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'distanciaEnKm', Number(d.value))}
                          />
                        </Field>
                      </div>
                      <div className={estilos.filaFormulario}>
                        <Field label="Hora salida">
                          <Input
                            type="datetime-local"
                            value={trayecto.horaSalida}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'horaSalida', d.value)}
                          />
                        </Field>
                        <Field label="Hora llegada">
                          <Input
                            type="datetime-local"
                            value={trayecto.horaLlegada}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'horaLlegada', d.value)}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  className={estilos.botonAnadirTrayecto}
                  appearance="outline"
                  icon={<Add24Regular />}
                  onClick={anadirTrayecto}
                >
                  Añadir trayecto
                </Button>
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

      {/* Diálogo edición inline de un trayecto */}
      <Dialog open={dialogoTrayectoAbierto} onOpenChange={(_, d) => { 
        if (!d.open) {
          setDialogoTrayectoAbierto(false);
          setTrayectoInline({ viajeId: '', indice: -1, datos: null });
        }
      }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>Editar trayecto</DialogTitle>
            <DialogContent>
              {trayectoInline.datos && (
                <div className={estilos.formulario}>
                  <div className={estilos.filaFormulario}>
                    <Field label="Origen" hint={trayectoInline.indice > 0 ? 'Heredado del trayecto anterior' : undefined}>
                      <Input
                        value={trayectoInline.datos.origen || ''}
                        onChange={(_, d) => manejarCambioTrayectoInline('origen', d.value)}
                        readOnly={trayectoInline.indice > 0}
                        style={trayectoInline.indice > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                      />
                    </Field>
                    <Field label="Destino" required>
                      <Input
                        value={trayectoInline.datos.destino || ''}
                        onChange={(_, d) => manejarCambioTrayectoInline('destino', d.value)}
                      />
                    </Field>
                  </div>
                  <div className={estilos.filaFormulario}>
                    <Field label="Km recorridos">
                      <Input
                        type="number"
                        value={String(trayectoInline.datos.distanciaEnKm || 0)}
                        onChange={(_, d) => manejarCambioTrayectoInline('distanciaEnKm', Number(d.value))}
                      />
                    </Field>
                  </div>
                  <div className={estilos.filaFormulario}>
                    <Field label="Hora salida">
                      <Input
                        type="datetime-local"
                        value={trayectoInline.datos.horaSalida || ''}
                        onChange={(_, d) => manejarCambioTrayectoInline('horaSalida', d.value)}
                      />
                    </Field>
                    <Field label="Hora llegada">
                      <Input
                        type="datetime-local"
                        value={trayectoInline.datos.horaLlegada || ''}
                        onChange={(_, d) => manejarCambioTrayectoInline('horaLlegada', d.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoTrayectoAbierto(false)}>Cancelar</Button>
              <Button appearance="primary" onClick={guardarTrayectoInline}>Guardar cambios</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <DialogoConfirmacion
        abierto={confirmacionTrayectoAbierta}
        titulo="Eliminar trayecto"
        mensaje="¿Estás seguro de que deseas eliminar este trayecto? Los orígenes de los trayectos siguientes se ajustarán automáticamente."
        onConfirmar={eliminarTrayectoInline}
        onCancelar={() => {
          setConfirmacionTrayectoAbierta(false);
          setTrayectoEliminarInfo({ viajeId: '', indice: -1 });
        }}
      />
    </div>
  );
};

export default PaginaViajes;
