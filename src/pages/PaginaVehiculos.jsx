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
} from '../services/servicioVehiculos.js';
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
    padding: tokens.spacingHorizontalL,
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
  resumen: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  tarjetaResumen: {
    padding: tokens.spacingHorizontalM,
    textAlign: 'center',
  },
  valorResumen: {
    fontSize: tokens.fontSizeHero700,
    fontWeight: tokens.fontWeightBold,
  },
  listaTarjetas: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  tarjetaVehiculo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: '0',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: tokens.shadow8,
    },
  },
  contenedorImagen: {
    width: '200px',
    minWidth: '200px',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  imagenVehiculo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
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
  { nombre: 'Km Totales', campo: 'kmTotales' },
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

  const cargarVehiculos = useCallback(async () => {
    setCargando(true);
    try {
      const datos = await obtenerVehiculos();
      setVehiculos(datos);
    } catch (err) {
      setError('Error al cargar los vehículos');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

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

  const manejarGuardar = async () => {
    try {
      if (editando) {
        await actualizarVehiculo(vehiculoActual.matricula, vehiculoActual);
      } else {
        await crearVehiculo(vehiculoActual);
      }
      setDialogoAbierto(false);
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
    setVehiculoActual((prev) => ({ ...prev, [campo]: valor }));
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
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      {/* Lista de Vehículos (Tarjetas) */}
      <div className={estilos.listaTarjetas}>
        {vehiculosFiltrados.map((vehiculo) => (
          <Card
            key={vehiculo.matricula}
            className={estilos.tarjetaVehiculo}
          >
            <div className={estilos.contenedorImagen}>
              {vehiculo.foto ? (
                <img
                  src={vehiculo.foto}
                  alt={vehiculo.modelo}
                  className={estilos.imagenVehiculo}
                />
              ) : (
                <VehicleCar24Regular className={estilos.iconoPlaceholder} />
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
                  <div className={estilos.datoValor}>{vehiculo.kmTotales.toLocaleString('es-ES')} km</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Alimentación</div>
                  <div className={estilos.datoValor}>{vehiculo.alimentacion}</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Antigüedad</div>
                  <div className={estilos.datoValor}>{vehiculo.aniosAntiguedad} años</div>
                </div>
                <div>
                  <div className={estilos.datoEtiqueta}>Precio compra</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.precioCompra.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
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
                  <div className={estilos.datoEtiqueta}>Viajes/Averías</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.trayectos.length} Tr / {vehiculo.averias.length} Av / {vehiculo.revisiones.length} Rev
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
                      value={String(vehiculoActual.precioCompra)}
                      onChange={(_, d) => manejarCambio('precioCompra', Number(d.value))}
                    />
                  </Field>
                  <Field label="Km totales">
                    <Input
                      type="number"
                      value={String(vehiculoActual.kmTotales)}
                      onChange={(_, d) => manejarCambio('kmTotales', Number(d.value))}
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
                <Field label="Años de antigüedad">
                  <Input
                    type="number"
                    value={String(vehiculoActual.aniosAntiguedad)}
                    onChange={(_, d) => manejarCambio('aniosAntiguedad', Number(d.value))}
                  />
                </Field>
                <Field label="Foto">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Input
                      value={vehiculoActual.foto}
                      onChange={(_, d) => manejarCambio('foto', d.value)}
                      placeholder="/ToyotaHilux.jpg"
                      style={{ flexGrow: 1 }}
                    />
                    {vehiculoActual.foto && (
                      <div style={{ width: '48px', height: '48px', overflow: 'hidden', borderRadius: '4px', border: `1px solid ${tokens.colorNeutralStroke1}` }}>
                        <img src={vehiculoActual.foto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
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
              <Button appearance="primary" onClick={manejarGuardar}>
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
