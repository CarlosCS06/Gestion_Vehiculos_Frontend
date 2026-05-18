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
  TabList,
  Tab,
} from '@fluentui/react-components';
import {
  Add24Regular,
  Edit24Regular,
  Delete24Regular,
  Filter24Regular,
  VehicleCar24Regular,
  Info24Regular,
  Wrench24Regular,
  ReceiptMoney24Regular,
  Search24Regular,
  Image24Regular,
} from '@fluentui/react-icons';
import { useAuth } from '../context/ContextoAuth.jsx';
import BadgeEstado from '../components/shared/BadgeEstado.jsx';
import DialogoConfirmacion from '../components/shared/DialogoConfirmacion.jsx';
import ModalGestionPlantilla from '../components/shared/ModalGestionPlantilla.jsx';
import {
  obtenerComunidadesAutonomas,
  obtenerProvinciasPorComunidad,
  obtenerMunicipiosPorProvincia,
  obtenerProductosPetroliferos,
  obtenerEstacionesPorFiltros,
  obtenerPrecioMedio,
  generarUrlGoogleMaps,
} from '../services/servicioCarburantes.js';
import {
  obtenerVehiculos,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  obtenerVehiculoPorMatricula,
} from '../services/servicioVehiculos.js';
import { obtenerAverias } from '../services/servicioAverias.js';
import { subirImagen, eliminarImagen } from '../services/servicioImagenes.js';
import {
  ESTADO_VEHICULO,
  TIPO_VEHICULO,
  TIPO_ALIMENTACION,
  crearVehiculoVacio,
} from '../models/Vehiculo.js';
import { crearImagenVacia } from '../models/Imagenes.js';
import { obtenerPlantillas,
  eliminarPlantilla,
  crearPlantilla,
  actualizarPlantilla
} from '../services/servicioPlantillas.js';
import { obtenerViajes } from '../services/servicioViajes.js';
import { validarFechasVehiculo } from '../utils/validaciones.js';

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
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
      borderTopColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
    },
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalM,
      alignItems: 'center',
    }
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
    '@media (max-width: 768px)': {
      width: '80px',
      minWidth: '80px',
      height: '80px',
      padding: 0,
      marginRight: tokens.spacingHorizontalM,
      borderRadius: tokens.borderRadiusMedium,
    }
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
    '@media (max-width: 768px)': {
      padding: 0,
      justifyContent: 'center',
    }
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
    '@media (max-width: 768px)': {
      display: 'none',
    }
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
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: tokens.spacingVerticalXS,
    }
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

const obtenerFechaProximaItv = (vehiculo) => {
  if (vehiculo?.revisiones && vehiculo.revisiones.length > 0) {
    const revisionesItv = vehiculo.revisiones.filter(r => r.esItv);
    if (revisionesItv.length > 0) {
      const hoy = new Date().setHours(0,0,0,0);
      const revisionesItvFuturas = revisionesItv
        .filter(r => new Date(r.fecha) >= hoy)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      
      if (revisionesItvFuturas.length > 0) {
         return new Date(revisionesItvFuturas[0].fecha).toLocaleDateString('es-ES');
      }
      
      const revisionesItvPasadas = revisionesItv.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      return new Date(revisionesItvPasadas[0].fecha).toLocaleDateString('es-ES');
    }
  }

  if (vehiculo?.proximaItv) {
    if (String(vehiculo.proximaItv).includes('Pendiente')) return vehiculo.proximaItv;
    const fecha = new Date(vehiculo.proximaItv);
    if (!isNaN(fecha.getTime())) {
      return fecha.toLocaleDateString('es-ES');
    }
    return vehiculo.proximaItv;
  }

  return 'No definida';
};

const ModalDetallesVehiculo = ({ vehiculo: vehiculoBase, onCerrar, onVehiculoActualizado }) => {
  const { esAdmin } = useAuth();
  const [tabActiva, setTabActiva] = useState('general');
  const [vehiculoCompleto, setVehiculoCompleto] = useState(vehiculoBase);
  const [cargando, setCargando] = useState(false);
  const [comunidades, setComunidades] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [productosPetroliferos, setProductosPetroliferos] = useState([]);
  const [cargandoCarburante, setCargandoCarburante] = useState(false);
  const [subiendoAdicional, setSubiendoAdicional] = useState(false);

  const esElectrico = String(vehiculoCompleto?.alimentacion || '').toLowerCase().includes('eléctr') || String(vehiculoCompleto?.alimentacion || '').toLowerCase().includes('electr');
  const esHibrido = String(vehiculoCompleto?.alimentacion || '').toLowerCase().includes('híbrid') || String(vehiculoCompleto?.alimentacion || '').toLowerCase().includes('hibrid');
  const usaCombustibleLiquido = !esElectrico || esHibrido;

  const manejarSubidaAdicional = async (archivo) => {
    if (!archivo) return;
    setSubiendoAdicional(true);
    try {
      const resp = await subirImagen(archivo, vehiculoCompleto.matricula);

      const nuevasImagenes = vehiculoCompleto.imagenes ? [...vehiculoCompleto.imagenes] : [];
      let nuevaFotoUrl = vehiculoCompleto.foto || '';
      let nuevoIdImagen = vehiculoCompleto.idImagen || null;

      if (nuevasImagenes.length === 0) {
        nuevaFotoUrl = resp.url;
        nuevoIdImagen = resp.id;
      }

      nuevasImagenes.push(resp);

      await actualizarVehiculo(vehiculoCompleto.matricula, {
        foto: nuevaFotoUrl,
        idImagen: nuevoIdImagen,
        imagenes: nuevasImagenes
      });

      setVehiculoCompleto(prev => ({
        ...prev,
        foto: nuevaFotoUrl,
        idImagen: nuevoIdImagen,
        imagenes: nuevasImagenes
      }));

      if (onVehiculoActualizado) {
        onVehiculoActualizado();
      }
    } catch (err) {
      alert('Error al subir imagen adicional: ' + err.message);
    } finally {
      setSubiendoAdicional(false);
    }
  };

  useEffect(() => {
    if (vehiculoBase?.matricula) {
      setCargando(true);
      obtenerVehiculoPorMatricula(vehiculoBase.matricula)
        .then((datosCompletos) => {
          if (datosCompletos) {
            setVehiculoCompleto(datosCompletos);
          }
        })
        .catch(err => console.error("Error cargando detalles del vehículo:", err))
        .finally(() => setCargando(false));
    }
  }, [vehiculoBase]);

  useEffect(() => {
    // Cargar datos de carburantes y comunidades
    obtenerComunidadesAutonomas()
      .then(setComunidades)
      .catch(console.error);

    obtenerProductosPetroliferos()
      .then(setProductosPetroliferos)
      .catch(console.error);

    // Si el vehículo ya tiene comunidad, cargar provincias
    if (vehiculoCompleto?.comunidadAutonomaId) {
      obtenerProvinciasPorComunidad(vehiculoCompleto.comunidadAutonomaId)
        .then(setProvincias)
        .catch(console.error);
    }

    // Si el vehículo ya tiene provincia, cargar municipios
    if (vehiculoCompleto?.provinciaId) {
      obtenerMunicipiosPorProvincia(vehiculoCompleto.provinciaId)
        .then(setMunicipios)
        .catch(console.error);
    }
  }, [vehiculoCompleto?.comunidadAutonomaId, vehiculoCompleto?.provinciaId]);

  const manejarCambioComunidad = async (idComunidad) => {
    const comunidadSeleccionada = comunidades.find(
      (c) => String(c.IDCCAA) === String(idComunidad)
    );

    setVehiculoCompleto(prev => ({
      ...prev,
      comunidadAutonomaId: idComunidad,
      comunidadAutonomaNombre: comunidadSeleccionada?.CCAA || '',
      provinciaId: '',
      provinciaNombre: '',
      municipioId: '',
      municipioNombre: '',
    }));

    setProvincias([]);
    setMunicipios([]);

    if (!idComunidad) return;

    try {
      const datos = await obtenerProvinciasPorComunidad(idComunidad);
      setProvincias(datos);
    } catch (err) {
      console.error('Error al cargar provincias:', err);
    }
  };

  const manejarCambioProvincia = async (idProvincia) => {
    const provinciaSeleccionada = provincias.find(
      (p) => String(p.IDPovincia || p.IDProvincia) === String(idProvincia)
    );

    setVehiculoCompleto(prev => ({
      ...prev,
      provinciaId: idProvincia,
      provinciaNombre: provinciaSeleccionada?.Provincia || '',
      municipioId: '',
      municipioNombre: '',
    }));

    setMunicipios([]);

    if (!idProvincia) return;

    try {
      const datos = await obtenerMunicipiosPorProvincia(idProvincia);
      setMunicipios(datos);
    } catch (err) {
      console.error('Error al cargar municipios:', err);
    }
  };

  const manejarCambioMunicipio = (idMunicipio) => {
    const municipioSeleccionado = municipios.find(
      (m) => String(m.IDMunicipio) === String(idMunicipio)
    );

    setVehiculoCompleto(prev => ({
      ...prev,
      municipioId: idMunicipio,
      municipioNombre: municipioSeleccionado?.Municipio || '',
    }));
  };

  const manejarCambioCarburante = (idProducto) => {
    const productoSeleccionado = productosPetroliferos.find(
      (p) => String(p.IDProducto) === String(idProducto)
    );

    setVehiculoCompleto(prev => ({
      ...prev,
      carburanteId: idProducto,
      carburanteNombre: productoSeleccionado?.NombreProducto || '',
    }));
  };

  const calcularGastoPorKmCarburante = async () => {
    if (!vehiculoCompleto.comunidadAutonomaId) {
      alert('La Comunidad Autónoma es obligatoria para calcular el carburante.');
      return;
    }

    if (!vehiculoCompleto.carburanteId) {
      alert('Selecciona un carburante.');
      return;
    }

    setCargandoCarburante(true);

    try {
      const respuesta = await obtenerEstacionesPorFiltros({
        idComunidad: vehiculoCompleto.comunidadAutonomaId,
        idProvincia: vehiculoCompleto.provinciaId,
        idMunicipio: vehiculoCompleto.municipioId,
        idProducto: vehiculoCompleto.carburanteId,
        matriculaVehiculo: vehiculoCompleto.matricula,
      });

      const precioMedio = obtenerPrecioMedio(respuesta);

      if (!precioMedio) {
        alert('No se ha encontrado precio para ese carburante con esos filtros.');
        return;
      }

      setVehiculoCompleto((prev) => ({
        ...prev,
        precioCarburanteActual: Number(precioMedio.toFixed(3)),
        datosCarburante: respuesta, // Guardamos TODO el objeto procesado para mostrarlo
      }));
    } catch (err) {
      alert('Error al calcular precio del carburante: ' + err.message);
    } finally {
      setCargandoCarburante(false);
    }
  };

  if (!vehiculoCompleto) return null;

  return (
    <Dialog open={true} onOpenChange={(_, d) => { if (!d.open) onCerrar(); }}>
      <DialogSurface style={{ maxWidth: '600px', padding: '24px' }}>
        <DialogBody>
          <DialogTitle>Ficha del Vehículo</DialogTitle>
          <DialogContent style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusLarge, position: 'relative', width: '100%', boxSizing: 'border-box' }}>
              {vehiculoCompleto.foto ? (
                <>
                  <img src={vehiculoCompleto.foto} alt={vehiculoCompleto.modelo} style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }} />
                  {esAdmin && (
                    <Button
                      icon={<Delete24Regular style={{ fontSize: '16px' }} />}
                      size="medium"
                      shape="circular"
                      appearance="primary"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: tokens.colorPaletteRedBackground3,
                        color: tokens.colorPaletteRedForeground3,
                        border: 'none',
                        minWidth: '32px',
                        height: '32px',
                        padding: 0,
                        boxShadow: tokens.shadow8,
                        cursor: 'pointer',
                        zIndex: 20,
                      }}
                      title="Eliminar imagen principal"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('¿Estás seguro de que deseas eliminar la imagen principal? Se usará la siguiente en la lista si existe.')) {
                          // Encontrar la imagen principal en el array de imágenes
                          const imagenPrincipal = vehiculoCompleto.imagenes && vehiculoCompleto.imagenes.length > 0
                            ? vehiculoCompleto.imagenes[0]
                            : null;

                          const idAEliminar = imagenPrincipal?.id || vehiculoCompleto.idImagen;

                          try {
                            // 1. Eliminar físicamente del backend si hay ID
                            if (idAEliminar) {
                              await eliminarImagen(idAEliminar).catch(err => {
                                console.warn('No se pudo borrar físicamente:', err);
                              });
                            }

                            // 2. Calcular nueva lista
                            const nuevasImagenes = vehiculoCompleto.imagenes
                              ? vehiculoCompleto.imagenes.filter(x => x.id !== idAEliminar)
                              : [];

                            // 3. Determinar nueva foto principal
                            const tieneSiguiente = nuevasImagenes.length > 0;
                            const nuevaFotoUrl = tieneSiguiente ? nuevasImagenes[0].url : '';
                            const nuevoIdImagen = tieneSiguiente ? nuevasImagenes[0].id : null;

                            // 4. Actualizar el vehículo en el backend
                            await actualizarVehiculo(vehiculoCompleto.matricula, {
                              foto: nuevaFotoUrl,
                              idImagen: nuevoIdImagen,
                              imagenes: nuevasImagenes
                            });

                            // 5. Actualizar estado local
                            setVehiculoCompleto(prev => ({
                              ...prev,
                              foto: nuevaFotoUrl,
                              idImagen: nuevoIdImagen,
                              imagenes: nuevasImagenes
                            }));

                            // 6. Notificar al padre
                            if (onVehiculoActualizado) {
                              onVehiculoActualizado();
                            }
                          } catch (err) {
                            alert('Error al eliminar imagen principal: ' + err.message);
                          }
                        }
                      }}
                    />
                  )}
                </>
              ) : (
                <VehicleCar24Regular style={{ fontSize: '60px', color: tokens.colorNeutralForeground4 }} />
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text size={500} weight="bold">{vehiculoCompleto.marca} {vehiculoCompleto.modelo}</Text>
              <BadgeEstado estado={vehiculoCompleto.estado} />
            </div>
            <Text size={400} style={{ color: tokens.colorBrandForeground1, fontWeight: 'bold' }}>{vehiculoCompleto.matricula}</Text>

            <TabList selectedValue={tabActiva} onTabSelect={(_, d) => setTabActiva(d.value)} size="small" style={{ marginTop: '8px' }}>
              <Tab value="general" icon={<Info24Regular />}>General</Tab>
              <Tab value="finanzas" icon={<ReceiptMoney24Regular />}>Finanzas</Tab>
              <Tab value="historial" icon={<Wrench24Regular />}>Historial</Tab>
              <Tab value="imagenes" icon={<Image24Regular />}>Imágenes</Tab>
            </TabList>

            <div style={{ paddingTop: '16px', minHeight: '140px' }}>
              {cargando ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Spinner size="medium" label="Cargando historial..." />
                </div>
              ) : (
                <>
                  {tabActiva === 'general' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Tipo</Text><Text size={300} weight="semibold">{vehiculoCompleto.tipo}</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Alimentación</Text><Text size={300} weight="semibold">{vehiculoCompleto.alimentacion}</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Kilometraje</Text><Text size={300} weight="semibold">{vehiculoCompleto.kilometrosTotales.toLocaleString('es-ES')} km</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Matriculación</Text><Text size={300} weight="semibold">{vehiculoCompleto.fechaMatriculacion ? new Date(vehiculoCompleto.fechaMatriculacion).toLocaleDateString('es-ES') : '—'}</Text></div>
                    </div>
                  )}
                  {tabActiva === 'finanzas' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Precio compra</Text><Text size={300} weight="semibold">{vehiculoCompleto.precio.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</Text></div>
                        <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Fecha compra</Text><Text size={300} weight="semibold">{vehiculoCompleto.fechaCompra ? new Date(vehiculoCompleto.fechaCompra).toLocaleDateString('es-ES') : '—'}</Text></div>
                        <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Fecha Matriculación</Text><Text size={300} weight="semibold">{vehiculoCompleto.fechaMatriculacion ? new Date(vehiculoCompleto.fechaMatriculacion).toLocaleDateString('es-ES') : '—'}</Text></div>
                        {usaCombustibleLiquido && (
                          <>
                            <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Gasto por Km</Text><Text size={300} weight="semibold">{(vehiculoCompleto.gastoCombustiblePorKiloetro || 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })}</Text></div>
                            <div>
                              <Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Precio carburante actual</Text>
                              <Text size={300} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>
                                {vehiculoCompleto.precioCarburanteActual ? `${Number(vehiculoCompleto.precioCarburanteActual).toFixed(3)} €/L` : '—'}
                              </Text>
                            </div>
                          </>
                        )}
                      </div>

                      {/* --- PANEL DE HERRAMIENTAS ELÉCTRICAS --- */}
                      {(esElectrico || esHibrido) && (
                        <div style={{
                          marginTop: '8px',
                          padding: '12px 16px',
                          backgroundColor: tokens.colorBrandBackground2,
                          borderRadius: tokens.borderRadiusLarge,
                          border: `1px solid ${tokens.colorBrandStroke1}`,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          <Text weight="bold" style={{ color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase300 }}>
                            ⚡ Herramientas de Carga y Ahorro Eléctrico
                          </Text>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Para consultar el precio de la luz (enchufe básico):</Text>
                              <a 
                                href="https://tarifaluzhora.es/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  color: tokens.colorBrandForegroundLink, 
                                  fontWeight: tokens.fontWeightSemibold,
                                  textDecoration: 'underline',
                                  fontSize: tokens.fontSizeBase200
                                }}
                              >
                                pulsa aqui para ver el precio actual de la luz
                              </a>
                            </div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                              <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>Para buscar un punto de carga:</Text>
                              <a 
                                href="https://www.mapareve.es/mapa-puntos-recarga"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  color: tokens.colorBrandForegroundLink, 
                                  fontWeight: tokens.fontWeightSemibold,
                                  textDecoration: 'underline',
                                  fontSize: tokens.fontSizeBase200
                                }}
                              >
                                clica aqui para ver el punto de carga mas cercano y barato
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- PANEL DE INTELIGENCIA DE CARBURANTES --- */}
                      {usaCombustibleLiquido && vehiculoCompleto.datosCarburante && (
                        <div style={{
                          marginTop: '12px',
                          padding: '16px',
                          backgroundColor: tokens.colorBrandBackground2,
                          borderRadius: tokens.borderRadiusLarge,
                          border: `1px solid ${tokens.colorBrandStroke1}`
                        }}>
                          <Text weight="bold" style={{ color: tokens.colorBrandForeground1, display: 'block', marginBottom: '12px' }}>
                            📊 Análisis de Ahorro ({vehiculoCompleto.carburanteNombre})
                          </Text>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Comparativa de Medias */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
                              {vehiculoCompleto.datosCarburante.precioMedioCCAA && (
                                <div style={{ padding: '8px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusMedium }}>
                                  <Text size={100} block>Media CCAA</Text>
                                  <Text size={200} weight="bold">{vehiculoCompleto.datosCarburante.precioMedioCCAA.toFixed(3)}€</Text>
                                </div>
                              )}
                              {vehiculoCompleto.datosCarburante.precioMedioProvincia && (
                                <div style={{ padding: '8px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusMedium }}>
                                  <Text size={100} block>Media Prov.</Text>
                                  <Text size={200} weight="bold">{vehiculoCompleto.datosCarburante.precioMedioProvincia.toFixed(3)}€</Text>
                                </div>
                              )}
                              {vehiculoCompleto.datosCarburante.precioMedioMunicipio && (
                                <div style={{ padding: '8px', backgroundColor: tokens.colorNeutralBackground1, borderRadius: tokens.borderRadiusMedium }}>
                                  <Text size={100} block>Media Mun.</Text>
                                  <Text size={200} weight="bold">{vehiculoCompleto.datosCarburante.precioMedioMunicipio.toFixed(3)}€</Text>
                                </div>
                              )}
                            </div>

                            {/* La más barata */}
                            <div style={{ padding: '12px', backgroundColor: tokens.colorPaletteGreenBackground1, borderRadius: tokens.borderRadiusMedium, border: `1px solid ${tokens.colorPaletteGreenBorder1}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <Text size={200} weight="bold" style={{ color: tokens.colorPaletteGreenForeground1 }}>📍 Opción más económica encontrada</Text>
                                <Badge color="success" appearance="filled">
                                  {vehiculoCompleto.datosCarburante.precioEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.precioEstacionMasBarataProvincia || vehiculoCompleto.datosCarburante.precioEstacionMasBarataCCAA} €/L
                                </Badge>
                              </div>
                              <a 
                                href={generarUrlGoogleMaps(
                                  vehiculoCompleto.datosCarburante.latitudEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.latitudEstacionMasBarataProvincia || vehiculoCompleto.datosCarburante.latitudEstacionMasBarataCCAA || vehiculoCompleto.datosCarburante.latitudEstacionMasBarata,
                                  vehiculoCompleto.datosCarburante.longitudEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.longitudEstacionMasBarataProvincia || vehiculoCompleto.datosCarburante.longitudEstacionMasBarataCCAA || vehiculoCompleto.datosCarburante.longitudEstacionMasBarata,
                                  vehiculoCompleto.datosCarburante.direccionEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.direccionEstacionMasBarataProvincia || vehiculoCompleto.datosCarburante.direccionEstacionMasBarataCCAA
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: tokens.colorBrandForeground1, textDecoration: 'none', cursor: 'pointer' }}
                                title="Abrir en Google Maps"
                              >
                                <Text size={200} block style={{ fontStyle: 'italic', textDecoration: 'underline' }}>
                                  {vehiculoCompleto.datosCarburante.direccionEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.direccionEstacionMasBarataProvincia || vehiculoCompleto.datosCarburante.direccionEstacionMasBarataCCAA}
                                </Text>
                              </a>
                              <Text size={100} block style={{ marginTop: '4px', opacity: 0.8 }}>
                                en {vehiculoCompleto.datosCarburante.municipioEstacionMasBarataMunicipio || vehiculoCompleto.datosCarburante.municipioEstacionMasBarataProvincia || 'su zona'}
                              </Text>
                            </div>

                            {/* Listado mini si hay estaciones en municipio */}
                            {vehiculoCompleto.datosCarburante.estacionesMunicipio?.length > 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <Text size={100} weight="semibold" block style={{ marginBottom: '8px' }}>Otras gasolineras en {vehiculoCompleto.municipioNombre}:</Text>
                                <div style={{ maxHeight: '100px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {vehiculoCompleto.datosCarburante.estacionesMunicipio.slice(0, 5).map((est, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '4px', borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
                                      <a 
                                        href={generarUrlGoogleMaps(est.latitud || est.Latitud || est.lat, est.longitud || est.Longitud || est.lng || est.lon, est.direccion)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ color: tokens.colorBrandForeground1, textDecoration: 'underline', cursor: 'pointer', flex: 1, minWidth: 0 }}
                                        title="Abrir en Google Maps"
                                      >
                                        <Text size={100} truncate>{est.direccion}</Text>
                                      </a>
                                      <Text size={100} weight="bold">{est.precio}€</Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {usaCombustibleLiquido && (
                        <div style={{ borderTop: `1px solid ${tokens.colorNeutralStroke2}`, paddingTop: '16px' }}>
                          <Text size={400} weight="semibold" style={{ marginBottom: '12px' }}>Configuración de Carburante</Text>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <Field label="Comunidad Autónoma">
                              <Select
                                value={vehiculoCompleto.comunidadAutonomaId || ''}
                                onChange={(_, d) => manejarCambioComunidad(d.value)}
                              >
                                <option value="">Selecciona comunidad</option>
                                {comunidades.map((comunidad) => (
                                  <option key={comunidad.IDCCAA} value={comunidad.IDCCAA}>
                                    {comunidad.CCAA}
                                  </option>
                                ))}
                              </Select>
                            </Field>

                            <Field label="Carburante">
                              <Select
                                value={vehiculoCompleto.carburanteId || ''}
                                onChange={(_, d) => manejarCambioCarburante(d.value)}
                              >
                                <option value="">Selecciona carburante</option>
                                {productosPetroliferos.map((producto) => (
                                  <option key={producto.IDProducto} value={producto.IDProducto}>
                                    {producto.NombreProducto}
                                  </option>
                                ))}
                              </Select>
                            </Field>

                            <Field label="Provincia">
                              <Select
                                value={vehiculoCompleto.provinciaId || ''}
                                disabled={!vehiculoCompleto.comunidadAutonomaId}
                                onChange={(_, d) => manejarCambioProvincia(d.value)}
                              >
                                <option value="">Todas las provincias</option>
                                {provincias.map((provincia) => (
                                  <option
                                    key={provincia.IDPovincia || provincia.IDProvincia}
                                    value={provincia.IDPovincia || provincia.IDProvincia}
                                  >
                                    {provincia.Provincia}
                                  </option>
                                ))}
                              </Select>
                            </Field>

                            <Field label="Municipio">
                              <Select
                                value={vehiculoCompleto.municipioId || ''}
                                disabled={!vehiculoCompleto.provinciaId}
                                onChange={(_, d) => manejarCambioMunicipio(d.value)}
                              >
                                <option value="">Todos los municipios</option>
                                {municipios.map((municipio) => (
                                  <option key={municipio.IDMunicipio} value={municipio.IDMunicipio}>
                                    {municipio.Municipio}
                                  </option>
                                ))}
                              </Select>
                            </Field>
                          </div>

                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button
                              appearance="secondary"
                              onClick={calcularGastoPorKmCarburante}
                              disabled={
                                cargandoCarburante ||
                                !vehiculoCompleto.comunidadAutonomaId ||
                                !vehiculoCompleto.carburanteId
                              }
                            >
                              {cargandoCarburante ? 'Calculando...' : 'Calcular precio'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {tabActiva === 'historial' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Próxima ITV</Text><Text size={300} weight="semibold" style={{ color: tokens.colorBrandForeground1 }}>{obtenerFechaProximaItv(vehiculoCompleto)}</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Revisiones</Text><Text size={300} weight="semibold">{vehiculoCompleto.revisiones?.length || 0}</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Averías</Text><Text size={300} weight="semibold">{vehiculoCompleto.averias?.length || 0}</Text></div>
                      <div><Text size={200} style={{ color: tokens.colorNeutralForeground3 }} block>Viajes</Text><Text size={300} weight="semibold">{vehiculoCompleto.trayectos?.length || 0}</Text></div>
                    </div>
                  )}
                  {tabActiva === 'imagenes' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                      {/* Grid Items: Primero las imágenes de la galería (todas excepto la principal) */}
                      {vehiculoCompleto.imagenes && vehiculoCompleto.imagenes.length > 1 && (
                        vehiculoCompleto.imagenes.slice(1).map((img, idx) => (
                          <div key={img.id || idx} style={{ position: 'relative', aspectRatio: '1', backgroundColor: tokens.colorNeutralBackground2, borderRadius: tokens.borderRadiusMedium, overflow: 'hidden' }}>
                            <img
                              src={img.url}
                              alt={`Imagen ${idx + 2}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            {esAdmin && (
                              <Button
                                icon={<Delete24Regular style={{ fontSize: '14px' }} />}
                                size="small"
                                shape="circular"
                                appearance="primary"
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  backgroundColor: tokens.colorPaletteRedBackground3,
                                  color: tokens.colorPaletteRedForeground3,
                                  border: 'none',
                                  minWidth: '24px',
                                  height: '24px',
                                  padding: 0,
                                  boxShadow: tokens.shadow4,
                                  cursor: 'pointer',
                                  zIndex: 10,
                                }}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm('¿Estás seguro de que deseas eliminar esta imagen de la galería?')) {
                                    try {
                                      // 1. Eliminar físicamente del backend
                                      if (img.id) {
                                        await eliminarImagen(img.id).catch(err => {
                                          console.warn('No se pudo borrar físicamente:', err);
                                        });
                                      }

                                      // 2. Filtrar de la lista de imágenes del vehículo
                                      const nuevasImagenes = vehiculoCompleto.imagenes.filter(x => x.id !== img.id);
                                      
                                      // 3. Llamada a la API para actualizar el vehículo
                                      await actualizarVehiculo(vehiculoCompleto.matricula, {
                                        imagenes: nuevasImagenes
                                      });
                                      
                                      // 4. Actualizar estado local
                                      setVehiculoCompleto(prev => ({
                                        ...prev,
                                        imagenes: nuevasImagenes
                                      }));

                                      // 5. Notificar al padre para que refresque la lista de vehículos
                                      if (onVehiculoActualizado) {
                                        onVehiculoActualizado();
                                      }
                                    } catch (err) {
                                      alert('Error al eliminar imagen: ' + err.message);
                                    }
                                  }
                                }}
                              />
                            )}
                          </div>
                        ))
                      )}

                      {/* Botón interactivo de añadir foto (solo para Admin) */}
                      {esAdmin && (
                        <div 
                          onClick={() => document.getElementById('gallery-file-input').click()}
                          style={{ 
                            aspectRatio: '1', 
                            border: `2px dashed ${tokens.colorNeutralStroke1}`, 
                            borderRadius: tokens.borderRadiusMedium, 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            cursor: 'pointer',
                            backgroundColor: tokens.colorNeutralBackground2,
                            transition: 'all 0.2s ease',
                            gap: '8px'
                          }}
                          title="Añadir nueva imagen a la galería"
                        >
                          {subiendoAdicional ? (
                            <Spinner size="small" label="Subiendo..." />
                          ) : (
                            <>
                              <Add24Regular style={{ color: tokens.colorNeutralForeground4 }} />
                              <Text size={100} style={{ color: tokens.colorNeutralForeground4 }} weight="semibold">Añadir foto</Text>
                            </>
                          )}
                          <input
                            id="gallery-file-input"
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                await manejarSubidaAdicional(file);
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* Mensaje de galería vacía (solo si no hay imágenes adicionales y no somos admin) */}
                      {(!vehiculoCompleto.imagenes || vehiculoCompleto.imagenes.length <= 1) && !esAdmin && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px' }}>
                          <Text size={300} style={{ color: tokens.colorNeutralForeground3 }}>No hay imágenes adicionales</Text>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onCerrar}>Cerrar</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

const PaginaVehiculos = () => {
  const estilos = useEstilos();
  const { esAdmin } = useAuth();

  const [vehiculos, setVehiculos] = useState([]);
  const [averiasAbiertas, setAveriasAbiertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [plantillas, setPlantillas] = useState([]);
  const [confirmacionPlantillaAbierta, setConfirmacionPlantillaAbierta] = useState(false);
  const [dialogoPlantillaAbierto, setDialogoPlantillaAbierto] = useState(false);
  const [plantillaEditar, setPlantillaEditar] = useState(null);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [confirmacionAbierta, setConfirmacionAbierta] = useState(false);
  const [vehiculoActual, setVehiculoActual] = useState(crearVehiculoVacio());
  const [editando, setEditando] = useState(false);
  const [matriculaEliminar, setMatriculaEliminar] = useState('');
  const [error, setError] = useState('');
  const [archivoFoto, setArchivoFoto] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [vehiculoEnDetalle, setVehiculoEnDetalle] = useState(null);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState({});

  const obtenerVehiculosAfectados = (averia) => {
    if (!averia || !averia.vehiculoMatricula) return [];
    return [String(averia.vehiculoMatricula).trim()];
  };

  const cargarVehiculos = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true);
    }
    try {
      const [datosVehiculos, datosAverias, datosViajes] = await Promise.all([
        obtenerVehiculos(),
        obtenerAverias(),
        obtenerViajes()
      ]);

      const averiasActivas = datosAverias.filter((a) => {
        const estaResuelta = a.resuelta === true || (
          a.fechaFinReparacion && 
          a.fechaFinReparacion !== 'null' && 
          a.fechaFinReparacion !== 'undefined' && 
          String(a.fechaFinReparacion).trim() !== ''
        );
        return !estaResuelta;
      });

      // Sincronización de estados basada en Viajes (Lógica de limpieza)
      const matriculasEnTrayecto = new Set(
        datosViajes
          .filter(v => v.estado === 'ACTIVO' && v.vehiculoMatricula)
          .map(v => v.vehiculoMatricula.trim().toUpperCase())
      );

      const vehiculosSincronizados = await Promise.all(datosVehiculos.map(async (vehiculo) => {
        if (!vehiculo.matricula) return vehiculo;

        const matricula = vehiculo.matricula.trim().toUpperCase();
        const vEstado = String(vehiculo.estado || '').toUpperCase();
        const debeEstarEnTrayecto = matriculasEnTrayecto.has(matricula);

        // Si el vehículo dice estar EN_TRAYECTO pero no tiene viajes activos, lo corregimos en el backend
        if (vEstado === 'EN_TRAYECTO' && !debeEstarEnTrayecto) {
          console.log(`[SYNC-VEH] Corrigiendo ${matricula} a DISPONIBLE`);
          await actualizarVehiculo(matricula, { estado: 'DISPONIBLE' });
          return { ...vehiculo, estado: 'DISPONIBLE' };
        }
        return vehiculo;
      }));

      setVehiculos(vehiculosSincronizados);
      setAveriasAbiertas(averiasActivas);
    } catch (err) {
      setError(err.message || 'Error al cargar los vehículos');
    }
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarVehiculos(false); // Carga inicial: muestra spinner
    obtenerPlantillas()
      .then(datos => {
        console.log('Plantillas cargadas:', datos);
        setPlantillas(Array.isArray(datos) ? datos : []);
      })
      .catch(err => console.error('Error al cargar plantillas:', err));
  }, [cargarVehiculos]);

  // Recargar vehículos cuando la ventana vuelve a tener foco (p. ej., cuando se vuelve desde otra pestaña)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        cargarVehiculos(true); // Recarga silenciosa en segundo plano (sin spinner)
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [cargarVehiculos]);

  // Recargar vehículos cuando otra parte de la app actualiza el estado de un vehículo
  useEffect(() => {
    const handleVehiculosActualizados = () => {
      cargarVehiculos(true); // Recarga silenciosa en segundo plano (sin spinner)
    };
    window.addEventListener('vehiculosActualizados', handleVehiculosActualizados);
    return () => window.removeEventListener('vehiculosActualizados', handleVehiculosActualizados);
  }, [cargarVehiculos]);


  const vehiculosAveriadosActivos = new Set(
    averiasAbiertas.flatMap((a) => obtenerVehiculosAfectados(a))
  );

  const vehiculosConEstado = vehiculos.map((v) => ({
    ...v,
    estado: vehiculosAveriadosActivos.has(v.matricula)
      ? ESTADO_VEHICULO.AVERIADO
      : v.estado,
  }));

  const vehiculosFiltrados = vehiculosConEstado.filter((v) => {
    // Filtro categórico
    if (filtroEstado !== 'Todos' && v.estado !== filtroEstado) return false;

    // Luego filtro por búsqueda global
    if (!terminoBusqueda) return true;
    const term = terminoBusqueda.toLowerCase();
    return (
      (v.matricula || '').toLowerCase().includes(term) ||
      (v.marca || '').toLowerCase().includes(term) ||
      (v.modelo || '').toLowerCase().includes(term) ||
      (v.tipo || '').toLowerCase().includes(term) ||
      (v.alimentacion || '').toLowerCase().includes(term) ||
      (v.estado || '').toLowerCase().includes(term)
    );
  });

  const contadores = {
    total: vehiculosConEstado.length,
    disponibles: vehiculosConEstado.filter((v) => v.estado === ESTADO_VEHICULO.DISPONIBLE).length,
    enTrayecto: vehiculosConEstado.filter((v) => v.estado === ESTADO_VEHICULO.EN_TRAYECTO).length,
    averiados: vehiculosConEstado.filter((v) => v.estado === ESTADO_VEHICULO.AVERIADO).length,
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
      // Si estamos editando, pasamos la matrícula para vincularla inmediatamente en el backend.
      // Si es un vehículo nuevo, NO la pasamos para evitar el error 500 de matrícula inexistente.
      const matriculaParaSubir = editando ? vehiculoActual.matricula : null;
      const resp = await subirImagen(archivo, matriculaParaSubir);

      // Guardamos la URL para la vista previa, el ID y el Nombre para el backend
      manejarCambio('foto', resp.url);
      manejarCambio('idImagen', resp.id);
      manejarCambio('nombreImagen', resp.nombre || resp.display_name || 'vehiculo_archivo');

      // Añadir al array de imágenes si no está ya (evitar duplicados)
      setVehiculoActual(prev => {
        const imagenesActuales = prev.imagenes || [];
        if (!imagenesActuales.some(img => img.id === resp.id)) {
          return { ...prev, imagenes: [...imagenesActuales, resp] };
        }
        return prev;
      });
    } catch (err) {
      setError('Error al subir imagen local: ' + err.message);
    } finally {
      setSubiendoImagen(false);
    }
  };

  const manejarGuardar = async () => {
    // --- VALIDACIONES ---
    const errores = {};

    if (!vehiculoActual.matricula || !vehiculoActual.matricula.trim()) {
      errores.matricula = 'La matrícula es obligatoria.';
    }
    if (!vehiculoActual.marca || !vehiculoActual.marca.trim()) {
      errores.marca = 'La marca es obligatoria.';
    }
    if (!vehiculoActual.modelo || !vehiculoActual.modelo.trim()) {
      errores.modelo = 'El modelo es obligatorio.';
    }

    // Validar fechas: matriculación no puede ser posterior a compra
    const resFechas = validarFechasVehiculo(vehiculoActual.fechaMatriculacion, vehiculoActual.fechaCompra);
    if (!resFechas.valido) {
      errores.fechaMatriculacion = resFechas.mensaje;
    }

    if (Object.keys(errores).length > 0) {
      setErroresValidacion(errores);
      return;
    }
    setErroresValidacion({});
    // --- FIN VALIDACIONES ---

    setGuardando(true);
    setDialogoAbierto(false);
    try {
      // Filtrar los campos que se envían al backend
      const camposPermitidos = [
        'matricula', 'marca', 'modelo', 'tipo', 'alimentacion', 'precio',
        'fechaCompra', 'fechaMatriculacion', 'kilometrosTotales', 'gastoCombustiblePorKiloetro',
        'tipoGastoVehiculo', 'capacidadTanqueCombustible',
        'proximaItv', 'foto', 'fotoHover', 'nuevo', 'idImagen', 'nombreImagen',
        'comunidadAutonomaId', 'comunidadAutonomaNombre', 'provinciaId', 'provinciaNombre',
        'municipioId', 'municipioNombre', 'carburanteId', 'carburanteNombre', 'precioCarburanteActual',
        'imagenes', 'plantillas'
      ];

      const vehiculoFiltrado = {};
      camposPermitidos.forEach(campo => {
        if (vehiculoActual.hasOwnProperty(campo)) {
          vehiculoFiltrado[campo] = vehiculoActual[campo];
        }
      });

      if (editando) {
        await actualizarVehiculo(vehiculoActual.matricula, vehiculoFiltrado);
      } else {
        await crearVehiculo(vehiculoFiltrado);
      }

      setArchivoFoto(null);
      await cargarVehiculos(true);
      obtenerPlantillas().then(setPlantillas).catch(console.error);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (matricula) => {
    setMatriculaEliminar(matricula);
    setConfirmacionAbierta(true);
  };

  const manejarEliminar = async () => {
    setEliminando(true);
    setConfirmacionAbierta(false);
    try {
      await eliminarVehiculo(matriculaEliminar);
      await cargarVehiculos(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setEliminando(false);
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
        <Toolbar style={{ flexWrap: 'wrap', gap: '8px' }}>
          <Input
            contentBefore={<Search24Regular />}
            placeholder="Buscar vehículo..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            style={{ minWidth: '200px' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter24Regular style={{ color: tokens.colorNeutralForeground3 }} />
            <Select value={filtroEstado} onChange={(e, d) => setFiltroEstado(d.value)}>
              <option value="Todos">Todos los estados</option>
              <option value={ESTADO_VEHICULO.DISPONIBLE}>Disponibles</option>
              <option value={ESTADO_VEHICULO.EN_TRAYECTO}>En trayecto</option>
              <option value={ESTADO_VEHICULO.AVERIADO}>Averiados</option>
            </Select>
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
            onClick={() => setVehiculoEnDetalle(vehiculo)}
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
                  <div className={estilos.datoEtiqueta}>Matriculación</div>
                  <div className={estilos.datoValor}>{vehiculo.fechaMatriculacion ? new Date(vehiculo.fechaMatriculacion).toLocaleDateString('es-ES') : '—'}</div>
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
                  <div className={estilos.datoEtiqueta}>Gasto combustible</div>
                  <div className={estilos.datoValor}>
                    {vehiculo.tipoGastoVehiculo === 'PORCENTAJE'
                      ? `${(vehiculo.gastoCombustiblePorKiloetro || 0)}%`
                      : `${(vehiculo.gastoCombustiblePorKiloetro || 0)} L`}
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
                    {obtenerFechaProximaItv(vehiculo)}
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
                  <Field label="Matrícula" required validationState={erroresValidacion.matricula ? 'error' : undefined} validationMessage={erroresValidacion.matricula}>
                    <Input
                      value={vehiculoActual.matricula}
                      onChange={(_, d) => { manejarCambio('matricula', d.value); setErroresValidacion(prev => ({ ...prev, matricula: undefined })); }}
                      disabled={editando}
                      placeholder="1234-ABC"
                    />
                  </Field>
                  <Field label="Marca" required validationState={erroresValidacion.marca ? 'error' : undefined} validationMessage={erroresValidacion.marca}>
                    <Input
                      value={vehiculoActual.marca}
                      onChange={(_, d) => { manejarCambio('marca', d.value); setErroresValidacion(prev => ({ ...prev, marca: undefined })); }}
                      placeholder="Toyota"
                    />
                  </Field>
                </div>
                <div className={estilos.filaFormulario}>
                  <Field label="Modelo" required validationState={erroresValidacion.modelo ? 'error' : undefined} validationMessage={erroresValidacion.modelo}>
                    <Input
                      value={vehiculoActual.modelo}
                      onChange={(_, d) => { manejarCambio('modelo', d.value); setErroresValidacion(prev => ({ ...prev, modelo: undefined })); }}
                      placeholder="Hilux"
                    />
                  </Field>
                  <Field label="Fecha de compra">
                    <Input
                      type="date"
                      value={vehiculoActual.fechaCompra ? (typeof vehiculoActual.fechaCompra === 'string' ? vehiculoActual.fechaCompra.split('T')[0] : '') : ''}
                      onChange={(_, d) => { manejarCambio('fechaCompra', d.value); setErroresValidacion(prev => ({ ...prev, fechaMatriculacion: undefined })); }}
                    />
                  </Field>
                  <Field label="Fecha de matriculación" validationState={erroresValidacion.fechaMatriculacion ? 'error' : undefined} validationMessage={erroresValidacion.fechaMatriculacion}>
                    <Input
                      type="date"
                      value={vehiculoActual.fechaMatriculacion ? (typeof vehiculoActual.fechaMatriculacion === 'string' ? vehiculoActual.fechaMatriculacion.split('T')[0] : '') : ''}
                      onChange={(_, d) => { manejarCambio('fechaMatriculacion', d.value); setErroresValidacion(prev => ({ ...prev, fechaMatriculacion: undefined })); }}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text size={200} weight="semibold">Formato de Gasto</Text>
                      <Switch 
                        checked={vehiculoActual.tipoGastoVehiculo === 'PORCENTAJE'}
                        onChange={(_, d) => manejarCambio('tipoGastoVehiculo', d.checked ? 'PORCENTAJE' : 'LITROS')}
                        label={vehiculoActual.tipoGastoVehiculo === 'PORCENTAJE' ? '% del Tanque' : 'Litros'}
                      />
                    </div>
                    <Field label={vehiculoActual.tipoGastoVehiculo === 'PORCENTAJE' ? 'Gasto de vehículo (%)' : 'Gasto de vehículo (L)'}>
                      <Input
                        type="number"
                        step="0.01"
                        value={String(vehiculoActual.gastoCombustiblePorKiloetro || 0)}
                        onChange={(_, d) => manejarCambio('gastoCombustiblePorKiloetro', Number(d.value))}
                        contentAfter={vehiculoActual.tipoGastoVehiculo === 'PORCENTAJE' ? '%' : 'L'}
                      />
                    </Field>
                    {vehiculoActual.tipoGastoVehiculo === 'PORCENTAJE' && vehiculoActual.capacidadTanqueCombustible > 0 && (
                      <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                        Equivale a {((vehiculoActual.gastoCombustiblePorKiloetro / 100) * vehiculoActual.capacidadTanqueCombustible).toFixed(2)} Litros
                      </Text>
                    )}
                  </div>
                  <Field label="Capacidad Tanque (L)">
                    <Input
                      type="number"
                      value={String(vehiculoActual.capacidadTanqueCombustible || 0)}
                      onChange={(_, d) => manejarCambio('capacidadTanqueCombustible', Number(d.value))}
                    />
                  </Field>
                </div>

                <div className={estilos.filaFormulario}>
                  <Field label="Plantillas de Revisión" hint="Asigna una o varias plantillas al vehículo">
                    <Select
                      value={(vehiculoActual.plantillas && vehiculoActual.plantillas.length > 0) ? String(vehiculoActual.plantillas[0]) : ''}
                      onChange={(_, d) => manejarCambio('plantillas', d.value ? [d.value] : [])}
                    >
                      <option value="">Sin plantilla (Manual)</option>
                      {plantillas.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre} {p.esItv ? '(ITV)' : ''}</option>
                      ))}
                    </Select>
                  </Field>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '4px' }}>
                    <Tooltip content="Añadir nueva plantilla" relationship="label">
                      <Button
                        icon={<Add24Regular />}
                        appearance="subtle"
                        onClick={() => {
                          setPlantillaEditar(null);
                          setDialogoPlantillaAbierto(true);
                        }}
                      />
                    </Tooltip>
                    <Tooltip content="Editar plantilla seleccionada" relationship="label">
                      <Button
                        icon={<Edit24Regular />}
                        appearance="subtle"
                        disabled={!vehiculoActual.plantillas?.length}
                        onClick={() => {
                          const plantillaId = vehiculoActual.plantillas?.[0];
                          const p = plantillas.find(x => String(x.id) === String(plantillaId));
                          if (p) {
                            setPlantillaEditar(p);
                            setDialogoPlantillaAbierto(true);
                          }
                        }}
                      />
                    </Tooltip>
                    <Tooltip content="Eliminar plantilla seleccionada" relationship="label">
                      <Button
                        icon={<Delete24Regular />}
                        appearance="subtle"
                        disabled={!vehiculoActual.plantillas?.length}
                        style={{ color: vehiculoActual.plantillas?.length ? tokens.colorPaletteRedForeground1 : 'inherit' }}
                        onClick={() => setConfirmacionPlantillaAbierta(true)}
                      />
                    </Tooltip>
                  </div>
                </div>
                {!editando && (
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
                )}
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

      {/* Diálogo Detalles */}
      {vehiculoEnDetalle && (
        <ModalDetallesVehiculo
          vehiculo={vehiculoEnDetalle}
          onCerrar={() => setVehiculoEnDetalle(null)}
          onVehiculoActualizado={() => cargarVehiculos(true)}
        />
      )}
      <DialogoConfirmacion
        abierto={confirmacionPlantillaAbierta}
        titulo="Eliminar plantilla"
        mensaje="¿Estás seguro de que deseas eliminar esta plantilla de mantenimiento? Los vehículos asociados perderán su configuración automática."
        onConfirmar={async () => {
          try {
            const plantillaId = vehiculoActual.plantillas?.[0];
            await eliminarPlantilla(plantillaId);
            setConfirmacionPlantillaAbierta(false);
            manejarCambio('plantillas', (vehiculoActual.plantillas || []).filter(id => String(id) !== String(plantillaId)));
            // Recargar plantillas
            const nuevas = await obtenerPlantillas();
            setPlantillas(Array.isArray(nuevas) ? nuevas : []);
          } catch (err) {
            setError('Error al eliminar plantilla: ' + err.message);
          }
        }}
        onCancelar={() => setConfirmacionPlantillaAbierta(false)}
      />

      <ModalGestionPlantilla
        abierto={dialogoPlantillaAbierto}
        alCerrar={() => setDialogoPlantillaAbierto(false)}
        plantillaEditar={plantillaEditar}
        alGuardar={async (datos) => {
          try {
            if (plantillaEditar) {
              await actualizarPlantilla(plantillaEditar.id, datos);
            } else {
              const nueva = await crearPlantilla(datos);
              manejarCambio('plantillas', [nueva.id]);
            }
            const nuevas = await obtenerPlantillas();
            setPlantillas(Array.isArray(nuevas) ? nuevas : []);
          } catch (err) {
            setError('Error al guardar plantilla: ' + err.message);
          }
        }}
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
            label={eliminando ? "Eliminando vehículo..." : (editando ? "Modificando vehículo..." : "Creando vehículo...")} 
          />
        </div>
      )}
    </div>
  );
};

export default PaginaVehiculos;
