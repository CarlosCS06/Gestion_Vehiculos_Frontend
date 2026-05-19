const API_CARBURANTES = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes';

const obtenerJsonCarburantes = async (endpoint) => {
  const response = await fetch(`${API_CARBURANTES}/${endpoint}`);

  if (!response.ok) {
    throw new Error('Error al consultar la API de carburantes');
  }

  return response.json();
};

export const obtenerComunidadesAutonomas = async () => {
  return obtenerJsonCarburantes('Listados/ComunidadesAutonomas/');
};

export const obtenerProvinciasPorComunidad = async (idComunidad) => {
  return obtenerJsonCarburantes(`Listados/ProvinciasPorComunidad/${idComunidad}`);
};

export const obtenerMunicipiosPorProvincia = async (idProvincia) => {
  return obtenerJsonCarburantes(`Listados/MunicipiosPorProvincia/${idProvincia}`);
};

export const obtenerProductosPetroliferos = async () => {
  return obtenerJsonCarburantes('Listados/ProductosPetroliferos/');
};

/**
 * Obtiene las estaciones procesadas (precios medios, más barata, etc.) desde el backend
 * @param {Object} filtros - Estructura PLANTILLA_ESTACION
 */
export const obtenerEstacionesPorFiltros = async (filtros) => {
  const { idComunidad, idProvincia, idMunicipio, idProducto, matriculaVehiculo } = filtros;

  // URL de vuestro backend
  const API_BACKEND = (import.meta.env.VITE_API_URL || 'https://gestion-vehiculos-backend.onrender.com/vehiculos/api') + '/estaciones';

  const payload = {
    matriculaVehiculo: matriculaVehiculo || null,
    IDCCAA: idComunidad || null,
    idProvincia: idProvincia || null,
    idMunicipio: idMunicipio || null,
    idProducto: String(idProducto), // El backend lo espera como string obligatorio
  };

  const token = sessionStorage.getItem('token');

  const response = await fetch(API_BACKEND, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Error al obtener datos de carburantes del backend');
  }

  // Devuelve la estructura ESTACIONES_PROCESADAS
  return response.json();
};

/**
 * Función de utilidad para extraer el precio medio según el nivel de detalle disponible
 */
export const obtenerPrecioMedio = (datosProcesados) => {
  if (!datosProcesados) return null;

  // Prioridad: Municipio > Provincia > CCAA
  return datosProcesados.precioMedioMunicipio ||
    datosProcesados.precioMedioProvincia ||
    datosProcesados.precioMedioCCAA ||
    null;
};

/**
 * Genera una URL de Google Maps para una gasolinera con coordenadas
 * @param {string|number} latitud - Latitud de la gasolinera
 * @param {string|number} longitud - Longitud de la gasolinera
 * @param {string} nombre - Nombre o dirección de la gasolinera (opcional)
 * @returns {string} URL de Google Maps
 */
export const generarUrlGoogleMaps = (latitud, longitud, nombre = '') => {
  if (!latitud || !longitud) {
    if (nombre) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nombre)}`;
    }
    return null;
  }

  const lat = parseFloat(String(latitud).replace(',', '.'));
  const lng = parseFloat(String(longitud).replace(',', '.'));

  if (isNaN(lat) || isNaN(lng)) return null;

  const query = nombre ? `${nombre} ${lat},${lng}` : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};
