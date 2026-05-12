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
  Search24Regular,
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
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [vehiculosTexto, setVehiculosTexto] = useState('');
  const [listaVehiculos, setListaVehiculos] = useState([]);

  const cargarAverias = useCallback(async () => {
    setCargando(true);
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
      conductorDNI: averia.conductorDNI || averia.userDni || '',
      userDni: averia.userDni || averia.conductorDNI || '',
      fechaAveria: averia.fechaAveria || '',
      fechaComienzoReparacion: averia.fechaComienzoReparacion || '',
      fechaFinReparacion: averia.fechaFinReparacion || '',
      lugarReparacion: averia.lugarReparacion || '',
      costeReparacion: averia.costeReparacion || 0,
      resuelta: !!averia.resuelta,
    };
    setAveriaActual(averiaEditada);
    // Proteger contra vehiculosAveriados indefinido o nulo
    const listaVehiculos = averia.vehiculosAveriados || (averia.vehiculoMatricula ? [averia.vehiculoMatricula] : []);
    setVehiculosTexto(listaVehiculos.join(', '));
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarGuardar = async () => {
    try {
      const matriculas = vehiculosTexto.split(',').map((v) => v.trim()).filter(Boolean);
      
      // Validar que hay vehículos seleccionados
      if (matriculas.length === 0) {
        setError('Debe seleccionar al menos un vehículo afectado');
        return;
      }

      // Validar que hay descripción
      if (!averiaActual.descripcion || averiaActual.descripcion.trim() === '') {
        setError('Debe proporcionar una descripción de la avería');
        return;
      }
      
      const datosGuardar = {
        descripcion: averiaActual.descripcion || '',
        vehiculosAveriados: matriculas,
        vehiculoMatricula: matriculas[0] || '',
        conductorDNI: averiaActual.conductorDNI || averiaActual.userDni || usuario?.dni || '',
        userDni: averiaActual.userDni || averiaActual.conductorDNI || usuario?.dni || '',
        fechaAveria: averiaActual.fechaAveria || new Date().toISOString().split('T')[0],
        fechaComienzoReparacion: averiaActual.fechaComienzoReparacion || '',
        fechaFinReparacion: averiaActual.fechaFinReparacion || '',
        lugarReparacion: averiaActual.lugarReparacion || '',
        costeReparacion: parseFloat(averiaActual.costeReparacion) || 0,
        resuelta: !!averiaActual.resuelta,
        enReparacion: !averiaActual.resuelta && !averiaActual.fechaFinReparacion,
      };

      // Remover campos que no deben enviarse al crear
      if (!editando) {
        delete datosGuardar.id;
      }

      if (editando) {
        await actualizarAveria(averiaActual.id, datosGuardar);
      } else {
        await crearAveria(datosGuardar);
      }

      // Lógica de automatización de estado del vehículo
      // Determinar si la avería está resuelta basándose en la fecha de fin o el campo resuelta
      const averiaResuelta = datosGuardar.resuelta === true || 
                            (datosGuardar.fechaFinReparacion && datosGuardar.fechaFinReparacion.trim() !== '');
      
      const estadoFinal = averiaResuelta ? ESTADO_VEHICULO.DISPONIBLE : ESTADO_VEHICULO.AVERIADO;

      // Actualizar estado de todos los vehículos afectados
      for (const matricula of datosGuardar.vehiculosAveriados) {
        if (matricula) {
          try {
            await actualizarVehiculo(matricula, { estado: estadoFinal });
          } catch (err) {
            console.error(`Error actualizando estado de vehículo ${matricula}:`, err);
            // Continuar con los demás vehículos aunque falle uno
          }
        }
      }

      setDialogoAbierto(false);
      await cargarAverias();
      window.dispatchEvent(new CustomEvent('vehiculosActualizados', {
        detail: { matriculas: datosGuardar.vehiculosAveriados }
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Error al guardar la avería');
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
      
      // Al eliminar la avería, los vehículos vuelven a estar disponibles
      if (averiaAEliminar) {
        const listaVehiculos = averiaAEliminar.vehiculosAveriados || 
                               (averiaAEliminar.vehiculoMatricula ? [averiaAEliminar.vehiculoMatricula] : []);
        
        for (const matricula of listaVehiculos) {
          if (matricula) {
            try {
              await actualizarVehiculo(matricula, { estado: ESTADO_VEHICULO.DISPONIBLE });
            } catch (err) {
              console.error(`Error actualizando estado de vehículo ${matricula}:`, err);
              // Continuar con los demás vehículos aunque falle uno
            }
          }
        }
      }

      setConfirmacionAbierta(false);
      await cargarAverias();
      window.dispatchEvent(new CustomEvent('vehiculosActualizados', {
        detail: { matriculas: averiaAEliminar ? (averiaAEliminar.vehiculosAveriados || [averiaAEliminar.vehiculoMatricula]) : [] }
      }));
      setError('');
    } catch (err) {
      setError(err.message || 'Error al eliminar la avería');
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

  const averiasFiltradas = averias.filter(a => {
    const estaResuelta = a.resuelta || a.fechaFinReparacion;
    if (filtroEstado === 'Resueltas' && !estaResuelta) return false;
    if (filtroEstado === 'En taller' && estaResuelta) return false;

    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    const vehiculosStr = a.vehiculosAveriados ? a.vehiculosAveriados.join(' ').toLowerCase() : '';
    return (
      (a.id || '').toLowerCase().includes(term) ||
      (a.descripcion || '').toLowerCase().includes(term) ||
      (a.conductorDNI || '').toLowerCase().includes(term) ||
      (a.userDni || '').toLowerCase().includes(term) ||
      (a.vehiculoMatricula || '').toLowerCase().includes(term) ||
      (a.lugarReparacion || '').toLowerCase().includes(term) ||
      vehiculosStr.includes(term)
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
            {averiasFiltradas.map((averia) => (
              <TableRow key={averia.id}>
                <TableCell>{averia.descripcion}</TableCell>
                <TableCell>
                  {(averia.vehiculosAveriados || (averia.vehiculoMatricula ? [averia.vehiculoMatricula] : [])).map((matricula) => (
                    <Badge key={matricula} appearance="outline" style={{ marginRight: '4px' }}>
                      {matricula}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>{averia.conductorDNI || averia.userDni || '—'}</TableCell>
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
                  {averia.resuelta || averia.fechaFinReparacion ? (
                    <Badge appearance="filled" color="success">Resuelta / Reparado</Badge>
                  ) : (
                    <Badge appearance="filled" color="warning">En reparación</Badge>
                  )}
                </TableCell>
                <TableCell>
                     <>
                      {!averia.resuelta && (
                        <Tooltip content="Marcar como resuelta" relationship="label">
                          <Button 
                            icon={<Badge color="success" size="extra-small" style={{ minWidth: 0, padding: 0 }} />} 
                            appearance="subtle" 
                            size="small" 
                            onClick={async () => {
                              const datosActualizados = { 
                                ...averia, 
                                resuelta: true, 
                                fechaFinReparacion: new Date().toISOString().split('T')[0],
                                costeReparacion: parseFloat(averia.costeReparacion) || 0
                              };
                              await actualizarAveria(averia.id, datosActualizados);
                              for (const m of (averia.vehiculosAveriados || [averia.vehiculoMatricula])) {
                                if (m) await actualizarVehiculo(m, { estado: ESTADO_VEHICULO.DISPONIBLE });
                              }
                              await cargarAverias();
                            }}
                          />
                        </Tooltip>
                      )}
                      <Tooltip content="Editar" relationship="label">
                        <Button icon={<Edit24Regular />} appearance="subtle" size="small" onClick={() => abrirDialogoEditar(averia)} />
                      </Tooltip>
                      <Tooltip content="Eliminar" relationship="label">
                        <Button icon={<Delete24Regular />} appearance="subtle" size="small" onClick={() => confirmarEliminar(averia.id)} />
                      </Tooltip>
                    </>
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

      {/* Vista de Lista Móvil */}
      <div className={estilos.listaMovil}>
        {averiasFiltradas.map((averia) => (
          <Card key={averia.id} className={estilos.tarjetaMovil}>
            <div className={estilos.tarjetaMovilCabecera}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <Text size={300} weight="semibold" style={{ color: tokens.colorNeutralForeground1 }}>Avería reportada</Text>
                  {averia.resuelta || averia.fechaFinReparacion ? (
                    <Badge appearance="filled" color="success">Resuelta</Badge>
                  ) : (
                    <Badge appearance="filled" color="warning">En taller</Badge>
                  )}
                </div>
                <Text size={300} weight="semibold" block style={{ marginBottom: '8px' }}>{averia.descripcion}</Text>
                <div>
                  {(averia.vehiculosAveriados || (averia.vehiculoMatricula ? [averia.vehiculoMatricula] : [])).map((matricula) => (
                    <Badge key={matricula} appearance="outline" style={{ marginRight: '4px' }}>
                      {matricula}
                    </Badge>
                  ))}
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
                <div className={estilos.datoEtiqueta}>Conductor</div>
                <div className={estilos.datoValor}>{averia.conductorDNI || averia.userDni || '—'}</div>
              </div>
            </div>

            <div className={estilos.accionesMovil}>
              {!averia.resuelta && (
                <Button 
                  icon={<Badge color="success" size="extra-small" style={{ minWidth: 0, padding: 0 }} />} 
                  appearance="subtle" 
                  onClick={async () => {
                    const datosActualizados = { 
                      ...averia, 
                      resuelta: true, 
                      fechaFinReparacion: new Date().toISOString().split('T')[0],
                      costeReparacion: parseFloat(averia.costeReparacion) || 0
                    };
                    await actualizarAveria(averia.id, datosActualizados);
                    for (const m of (averia.vehiculosAveriados || [averia.vehiculoMatricula])) {
                      if (m) await actualizarVehiculo(m, { estado: ESTADO_VEHICULO.DISPONIBLE });
                    }
                    await cargarAverias();
                  }}
                >
                  Resolver
                </Button>
              )}
              <Button icon={<Edit24Regular />} appearance="subtle" onClick={() => abrirDialogoEditar(averia)}>
                Editar
              </Button>
              <Button icon={<Delete24Regular />} appearance="subtle" style={{ color: tokens.colorPaletteRedForeground1 }} onClick={() => confirmarEliminar(averia.id)}>
                Borrar
              </Button>
            </div>
          </Card>
        ))}
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
                    <Field label="Descripción" required>
                      <Input value={averiaActual.descripcion || ''} onChange={(_, d) => manejarCambio('descripcion', d.value)} placeholder="Describe la avería..." />
                    </Field>
                    <Field label="Vehículos afectados" required>
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
                            const vehiculo = listaVehiculos.find(v => v.matricula === mat);
                            return (
                              <Badge
                                key={mat}
                                appearance="filled"
                                color="brand"
                                style={{ paddingRight: tokens.spacingHorizontalS }}
                                action={{
                                  icon: <span style={{ cursor: 'pointer', marginLeft: tokens.spacingHorizontalXS }}>✕</span>,
                                  onClick: () => {
                                    const actualizado = vehiculosTexto.split(',')
                                      .map(v => v.trim())
                                      .filter(v => v !== mat)
                                      .join(', ');
                                    setVehiculosTexto(actualizado);
                                  }
                                }}
                              >
                                {vehiculo ? `${mat} - ${vehiculo.marca}` : mat}
                              </Badge>
                            );
                          }).filter(Boolean)}
                        </div>
                      </div>
                    </Field>
                    <div className={estilos.filaFormulario}>
                      <Field label="Fecha avería">
                        <Input 
                          type="date" 
                          value={averiaActual.fechaAveria || ''} 
                          onChange={(_, d) => manejarCambio('fechaAveria', d.value)} 
                        />
                      </Field>
                      <Field label="Conductor">
                        <Input value={averiaActual.conductorDNI || averiaActual.userDni || ''} onChange={(_, d) => manejarCambio('conductorDNI', d.value)} placeholder="DNI..." />
                      </Field>
                      <Field label="Fecha comienzo reparación">
                        <Input type="date" value={averiaActual.fechaComienzoReparacion || ''} onChange={(_, d) => manejarCambio('fechaComienzoReparacion', d.value)} />
                      </Field>
                      <Field label="Fecha fin reparación">
                        <Input type="date" value={averiaActual.fechaFinReparacion || ''} onChange={(_, d) => manejarCambio('fechaFinReparacion', d.value)} />
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
                    </div>
                     <Field>
                      <Checkbox
                        label="¿Está la avería ya resuelta?"
                        checked={!!averiaActual.resuelta}
                        onChange={(_, d) => manejarCambio('resuelta', !!d.checked)}
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
                        value={averiaActual.descripcion || ''}
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
