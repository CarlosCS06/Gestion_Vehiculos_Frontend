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
  Switch,
  Checkbox,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Input,
  Label,
  Select,
  Field,
  Toolbar,
  ToolbarButton,
  Card,
  Text,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Badge,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Filter24Regular,
  VehicleCar24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import BadgeEstado from '../components/shared/BadgeEstado.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  obtenerPeriodicidadITV,
  calcularProximaItvSugerida,
} from '../services/servicioVehiculos.js';
import { subirImagen } from '../services/servicioImagenes.js';
import {
  ESTADO_VEHICULO,
  TIPO_VEHICULO,
  TIPO_ALIMENTACION,
  crearVehiculoVacio,
} from '../models/Vehiculo.js';

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
    paddingTop: tokens.spacingHorizontalL,
    paddingBottom: tokens.spacingHorizontalL,
    paddingLeft: tokens.spacingHorizontalL,
    paddingRight: tokens.spacingHorizontalL,
    overflow: 'auto',
  },
  tabla: {
    minWidth: '900px',
  },
  filaClickable: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
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
  switchFiltro: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  listaTarjetas: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL, // Espacio suficiente para evitar solapamiento en hover
  },
  resumen: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  tarjetaVehiculo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: '0',
    paddingBottom: '0',
    paddingLeft: '0',
    paddingRight: '0',
    overflow: 'hidden',
    borderRadius: tokens.borderRadiusXLarge,
    background: tokens.colorNeutralBackground1,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderTopColor: tokens.colorNeutralStroke2,
    borderBottomColor: tokens.colorNeutralStroke2,
    borderLeftColor: tokens.colorNeutralStroke2,
    borderRightColor: tokens.colorNeutralStroke2,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    borderLeftStyle: 'solid',
    borderRightStyle: 'solid',
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    borderLeftWidth: '1px',
    borderRightWidth: '1px',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
      borderTopColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
    },
  },
  contenedorImagen: {
    width: '420px',
    minWidth: '420px',
    height: '260px',
    backgroundColor: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: tokens.spacingVerticalS,
    paddingBottom: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    paddingRight: tokens.spacingHorizontalS,
    boxSizing: 'border-box',
  },
  imagenVehiculo: {
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    objectFit: 'contain',
    backgroundColor: 'transparent',
    transition: 'opacity 0.6s ease-in-out',
    position: 'absolute',
    top: '8px',
    left: '8px',
    opacity: 1,
    zIndex: 1,
  },
  imagenHover: {
    width: 'calc(100% - 16px)',
    height: 'calc(100% - 16px)',
    objectFit: 'contain',
    backgroundColor: 'transparent',
    transition: 'opacity 0.6s ease-in-out',
    position: 'absolute',
    top: '8px',
    left: '8px',
    opacity: 0,
    zIndex: 2,
  },
  contenedorImagenActive: {
    '&:hover .imagen-primaria': {
      opacity: 0,
    },
    '&:hover .imagen-secundaria': {
      opacity: 1,
    },
  },
  overlayCarga: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  valorResumen: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
    background: 'linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tarjetaResumen: {
    paddingTop: tokens.spacingHorizontalM,
    paddingBottom: tokens.spacingHorizontalM,
    paddingLeft: tokens.spacingHorizontalM,
    paddingRight: tokens.spacingHorizontalM,
    textAlign: 'center',
    borderRadius: tokens.borderRadiusLarge,
    borderTopStyle: 'none',
    borderBottomStyle: 'none',
    borderLeftStyle: 'none',
    borderRightStyle: 'none',
    boxShadow: tokens.shadow4,
  },
  uploadZone: {
    borderTopWidth: '2px',
    borderBottomWidth: '2px',
    borderLeftWidth: '2px',
    borderRightWidth: '2px',
    borderTopStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: tokens.colorNeutralStroke1,
    borderBottomColor: tokens.colorNeutralStroke1,
    borderLeftColor: tokens.colorNeutralStroke1,
    borderRightColor: tokens.colorNeutralStroke1,
    borderRadius: tokens.borderRadiusLarge,
    paddingTop: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalL,
    paddingLeft: tokens.spacingVerticalL,
    paddingRight: tokens.spacingVerticalL,
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: tokens.colorNeutralBackground2,
    transition: 'all 0.3s ease',
    ':hover': {
      borderTopColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      backgroundColor: tokens.colorBrandBackground2,
    },
  },
  iconoPlaceholder: {
    fontSize: '60px',
    color: tokens.colorNeutralForeground4,
  },
  contenidoTarjeta: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: tokens.spacingHorizontalL,
    gap: tokens.spacingVerticalS,
  },
  cabeceraTarjeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoPrincipal: {
    display: 'flex',
    flexDirection: 'column',
  },
  gridDetalles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: tokens.spacingHorizontalM,
    paddingTop: tokens.spacingVerticalS,
    borderTopColor: tokens.colorNeutralStroke2,
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    marginTop: tokens.spacingVerticalS,
  },
  datoEtiqueta: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: '2px',
  },
  datoValor: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  accionesTarjeta: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  botonBorrar: {
    color: tokens.colorPaletteRedForeground1,
    ':hover': {
      color: tokens.colorPaletteRedForeground1,
      backgroundColor: tokens.colorPaletteRedBackground2,
    },
  },
});

const columnas = [
  { nombre: 'Matrícula', campo: 'matricula' },
  { nombre: 'Marca', campo: 'marca' },
  { nombre: 'Modelo', campo: 'modelo' },
  { nombre: 'Tipo', campo: 'tipo' },
  { nombre: 'Km Totales', campo: 'kilometrosTotales' },
  { nombre: 'Alimentación', campo: 'alimentacion' },
  { nombre: 'Estado', campo: 'estado' },
  { nombre: 'Acciones', campo: 'acciones' },
];

const PaginaVehiculos = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [soloAveriados, setSoloAveriados] = useState(false);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [vehiculoActual, setVehiculoActual] = useState(crearVehiculoVacio());
  const [editando, setEditando] = useState(false);
  const [matriculaEliminar, setMatriculaEliminar] = useState('');
  const [error, setError] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);

  const cargarVehiculos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerVehiculos();
      setVehiculos(datos);
    } catch (err) {
      setError(err.message || 'Error al cargar los vehículos');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  // Efecto para auto-calcular la próxima ITV cuando cambian tipo o antigüedad en el modo creación
  useEffect(() => {
    if (!editando && dialogoAbierto) {
      const sugerencia = calcularProximaItvSugerida(vehiculoActual.tipo, vehiculoActual.anyosAntiguedad);
      setVehiculoActual(prev => ({ ...prev, proximaItv: sugerencia }));
    }
  }, [vehiculoActual.tipo, vehiculoActual.anyosAntiguedad, editando, dialogoAbierto]);

  const vehiculosFiltrados = soloAveriados
    ? vehiculos.filter((v) => v.estado === ESTADO_VEHICULO.AVERIADO)
    : vehiculos;

  const contadores = {
    total: vehiculos.length,
    disponibles: vehiculos.filter((v) => v.estado === ESTADO_VEHICULO.DISPONIBLE).length,
    enTrayecto: vehiculos.filter((v) => v.estado === ESTADO_VEHICULO.EN_TRAYECTO).length,
    averiados: vehiculos.filter((v) => v.estado === ESTADO_VEHICULO.AVERIADO).length,
  };

  const abrirDialogoCrear = () => {
    setVehiculoActual(crearVehiculoVacio());
    setEditando(false);
    setDialogoAbierto(true);
  };

  const abrirDialogoEditar = (vehiculo) => {
    setVehiculoActual({ ...vehiculo });
    setEditando(true);
    setDialogoAbierto(true);
  };

  const manejarSubidaArchivo = async (archivo) => {
    if (!archivo) return;
    setSubiendoImagen(true);
    setError('');
    try {
      const resp = await subirImagen(archivo);
      // Guardamos la URL para la vista previa, el ID y el Nombre para el backend
      manejarCambio('foto', resp.url);
      manejarCambio('idImagen', resp.id);
      manejarCambio('nombreImagen', resp.nombre || resp.display_name || 'vehiculo_archivo');
    } catch (err) {
      setError('Error al subir imagen local: ' + err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const manejarSubidaUrl = async (url) => {
    if (!url || !url.startsWith('http')) return;
    setSubiendoImagen(true);
    setError('');
    try {
      const datosImagen = crearImagenVacia();
      datosImagen.url = url;
      datosImagen.nombre = `vehiculo_${vehiculoActual.matricula || 'nuevo'}`;
      datosImagen.vehiculoMatricula = vehiculoActual.matricula;

      const resp = await subirImagenPorUrl(datosImagen);
      // Guardamos la URL para la vista previa, el ID y el Nombre para el backend
      manejarCambio('foto', resp.url);
      manejarCambio('idImagen', resp.id);
      manejarCambio('nombreImagen', resp.nombre || resp.display_name || 'vehiculo_internet');
    } catch (err) {
      setError('Error al procesar imagen de internet: ' + err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const manejarGuardar = async () => {
    try {
      if (editando) {
        await actualizarVehiculo(vehiculoActual.matricula, vehiculoActual);
      } else {
        await crearVehiculo(vehiculoActual);
      }
      setDialogoAbierto(false);
      setArchivoFoto(null);
      cargarVehiculos();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmarEliminar = (matricula) => {
    setMatriculaEliminar(matricula);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    try {
      await eliminarVehiculo(matriculaEliminar);
      setConfirmacionAbierta(false);
      cargarVehiculos();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const manejarCambio = (campo, valor) => {
    setVehiculoActual((prev) => {
      const nuevoEstado = { ...prev, [campo]: valor };
      // Si cambia el kilometraje total, determinar automáticamente si es nuevo
      if (campo === 'kilometrosTotales') {
        nuevoEstado.nuevo = valor === 0;
      }
      return nuevoEstado;
    });
  };

  if (cargando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
        <Spinner size="large" label="Cargando vehículos..." />
      </div>
    );
  }

  return (
    <div className={estilos.pagina}>
      {/* Cabecera */}
      <div className={estilos.cabecera}>
        <div className={estilos.tituloConIcono}>
          <VehicleCar24Regular style={{ fontSize: '28px', color: tokens.colorBrandForeground1 }} />
          <Title2>Vehículos</Title2>
        </div>
        <Toolbar>
          <div className={estilos.switchFiltro}>
            <Filter24Regular />
            <Switch
              label="Solo averiados"
              checked={soloAveriados}
              onChange={(_, datos) => setSoloAveriados(datos.checked)}
            />
          </div>
          {esAdmin && (
            <ToolbarButton
              appearance="primary"
              icon={<Add24Regular />}
              onClick={abrirDialogoCrear}
            >
              Añadir vehículo
            </ToolbarButton>
          )}
        </Toolbar>
      </div>

      {/* Resumen */}
      <div className={estilos.resumen}>
        <Card className={estilos.tarjetaResumen}>
          <Text className={estilos.valorResumen}>{contadores.total}</Text>
          <Text size={200}>Total</Text>
        </Card>
        <Card className={estilos.tarjetaResumen}>
          <Text className={estilos.valorResumen} style={{ color: '#0f7b0f' }}>{contadores.disponibles}</Text>
          <Text size={200}>Disponibles</Text>
        </Card>
        <Card className={estilos.tarjetaResumen}>
          <Text className={estilos.valorResumen} style={{ color: '#f7630c' }}>{contadores.enTrayecto}</Text>
          <Text size={200}>En trayecto</Text>
        </Card>
        <Card className={estilos.tarjetaResumen}>
          <Text className={estilos.valorResumen} style={{ color: '#d13438' }}>{contadores.averiados}</Text>
          <Text size={200}>Averiados</Text>
        </Card>
      </div>

      {/* Errores */}
      {error && (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Error del servidor</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      <div className={estilos.listaTarjetas}>
        {vehiculosFiltrados.map((vehiculo) => (

          <Card
            key={vehiculo.matricula}
            className={estilos.tarjetaVehiculo}
          >
            <div className={`${estilos.contenedorImagen} ${vehiculo.fotoHover ? estilos.contenedorImagenActive : ''}`}>
              {vehiculo.foto ? (
                <>
                  <img
                    src={vehiculo.foto}
                    alt={vehiculo.modelo}
                    className={`${estilos.imagenVehiculo} imagen-primaria`}
                  />
                  {vehiculo.fotoHover && (
                    <img
                      src={vehiculo.fotoHover}
                      alt={`${vehiculo.modelo} vista secundaria`}
                      className={`${estilos.imagenHover} imagen-secundaria`}
                    />
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <VehicleCar24Regular className={estilos.iconoPlaceholder} />
                </div>
              )}
            </div>

            <div className={estilos.contenidoTarjeta}>
              <div className={estilos.cabeceraTarjeta}>
                <div className={estilos.infoPrincipal}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text size={500} weight="bold">
                      {vehiculo.marca} {vehiculo.modelo}
                    </Text>
                    {vehiculo.nuevo && (
                      <Badge size="small" appearance="outline" style={{ color: tokens.colorPaletteGreenForeground1, borderColor: tokens.colorPaletteGreenForeground1 }}>
                        NUEVO
                      </Badge>
                    )}
                  </div>
                  <Text size={300} style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                    {vehiculo.matricula}
                  </Text>
                </div>
                <div className={estilos.accionesTarjeta}>
                  <BadgeEstado estado={vehiculo.estado} />
                  {esAdmin && (
                    <>
                      <Tooltip content="Editar vehículo" relationship="label">
                        <Button
                          icon={<Edit24Regular />}
                          appearance="subtle"
                          size="small"
                          onClick={(e) => { e.stopPropagation(); abrirDialogoEditar(vehiculo); }}
                        >
                          Editar
                        </Button>
                      </Tooltip>
                      <Tooltip content="Borrar vehículo" relationship="label">
                        <Button
                          icon={<Delete24Regular />}
                          appearance="subtle"
                          size="small"
                          className={estilos.botonBorrar}
                          onClick={(e) => { e.stopPropagation(); confirmarEliminar(vehiculo.matricula); }}
                        >
                          Borrar
                        </Button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>

              <div className={estilos.gridDetalles}>
                <div>
                  <div className={estilos.datoEtiqueta}>Tipo</div>
                  <div className={estilos.datoValor}>{vehiculo.tipo}</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Kilometraje</div>
                  <div className={estilos.datoValor}>{vehiculo.kilometrosTotales.toLocaleString('es-ES')} km</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Alimentación</div>
                  <div className={estilos.datoValor}>{vehiculo.alimentacion}</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Antigüedad</div>
                  <div className={estilos.datoValor}>{vehiculo.anyosAntiguedad} años</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Precio compra</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Fecha compra</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.fechaCompra ? new Date(vehiculo.fechaCompra).toLocaleDateString('es-ES') : '—'}
                  </div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Gasto/km</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.gastoPorKm.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Viajes / Averías / Revisiones</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.trayectos.length} Tr / {vehiculo.averias.length} Av / {vehiculo.revisiones.length} Rev
                  </div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Próxima ITV</div>
                  <div className={estilos.datoValor} style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>
                    {vehiculo.proximaItv || 'No definida'}
                  </div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Periodicidad</div>
                  <div className={estilos.datoValor} style={{ color: obtenerPeriodicidadITV(vehiculo.tipo, vehiculo.anyosAntiguedad).texto === 'Exento' ? tokens.colorPaletteGreenForeground1 : tokens.colorNeutralForeground3 }}>
                    {obtenerPeriodicidadITV(vehiculo.tipo, vehiculo.anyosAntiguedad).texto}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {vehiculosFiltrados.length === 0 && (
          <Card style={{ padding: '40px', textAlign: 'center' }}>
            <Text size={400} style={{ color: tokens.colorNeutralForeground3 }}>
              {soloAveriados ? 'No hay vehículos averiados' : 'No hay vehículos registrados'}
            </Text>
          </Card>
        )}
      </div>

      {/* Diálogo crear/editar */}
      <Dialog open={dialogoAbierto} onOpenChange={(_, datos) => { if (!datos.open) setDialogoAbierto(false); }}>
        <DialogSurface style={{ maxWidth: '600px' }}>
          <DialogBody>
            <DialogTitle>{editando ? 'Editar vehículo' : 'Nuevo vehículo'}</DialogTitle>
            <DialogContent>
              <div className={estilos.formulario}>
                <div className={estilos.filaFormulario}>
                  <Field label="Matrícula" required>
                    <Input
                      value={vehiculoActual.matricula}
                      onChange={(_, d) => manejarCambio('matricula', d.value)}
                      disabled={editando}
                      placeholder="1234-ABC"
                    />
                  </Field>
                  <Field label="Marca" required>
                    <Input
                      value={vehiculoActual.marca}
                      onChange={(_, d) => manejarCambio('marca', d.value)}
                      placeholder="Toyota"
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Modelo" required>
                    <Input
                      value={vehiculoActual.modelo}
                      onChange={(_, d) => manejarCambio('modelo', d.value)}
                      placeholder="Hilux"
                    />
                  </Field>
                  <Field label="Fecha de compra">
                    <Input
                      type="date"
                      value={vehiculoActual.fechaCompra}
                      onChange={(_, d) => manejarCambio('fechaCompra', d.value)}
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Tipo">
                    <Select
                      value={vehiculoActual.tipo}
                      onChange={(_, d) => manejarCambio('tipo', d.value)}
                    >
                      {Object.values(TIPO_VEHICULO).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Alimentación">
                    <Select
                      value={vehiculoActual.alimentacion}
                      onChange={(_, d) => manejarCambio('alimentacion', d.value)}
                    >
                      {Object.values(TIPO_ALIMENTACION).map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Precio de compra (€)">
                    <Input
                      type="number"
                      value={String(vehiculoActual.precio)}
                      onChange={(_, d) => manejarCambio('precio', Number(d.value))}
                    />
                  </Field>
                  <Field label="Km totales">
                    <Input
                      type="number"
                      value={String(vehiculoActual.kilometrosTotales)}
                      onChange={(_, d) => manejarCambio('kilometrosTotales', Number(d.value))}
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Gasto por Km (€)">
                    <Input
                      type="number"
                      step="0.01"
                      value={String(vehiculoActual.gastoPorKm)}
                      onChange={(_, d) => manejarCambio('gastoPorKm', Number(d.value))}
                    />
                  </Field>
                  <Field label="Estado">
                    <Select
                      value={vehiculoActual.estado}
                      onChange={(_, d) => manejarCambio('estado', d.value)}
                    >
                      <option value={ESTADO_VEHICULO.DISPONIBLE}>Disponible</option>
                      <option value={ESTADO_VEHICULO.EN_TRAYECTO}>En trayecto</option>
                      <option value={ESTADO_VEHICULO.AVERIADO}>Averiado</option>
                    </Select>
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Años de antigüedad">
                    <Input
                      type="number"
                      value={String(vehiculoActual.anyosAntiguedad)}
                      onChange={(_, d) => manejarCambio('anyosAntiguedad', Number(d.value))}
                    />
                  </Field>
                  <Field label="Próxima ITV (Año o fecha)" hint="Se calcula automáticamente pero puedes editarlo">
                    <Input
                      value={vehiculoActual.proximaItv}
                      onChange={(_, d) => manejarCambio('proximaItv', d.value)}
                      placeholder="2028 (Pendiente)"
                    />
                  </Field>
                </div>
                <Field label="Imagen del vehículo (Cloudinary)" hint="Se subirá automáticamente al seleccionar archivo o pegar URL">
                  <div className={estilos.formulario}>
                    <div
                      className={estilos.uploadZone}
                      onClick={() => document.getElementById('file-input').click()}
                    >
                      {subiendoImagen ? (
                        <Spinner label="Subiendo a Cloudinary..." />
                      ) : (
                        <>
                          <Title2 size={400}>Haz clic o arrastra una imagen</Title2>
                          <Text size={200} block>Formatos sugeridos: JPG, PNG, WEBP</Text>
                        </>
                      )}
                      <input
                        id="file-input"
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => manejarSubidaArchivo(e.target.files[0])}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                      <Field label="O pega una URL de internet" style={{ flexGrow: 1 }}>
                        <Input
                          placeholder="https://ejemplo.com/foto.jpg"
                          onBlur={(e) => manejarSubidaUrl(e.target.value)}
                        />
                      </Field>
                    </div>

                    {vehiculoActual.foto && (
                      <div style={{ position: 'relative', height: '200px', borderRadius: tokens.borderRadiusLarge, overflow: 'hidden', border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                        <img
                          src={vehiculoActual.foto}
                          alt="Vista previa"
                          style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#ffffff' }}
                        />
                        <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                          <Badge appearance="filled" color="success">Cloudinary Ready</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDialogoAbierto(false)}>
                Cancelar
              </Button>
              <Button appearance="primary" onClick={manejarGuardar} disabled={subiendoImagen}>
                {editando ? 'Guardar cambios' : 'Crear vehículo'}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Diálogo confirmar eliminación */}
      <DialogoConfirmacion
        abierto={confirmacionAbierta}
        titulo="Eliminar vehículo"
        mensaje={`¿Estás seguro de que deseas eliminar el vehículo ${matriculaEliminar}? Esta acción no se puede deshacer.`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setConfirmacionAbierta(false)}
      />
    </div>
  );
};

export default PaginaVehiculos;
