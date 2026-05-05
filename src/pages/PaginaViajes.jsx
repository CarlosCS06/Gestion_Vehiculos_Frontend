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
  Divider,
  Caption1,
  Subtitle2,
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
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerViajes,
  crearViaje,
  actualizarViaje,
  eliminarViaje,
} from '../services/servicioViajes.js';
import { obtenerVehiculos, actualizarVehiculo } from '../services/servicioVehiculos.js';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';
import { crearViajeVacio, crearTrayectoDeViajeVacio, ESTADO_VIAJE } from '../models/Viaje.js';

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
  switch (estado) {
    case ESTADO_VIAJE.EN_CURSO:
      return <Badge appearance="filled" color="warning">En curso</Badge>;
    case ESTADO_VIAJE.COMPLETADO:
      return <Badge appearance="filled" color="success">Completado</Badge>;
    default:
      return <Badge appearance="filled" color="informative">Pendiente</Badge>;
  }
};

const calcularTotales = (trayectos) => {
  const kmTotales = trayectos.reduce((sum, t) => sum + (t.kmRecorridos || 0), 0);
  const gastoTotal = trayectos.reduce((sum, t) => sum + (t.gastoGasolina || 0), 0);
  return { kmTotales, gastoTotal };
};

const construirRutaTexto = (trayectos) => {
  if (!trayectos || trayectos.length === 0) return [];
  const puntos = [trayectos[0].origen];
  trayectos.forEach((t) => {
    if (t.destino) puntos.push(t.destino);
  });
  return puntos.filter(Boolean);
};

const columnas = [
  { nombre: '', campo: 'expandir' },
  { nombre: 'ID', campo: 'id' },
  { nombre: 'Nombre', campo: 'nombre' },
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

  const cargarViajes = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerViajes();
      const filtrados = esAdmin ? datos : datos.filter(v => v.conductor === usuario?.dni);
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
      trayectos: viaje.trayectos.map((t) => ({ ...t })),
    });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    try {
      if (editando) {
        await actualizarViaje(viajeActual.id, viajeActual);
      } else {
        await crearViaje(viajeActual);
      }

      // Lógica de automatización de estado del vehículo
      if (viajeActual.matricula) {
        let nuevoEstadoVehiculo = ESTADO_VEHICULO.DISPONIBLE;
        
        if (viajeActual.estado === ESTADO_VIAJE.EN_CURSO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.EN_TRAYECTO;
        } else if (viajeActual.estado === ESTADO_VIAJE.COMPLETADO) {
          nuevoEstadoVehiculo = ESTADO_VEHICULO.DISPONIBLE;
        } else if (viajeActual.estado === ESTADO_VIAJE.PENDIENTE) {
          // Si está pendiente, solemos dejarlo disponible a menos que ya estuviera en otra cosa
          nuevoEstadoVehiculo = ESTADO_VEHICULO.DISPONIBLE;
        }

        await actualizarVehiculo(viajeActual.matricula, { estado: nuevoEstadoVehiculo });
      }

      setDialogoAbierto(false);
      cargarViajes();
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
      await eliminarViaje(idEliminar);
      setConfirmacionAbierta(false);
      cargarViajes();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCompletarViaje = async (viaje) => {
    try {
      const viajeActualizado = { ...viaje, estado: ESTADO_VIAJE.COMPLETADO };
      await actualizarViaje(viaje.id, viajeActualizado);
      
      // Actualizar vehículo a disponible
      if (viaje.matricula) {
        await actualizarVehiculo(viaje.matricula, { estado: ESTADO_VEHICULO.DISPONIBLE });
      }
      
      cargarViajes();
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
    try {
      const viaje = viajes.find((v) => v.id === trayectoInline.viajeId);
      if (!viaje) return;
      const nuevosTrayectos = viaje.trayectos.map((t) => ({ ...t }));
      nuevosTrayectos[trayectoInline.indice] = { ...trayectoInline.datos };
      // Reencadenar destinos -> orígenes
      if (trayectoInline.indice < nuevosTrayectos.length - 1) {
        nuevosTrayectos[trayectoInline.indice + 1] = {
          ...nuevosTrayectos[trayectoInline.indice + 1],
          origen: trayectoInline.datos.destino,
        };
      }
      await actualizarViaje(viaje.id, { ...viaje, trayectos: nuevosTrayectos });
      setDialogoTrayectoAbierto(false);
      cargarViajes();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmarEliminarTrayectoInline = (viajeId, indice) => {
    setTrayectoEliminarInfo({ viajeId, indice });
    setConfirmacionTrayectoAbierta(true);
  };

  const eliminarTrayectoInline = async () => {
    try {
      const viaje = viajes.find((v) => v.id === trayectoEliminarInfo.viajeId);
      if (!viaje) return;
      const nuevosTrayectos = viaje.trayectos.filter((_, i) => i !== trayectoEliminarInfo.indice);
      // Reencadenar orígenes
      for (let i = 1; i < nuevosTrayectos.length; i++) {
        nuevosTrayectos[i] = { ...nuevosTrayectos[i], origen: nuevosTrayectos[i - 1].destino };
      }
      await actualizarViaje(viaje.id, { ...viaje, trayectos: nuevosTrayectos });
      setConfirmacionTrayectoAbierta(false);
      cargarViajes();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando viajes..." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <VehicleBus24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Viajes</Title2>
        </div>
        {esAdmin && (
          <Toolbar>
            <ToolbarButton appearance="primary" icon={<Add24Regular />} onClick={abrirDialogoCrear}>
              Añadir viaje
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
        <Table style={{ minWidth: '900px' }}>
          <TableHeader>
            <TableRow>
              {columnas.map((col) => (
                <TableHeaderCell key={col.campo}><strong>{col.nombre}</strong></TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {viajes.map((viaje) => {
              const { kmTotales, gastoTotal } = calcularTotales(viaje.trayectos);
              const expandido = expandidos[viaje.id];
              const puntosRuta = construirRutaTexto(viaje.trayectos);

              return (
                <>
                  <TableRow key={viaje.id} className={estilos.filaExpandible} onClick={() => toggleExpandir(viaje.id)}>
                    <TableCell>
                      {expandido
                        ? <ChevronDown24Regular />
                        : <ChevronRight24Regular />
                      }
                    </TableCell>
                    <TableCell><strong>{viaje.id}</strong></TableCell>
                    <TableCell>{viaje.nombre}</TableCell>
                    <TableCell><strong>{viaje.matricula}</strong></TableCell>
                    <TableCell>{viaje.conductor}</TableCell>
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
                                <TableHeaderCell><strong>Gasto</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Salida</strong></TableHeaderCell>
                                <TableHeaderCell><strong>Llegada</strong></TableHeaderCell>
                                {esAdmin && <TableHeaderCell><strong>Acciones</strong></TableHeaderCell>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {viaje.trayectos.map((t, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>{t.origen}</TableCell>
                                  <TableCell>{t.destino}</TableCell>
                                  <TableCell>{t.kmRecorridos.toLocaleString('es-ES')} km</TableCell>
                                  <TableCell>{t.gastoGasolina.toFixed(2)} €</TableCell>
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
                                      {viaje.trayectos.length > 1 && (
                                        <Tooltip content="Eliminar trayecto" relationship="label">
                                          <Button
                                            icon={<Delete24Regular />}
                                            appearance="subtle"
                                            size="small"
                                            onClick={() => confirmarEliminarTrayectoInline(viaje.id, idx)}
                                          />
                                        </Tooltip>
                                      )}
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
                </>
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

      {/* Diálogo crear / editar viaje */}
      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '720px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar viaje' : 'Nuevo viaje'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                {/* Datos del viaje */}
                <div className={estilos.filaFormulario}>
                  <Field label="Nombre del viaje" required>
                    <Input
                      value={viajeActual.nombre}
                      onChange={(_, d) => manejarCambioViaje('nombre', d.value)}
                      placeholder="Ruta sur peninsular"
                    />
                  </Field>
                  <Field label="DNI Conductor" required>
                    <Input
                      value={viajeActual.conductor}
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
                      {listaVehiculos.map(v => (
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
                      value={viajeActual.fecha}
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
                </div>

                <Divider />

                {/* Trayectos dinámicos */}
                <Subtitle2>Trayectos del viaje</Subtitle2>
                <div className={estilos.seccionTrayectos}>
                  {viajeActual.trayectos.map((trayecto, idx) => (
                    <div key={idx} className={estilos.trayectoCard}>
                      <div className={estilos.trayectoCardCabecera}>
                        <Badge appearance="outline" color="brand">Trayecto {idx + 1}</Badge>
                        {viajeActual.trayectos.length > 1 && (
                          <Tooltip content="Quitar trayecto" relationship="label">
                            <Button
                              icon={<Subtract24Regular />}
                              appearance="subtle"
                              size="small"
                              onClick={() => eliminarTrayectoDelViaje(idx)}
                            />
                          </Tooltip>
                        )}
                      </div>
                      <div className={estilos.filaFormulario}>
                        <Field label="Origen" required hint={idx > 0 ? 'Se hereda del destino anterior' : undefined}>
                          <Input
                            value={trayecto.origen}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'origen', d.value)}
                            placeholder="Madrid"
                            readOnly={idx > 0}
                            style={idx > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                          />
                        </Field>
                        <Field label="Destino" required>
                          <Input
                            value={trayecto.destino}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'destino', d.value)}
                            placeholder="Toledo"
                          />
                        </Field>
                      </div>
                      <div className={estilos.filaFormulario}>
                        <Field label="Km recorridos">
                          <Input
                            type="number"
                            value={String(trayecto.kmRecorridos)}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'kmRecorridos', Number(d.value))}
                          />
                        </Field>
                        <Field label="Gasto gasolina (€)">
                          <Input
                            type="number"
                            step="0.01"
                            value={String(trayecto.gastoGasolina)}
                            onChange={(_, d) => manejarCambioTrayecto(idx, 'gastoGasolina', Number(d.value))}
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
        onCancelar={() => setConfirmacionAbierta(false)}
      />

      {/* Diálogo edición inline de un trayecto */}
      <Dialog open={dialogoTrayectoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoTrayectoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>Editar trayecto</DialogTitle>
            <DialogContent>
              {trayectoInline.datos && (
                <div className={estilos.formulario}>
                  <div className={estilos.filaFormulario}>
                    <Field label="Origen" hint={trayectoInline.indice > 0 ? 'Heredado del trayecto anterior' : undefined}>
                      <Input
                        value={trayectoInline.datos.origen}
                        onChange={(_, d) => manejarCambioTrayectoInline('origen', d.value)}
                        readOnly={trayectoInline.indice > 0}
                        style={trayectoInline.indice > 0 ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
                      />
                    </Field>
                    <Field label="Destino" required>
                      <Input
                        value={trayectoInline.datos.destino}
                        onChange={(_, d) => manejarCambioTrayectoInline('destino', d.value)}
                      />
                    </Field>
                  </div>
                  <div className={estilos.filaFormulario}>
                    <Field label="Km recorridos">
                      <Input
                        type="number"
                        value={String(trayectoInline.datos.kmRecorridos)}
                        onChange={(_, d) => manejarCambioTrayectoInline('kmRecorridos', Number(d.value))}
                      />
                    </Field>
                    <Field label="Gasto gasolina (€)">
                      <Input
                        type="number"
                        step="0.01"
                        value={String(trayectoInline.datos.gastoGasolina)}
                        onChange={(_, d) => manejarCambioTrayectoInline('gastoGasolina', Number(d.value))}
                      />
                    </Field>
                  </div>
                  <div className={estilos.filaFormulario}>
                    <Field label="Hora salida">
                      <Input
                        type="datetime-local"
                        value={trayectoInline.datos.horaSalida}
                        onChange={(_, d) => manejarCambioTrayectoInline('horaSalida', d.value)}
                      />
                    </Field>
                    <Field label="Hora llegada">
                      <Input
                        type="datetime-local"
                        value={trayectoInline.datos.horaLlegada}
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
        onCancelar={() => setConfirmacionTrayectoAbierta(false)}
      />
    </div>
  );
};

export default PaginaViajes;
