import { fetchWithLogging } from './apiUtils';

const FILES_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/files';

/**
 * Sube una imagen local al backend para que sea procesada y subida a Cloudinary
 * @param {File} archivo - El archivo de imagen a subir
 * @param {string} [vehiculoMatricula] - Matrícula del vehículo asociado (opcional)
 * @param {string} [conductorDni] - DNI del conductor asociado (opcional)
 * @returns {Promise<Object>} - La respuesta del backend con la URL de Cloudinary
 */
export const subirImagen = async (archivo, vehiculoMatricula = null, conductorDni = null) => {
  // El backend espera un FormData con los campos: image, vehiculoMatricula, conductorDNI
  const formData = new FormData();
  formData.append('image', archivo);
  if (vehiculoMatricula) formData.append('vehiculoMatricula', vehiculoMatricula);
  if (conductorDni) formData.append('conductorDNI', conductorDni);

  console.log('--- ENVIANDO IMAGEN (FormData) ---');
  console.log('vehiculoMatricula:', vehiculoMatricula);
  console.log('conductorDNI:', conductorDni);
  console.log('---------------------------------');

  const response = await fetchWithLogging(`${FILES_API_URL}/upload`, {
    method: 'POST',
    headers: {
      // No establecer Content-Type: el navegador genera automáticamente
      // el header multipart/form-data con el boundary correcto
    },
    body: formData,
  });

  return response.json();
};

/**
 * Obtiene el listado de imágenes subidas
 * @returns {Promise<Array>} - Array con la información de las imágenes
 */
export const obtenerImagenes = async () => {
  const response = await fetchWithLogging(FILES_API_URL, {
    headers: {}
  });

  return response.json();
};
/**
 * Guarda una imagen de internet en la base de datos.
 * El backend descarga la imagen de la URL proporcionada.
 * Endpoint: POST /api/files
 * @param {Object} datosImagen - Objeto con {url, nombre, vehiculoMatricula?, conductorDni?}
 * @returns {Promise<Object>} - La entidad imagen creada (con id, url, nombre, etc.)
 */
export const subirImagenPorUrl = async (datosImagen) => {
  const response = await fetchWithLogging(FILES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosImagen),
  });

  console.log('--- ENVIANDO IMAGEN POR URL ---');
  console.log('Datos:', datosImagen);
  console.log('-------------------------------');

  return response.json();
};
