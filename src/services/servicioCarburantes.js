const API_CARBURANTES = 'https://gestion-vehiculos-backend.vercel.app/api';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

const obtenerJsonCarburantes = async (endpoint) => {
  const urlCompleta = `${API_CARBURANTES}/${endpoint}`;
  // Usamos un proxy público para saltarnos la restricción de CORS al estar desplegado
  const response = await fetchWithLogging(`${API_CARBURANTES}/${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });


  if (!response.ok) {
    throw new Error('Error al consultar la API de carburantes');
  }

  return response.json();
};

export const obtenerComunidadesAutonomas = async () => {
  return obtenerJsonCarburantes('ccaa');
};

export const obtenerProvinciasPorComunidad = async (idComunidad) => {
  return obtenerJsonCarburantes(`provincias/filtro_ccaa/${idComunidad}`);
};

export const obtenerMunicipiosPorProvincia = async (idProvincia) => {
  return obtenerJsonCarburantes(`municipios/filtro_provincia/${idProvincia}`);
};

export const obtenerProductosPetroliferos = async () => {
  return obtenerJsonCarburantes('carburantes');
};

/**
 * Obtiene las estaciones procesadas (precios medios, más barata, etc.) desde el backend
 * @param {Object} filtros - Estructura PLANTILLA_ESTACION
 */
export const obtenerEstacionesPorFiltros = async (filtros) => {
  const { idComunidad, idProvincia, idMunicipio, idProducto, matriculaVehiculo } = filtros;

  // URL de vuestro backend
  const API_BACKEND = (import.meta.env.VITE_API_URL || 'https://gestion-vehiculos-backend.vercel.app/api') + '/estaciones';

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
