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
  Switch,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Warning24Regular,
  Search24Regular,
  Eye24Regular,
  EyeOff24Regular,
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
import { obtenerConductores } from '../services/servicioConductores.js';
import { ESTADO_VEHICULO } from '../models/Vehiculo.js';
import { formatForDate } from '../utils/dateUtils.js';
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
});

const columnas = [
  { nombre: 'Descripción', campo: 'descripcion' },
  { nombre: 'Vehículo', campo: 'vehiculoMatricula' },
  { nombre: 'Usuario', campo: 'userDni' },
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
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [averiaActual, setAveriaActual] = useState(crearAveriaVacia());
  const [editando, setEditando] = useState(false);
  const [idEliminar, setIdEliminar] = useState('');
  const [error, setError] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [vehiculosTexto, setVehiculosTexto] = useState('');
  const [mostrarOcultos, setMostrarOcultos] = useState(false);
  const [listaVehiculos, setListaVehiculos] = useState([]);
  const [listaConductores, setListaConductores] = useState([]);

  const cargarAverias = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
    }
    try {
      const datos = await obtenerAverias();
      
      // Filtrar duplicados por ID
      const idsVistos = new Set();
      const unicas = datos.filter(a => {
        if (!a.id || idsVistos.has(a.id)) return false;
        idsVistos.add(a.id);
        return true;
      });

      setAverias(unicas);
    } catch (err) {
      setError(err.message || 'Error al cargar las averías');
    } finally {
      if (!silencioso) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    cargarAverias();
    obtenerVehiculos().then(setListaVehiculos).catch(console.error);
    obtenerConductores().then(setListaConductores).catch(console.error);
  }, [cargarAverias]);

  // Funciones helper para mostrar datos con fallback a campos "Hard"
  const obtenerUserDniMostrar = (averia) => {
    if (!averia) return '—';
    
    // Verificar si el userDni existe en la lista de conductores
    const userExiste = listaConductores.some(c => c.dni === averia.userDni);
    
    // Si existe, mostrar userDni; si no, mostrar userDniHard
    if (userExiste) {
      return averia.userDni;
    }
    
    // Si no existe y hay un campo Hard, mostrarlo
    if (averia.userDniHard) {
      return `${averia.userDniHard} (eliminado)`;
    }
    
    // Fallback al userDni original
    return averia.userDni || '—';
  };

  const obtenerVehiculoMatriculaMostrar = (averia) => {
    if (!averia) return '—';
    
    // Verificar si el vehiculoMatricula existe en la lista de vehículos
    const vehiculoExiste = listaVehiculos.some(v => v.matricula === averia.vehiculoMatricula);
    
    // Si existe, mostrar vehiculoMatricula; si no, mostrar vehiculoMatriculaHard
    if (vehiculoExiste) {
      return averia.vehiculoMatricula;
    }
    
    // Si no existe y hay un campo Hard, mostrarlo
    if (averia.vehiculoMatriculaHard) {
      return `${averia.vehiculoMatriculaHard} (eliminado)`;
    }
    
    // Fallback al vehiculoMatricula original
    return averia.vehiculoMatricula || '—';
  };

  const abrirDialogoCrear = () => {
    const nueva = crearAveriaVacia();
    if (!esAdmin && usuario?.dni) {
      nueva.userDni = usuario.dni;
      nueva.fechaAveria = new Date().toISOString().split('T')[0];
    }
    setAveriaActual(nueva);
    setVehiculosTexto('');
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (averia) => {
    const averiaEditada = {
      ...crearAveriaVacia(),
      ...averia,
      // Asegurar que todos los campos tengan valores válidos
      descripcion: averia.descripcion || '',
      userDni: averia.userDni || '',
      fechaAveria: averia.fechaAveria || '',
      fechaComienzoReparacion: averia.fechaComienzoReparacion || '',
      fechaFinReparacion: averia.fechaFinReparacion || '',
      lugarReparacion: averia.lugarReparacion || '',
      costeReparacion: averia.costeReparacion || '',
      resuelta: !!averia.resuelta,
      visible: obtenerVisibleAveria(averia),
    };
    setAveriaActual(averiaEditada);
    // Proteger contra vehiculoMatricula indefinido o nulo
    const vehiculoMatricula = averia.vehiculoMatricula ? averia.vehiculoMatricula : '';
    setVehiculosTexto(vehiculoMatricula);
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    setGuardando(true);
    try {
      const matriculas = vehiculosTexto.split(',').map((v) => v.trim()).filter(Boolean);
      
      // Validar que hay vehículos seleccionados
      // --- VALIDACIONES DE FORMULARIO ---
      const errores = {};

      if (matriculas.length === 0) {
        errores.vehiculoMatricula = 'Debe seleccionar al menos un vehículo afectado.';
      }

      if (!averiaActual.descripcion || averiaActual.descripcion.trim() === '') {
        errores.descripcion = 'Debe proporcionar una descripción de la avería.';
      }

      if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        setGuardando(false);
        return;
      }
      setErroresValidacion({});
      // --- FIN VALIDACIONES ---

      // Datos que se envían al backend - solo campos que espera el backend
      const userDniValue = averiaActual.userDni || usuario?.dni || '';
      const vehiculoMatriculaValue = matriculas[0] || '';
      
      // VALIDACIÓN: Verificar que userDni no está vacío
      if (!userDniValue || userDniValue.trim() === '') {
        setError('Error: No se pudo determinar el DNI del usuario. Por favor, intenta de nuevo.');
        console.error('ERROR CRÍTICO: userDni vacío', { 
          averiaActual_userDni: averiaActual.userDni,
          usuario_dni: usuario?.dni,
          usuario_completo: usuario
        });
        setGuardando(false);
        return;
      }

      // VALIDACIÓN: Verificar que vehiculoMatricula no está vacío
      if (!vehiculoMatriculaValue || vehiculoMatriculaValue.trim() === '') {
        setError('Error: No se ha seleccionado un vehículo válido.');
        setGuardando(false);
        return;
      }
      
      console.log('DEBUG - Datos a enviar:', { 
        userDni: userDniValue, 
        vehiculoMatricula: vehiculoMatriculaValue,
        descripcion: averiaActual.descripcion,
        fechaAveria: averiaActual.fechaAveria,
        resuelta: !!averiaActual.resuelta,
        'averiaActual.resuelta (raw)': averiaActual.resuelta,
        'typeof resuelta': typeof averiaActual.resuelta
      });
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      let esResuelta = !!averiaActual.resuelta;
      if (averiaActual.fechaFinReparacion) {
        const fechaFin = new Date(averiaActual.fechaFinReparacion);
        if (fechaFin <= hoy) {
          esResuelta = true;
        }
      }

      const datosGuardar = {
        descripcion: averiaActual.descripcion || '',
        vehiculoMatricula: vehiculoMatriculaValue,
        userDni: userDniValue,
        fechaAveria: averiaActual.fechaAveria || new Date().toISOString().split('T')[0],
        fechaComienzoReparacion: esAdmin ? (averiaActual.fechaComienzoReparacion || null) : null,
        fechaFinReparacion: esAdmin ? (averiaActual.fechaFinReparacion || null) : null,
        lugarReparacion: esAdmin ? (averiaActual.lugarReparacion || null) : null,
        costeReparacion: esAdmin && averiaActual.costeReparacion ? parseFloat(averiaActual.costeReparacion) : null,
        resuelta: esResuelta,
        visible: averiaActual.visible !== false,
      };
      
      console.log('DEBUG - FINAL datosGuardar.resuelta:', datosGuardar.resuelta, 'typeof:', typeof datosGuardar.resuelta);

      const nuevoVisible = averiaActual.visible !== false;

      setDialogoAbierto(false);
      
      if (editando) {
        await actualizarAveria(averiaActual.id, datosGuardar);
        if (nuevoVisible) {
          localStorage.removeItem(`averia_oculta_${averiaActual.id}`);
        } else {
          localStorage.setItem(`averia_oculta_${averiaActual.id}`, 'true');
        }
      } else {
        const nueva = await crearAveria(datosGuardar);
        if (nueva && nueva.id) {
          if (nuevoVisible) {
            localStorage.removeItem(`averia_oculta_${nueva.id}`);
          } else {
            localStorage.setItem(`averia_oculta_${nueva.id}`, 'true');
          }
        }
      }

      // Lógica de automatización de estado del vehículo
      // Determinar si la avería está resuelta basándose únicamente en el campo resuelta (checkbox)
      const averiaResuelta = datosGuardar.resuelta === true;
      
      const estadoFinal = averiaResuelta ? ESTADO_VEHICULO.DISPONIBLE : ESTADO_VEHICULO.AVERIADO;

      // Actualizar estado de todos los vehículos afectados
      for (const matricula of matriculas) {
        if (matricula) {
          try {
            await actualizarVehiculo(matricula, { estado: estadoFinal });
          } catch (err) {
            console.error(`Error actualizando estado de vehículo ${matricula}:`, err);
            // Continuar con los demás vehículos aunque falle uno
          }
        }
      }

      await cargarAverias(true);
      window.dispatchEvent(new CustomEvent('vehiculosActualizados', {
        detail: { matriculas: matriculas }
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Error al guardar la avería');
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (id) => {
    setIdEliminar(id);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    setEliminando(true);
    setConfirmacionAbierta(false);
    try {
      const averiaAEliminar = averias.find(a => a.id === idEliminar);
      await eliminarAveria(idEliminar);
      
      // Al eliminar la avería, el vehículo vuelve a estar disponible
      if (averiaAEliminar && averiaAEliminar.vehiculoMatricula) {
        try {
          await actualizarVehiculo(averiaAEliminar.vehiculoMatricula, { estado: ESTADO_VEHICULO.DISPONIBLE });
        } catch (err) {
          console.error(`Error actualizando estado de vehículo ${averiaAEliminar.vehiculoMatricula}:`, err);
        }
      }

      await cargarAverias(true);
      window.dispatchEvent(new CustomEvent('vehiculosActualizados', {
        detail: { matriculas: averiaAEliminar?.vehiculoMatricula ? [averiaAEliminar.vehiculoMatricula] : [] }
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Error al eliminar la avería');
    } finally {
      setEliminando(false);
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

  const esAveriaResuelta = (a) => {
    return a.resuelta === true;
  };

  const obtenerVisibleAveria = (a) => {
    if (localStorage.getItem(`averia_oculta_${a.id}`) === 'true') {
      return false;
    }
    return a.visible !== false && a.visible !== 'false' && a.visible !== 0 && a.visible !== '0';
  };

  const averiasFiltradas = averias.filter(a => {
    const esVisible = obtenerVisibleAveria(a);
    if (!mostrarOcultos && !esVisible) return false;

    const estaResuelta = esAveriaResuelta(a);
    if (filtroEstado === 'Resueltas' && !estaResuelta) return false;
    if (filtroEstado === 'En taller' && estaResuelta) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    
    const termClean = term.replace(/[^a-zA-Z0-9]/g, '');
    const plate = obtenerVehiculoMatriculaMostrar(a);
    const plateClean = plate.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const matchesPlate = plateClean.includes(termClean) || plate.toLowerCase().includes(term);

    return (
      (a.id || '').toLowerCase().includes(term) ||
      (a.descripcion || '').toLowerCase().includes(term) ||
      (a.userDni || '').toLowerCase().includes(term) ||
      matchesPlate ||
      (a.lugarReparacion || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <Warning24Regular style={{ fontSize: '28px', color: '#d13438' }} />
          <Title2>Averías</Title2>
        </div>
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input 
            contentBefore={<Search24Regular />} 
            placeholder="Buscar incidencia..." 
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          <Select value={filtroEstado} onChange={(e, d) => setFiltroEstado(d.value)}>
            <option value="Todas">Todos los estados</option>
            <option value="En taller">En taller</option>
            <option value="Resueltas">Resueltas</option>
          </Select>
          {esAdmin && (
            <ToolbarButton
              icon={mostrarOcultos ? <Eye24Regular /> : <EyeOff24Regular />}
              onClick={() => setMostrarOcultos(!mostrarOcultos)}
            >
              {mostrarOcultos ? 'Ocultar invisibles' : 'Mostrar ocultas'}
            </ToolbarButton>
          )}
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
            {averiasFiltradas.map((averia) => {
              const esOculta = !obtenerVisibleAveria(averia);
              return (
                <TableRow key={averia.id} style={esOculta ? { opacity: 0.6 } : undefined}>
                  <TableCell>
                    {averia.descripcion}
                    {esOculta && (
                      <Badge color="severe" appearance="filled" style={{ marginLeft: '8px' }}>
                        Oculta
                      </Badge>
                    )}
                  </TableCell>
                <TableCell>
                  {(() => {
                    const matr = obtenerVehiculoMatriculaMostrar(averia);
                    if (matr === '—') return '—';
                    const v = listaVehiculos.find(veh => veh.matricula?.trim().toUpperCase() === matr.trim().toUpperCase());
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <Badge appearance="outline">{matr}</Badge>
                        {v && <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>{v.marca} {v.modelo}</Text>}
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>{obtenerUserDniMostrar(averia)}</TableCell>
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
                  {esAveriaResuelta(averia) ? (
                    <Badge appearance="filled" color="success">Resuelta / Reparado</Badge>
                  ) : (
                    <Badge appearance="filled" color="warning">En reparación</Badge>
                  )}
                </TableCell>
                <TableCell>
                     <>
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
                    </>
                </TableCell>
              </TableRow>
            ); })}
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

      {/* Vista de Lista Móvil */}
      <div className={estilos.listaMovil}>
        {averiasFiltradas.map((averia) => {
          const esOculta = !obtenerVisibleAveria(averia);
          return (
            <Card key={averia.id} className={estilos.tarjetaMovil} style={esOculta ? { opacity: 0.6 } : undefined}>
              <div className={estilos.tarjetaMovilCabecera}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>Avería reportada</Text>
                      {esOculta && (
                        <Badge color="severe" appearance="filled">
                          Oculta
                        </Badge>
                      )}
                    </div>
                  {esAveriaResuelta(averia) ? (
                    <Badge appearance="filled" color="success">Resuelta</Badge>
                  ) : (
                    <Badge appearance="filled" color="warning">En taller</Badge>
                  )}
                </div>
                <Text size={300} weight="semibold" block style={{ marginBottom: '8px' }}>{averia.descripcion}</Text>
                <div>
                  {(() => {
                    const matr = obtenerVehiculoMatriculaMostrar(averia);
                    if (matr === '—') return null;
                    const v = listaVehiculos.find(veh => veh.matricula?.trim().toUpperCase() === matr.trim().toUpperCase());
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <Badge appearance="outline">{matr}</Badge>
                        {v && <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{v.marca} {v.modelo}</Text>}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            <div className={estilos.tarjetaMovilCuerpo}>
              <div>
                <div className={estilos.datoEtiqueta}>Fecha Avería</div>
                <div className={estilos.datoValor}>{averia.fechaAveria ? new Date(averia.fechaAveria).toLocaleDateString('es-ES') : '—'}</div>
              </div>
              <div>
                <div className={estilos.datoEtiqueta}>Coste</div>
                <div className={estilos.datoValor}>{averia.costeReparacion ? `${averia.costeReparacion} €` : '—'}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div className={estilos.datoEtiqueta}>Usuario</div>
                <div className={estilos.datoValor}>{obtenerUserDniMostrar(averia)}</div>
              </div>
            </div>

            <div className={estilos.accionesMovil}>
              {esAdmin && (
                <>
                  <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(averia)}>
                    Editar
                  </Button>
                  <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(averia.id)}>
                    Borrar
                  </Button>
                </>
              )}
            </div>
          </Card>
        ); })}
        {averias.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay averías registradas</Text>
          </Card>
        )}
      </div>

      <Dialog open={dialogoAbierto} onOpenChange={(_, d) => { if (!d.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '550px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar avería' : 'Registrar avería'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                {esAdmin ? (
                  <>
                    <Field label="Descripción" required validationState={erroresValidacion?.descripcion ? 'error' : undefined} validationMessage={erroresValidacion?.descripcion}>
                      <Input value={averiaActual.descripcion || ''} onChange={(_, d) => { manejarCambio('descripcion', d.value); setErroresValidacion(prev => ({...prev, descripcion: undefined})); }} placeholder="Describe la avería..." />
                    </Field>
                    <Field label="Vehículos afectados" required validationState={erroresValidacion?.vehiculoMatricula ? 'error' : undefined} validationMessage={erroresValidacion?.vehiculoMatricula}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                        <Select
                          value=""
                          style={{ width: '100%', minWidth: '100%', maxWidth: '100%' }}
                          onChange={(_, d) => {
                            if (d.value) {
                              const vehiculosActuales = vehiculosTexto.split(',').map(v => v.trim()).filter(Boolean);
                              if (!vehiculosActuales.includes(d.value)) {
                                const actualizado = [...vehiculosActuales, d.value];
                                setVehiculosTexto(actualizado.join(', '));
                              }
                            }
                          }}
                        >
                          <option value="">Seleccionar vehículo...</option>
                          {listaVehiculos.length === 0 ? (
                            <option disabled>No hay vehículos disponibles</option>
                          ) : (
                            listaVehiculos.map((vehiculo) => (
                              <option key={vehiculo.matricula} value={vehiculo.matricula}>
                                {vehiculo.matricula} - {vehiculo.marca} {vehiculo.modelo}
                              </option>
                            ))
                          )}
                        </Select>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalS }}>
                          {vehiculosTexto.split(',').map((matricula) => {
                            const mat = matricula.trim();
                            if (!mat) return null;
                            const vehiculo = listaVehiculos.find(v => v.matricula?.trim().toUpperCase() === mat.toUpperCase());
                            return (
                               <div
                                 key={mat}
                                 style={{
                                   display: 'inline-flex',
                                   alignItems: 'center',
                                   gap: '4px',
                                   padding: '2px 8px',
                                   borderRadius: '9999px',
                                   backgroundColor: tokens.colorBrandBackground,
                                   color: tokens.colorNeutralForegroundOnBrand,
                                   fontSize: '12px',
                                   fontWeight: '600',
                                   height: '20px',
                                   lineHeight: '20px'
                                 }}
                               >
                                 {vehiculo ? `${mat} - ${vehiculo.marca} ${vehiculo.modelo}` : mat}
                                  <button
                                    type="button"
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      padding: '0 0 0 6px',
                                      color: tokens.colorNeutralForegroundOnBrand,
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      outline: 'none',
                                      pointerEvents: 'auto'
                                    }}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const actualizado = vehiculosTexto.split(',')
                                        .map(v => v.trim())
                                        .filter(v => v !== mat)
                                        .join(', ');
                                      setVehiculosTexto(actualizado);
                                    }}
                                  >
                                    ✕
                                  </button>
                               </div>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    </Field>
                    <div className={estilos.filaFormulario}>
                      <Field label="Fecha avería">
                        <Input 
                          type="date" 
                          value={formatForDate(averiaActual.fechaAveria)} 
                          onChange={(_, d) => manejarCambio('fechaAveria', d.value)} 
                        />
                      </Field>
                      <Field label="Usuario">
                        <Select
                          value={averiaActual.userDni || ''}
                          onChange={(_, d) => manejarCambio('userDni', d.value)}
                        >
                          <option value="">Selecciona un usuario...</option>
                          {listaConductores.map(c => (
                            <option key={c.dni} value={c.dni}>
                              {c.dni} - {c.nombre} {c.apellidos}
                            </option>
                          ))}
                        </Select>
                      </Field>
                      <Field label="Fecha comienzo reparación">
                        <Input type="date" value={formatForDate(averiaActual.fechaComienzoReparacion)} onChange={(_, d) => manejarCambio('fechaComienzoReparacion', d.value)} />
                      </Field>
                      <Field label="Fecha fin reparación">
                        <Input type="date" value={formatForDate(averiaActual.fechaFinReparacion)} onChange={(_, d) => manejarCambio('fechaFinReparacion', d.value)} />
                      </Field>
                      <Field label="Lugar reparación">
                        <Input value={averiaActual.lugarReparacion || ''} onChange={(_, d) => manejarCambio('lugarReparacion', d.value)} placeholder="Taller Central" />
                      </Field>
                      <Field label="Coste reparación">
                        <Input 
                          type="number" 
                          value={averiaActual.costeReparacion || ''} 
                          onChange={(_, d) => manejarCambio('costeReparacion', d.value ? parseFloat(d.value) : 0)} 
                          placeholder="1000" 
                          min="0" 
                          step="0.01" 
                        />
                      </Field>
                      <Field label="Marcar como resuelta">
                        <Switch checked={!!averiaActual.resuelta} onChange={(_, d) => manejarCambio('resuelta', d.checked)} />
                      </Field>
                      <Field label="Visible">
                        <Switch checked={averiaActual.visible !== false} onChange={(_, d) => manejarCambio('visible', d.checked)} />
                      </Field>
                    </div>

                  </>
                ) : (
                  <>
                    <MessageBar intent="info">
                      <MessageBarBody>Reporta cualquier incidencia detectada en el vehículo. El administrador recibirá tu aviso.</MessageBarBody>
                    </MessageBar>
                    <Field label="Vehículo" required validationState={erroresValidacion?.vehiculoMatricula ? 'error' : undefined} validationMessage={erroresValidacion?.vehiculoMatricula}>
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
                    <Field label="Descripción de la incidencia" required validationState={erroresValidacion?.descripcion ? 'error' : undefined} validationMessage={erroresValidacion?.descripcion}>
                      <Input
                        value={averiaActual.descripcion || ''}
                        onChange={(_, d) => { manejarCambio('descripcion', d.value); setErroresValidacion(prev => ({...prev, descripcion: undefined})); }}
                        placeholder="Ej: El motor hace un ruido extraño al arrancar..."
                        textarea
                      />
                    </Field>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <Text size={200}><b>Conductor:</b> {usuario?.dni || 'No disponible'}</Text>
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
            label={eliminando ? "Eliminando avería..." : (editando ? "Modificando avería..." : "Creando avería...")} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaAverias;
