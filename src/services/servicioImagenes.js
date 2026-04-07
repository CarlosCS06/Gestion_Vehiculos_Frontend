import { fetchWithLogging } from './apiUtils';

const FILES_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/files';

/**
 * Sube una imagen local al backend para que sea procesada y subida a Cloudinary
 * @param {File} archivo - El archivo de imagen a subir
 * @returns {Promise<Object>} - La respuesta del backend con la URL de Cloudinary
 */
export const subirImagen = async (archivo) => {
  const token = sessionStorage.getItem('token');
  
  // El backend espera el binario directo en el body (usa request.arrayBuffer())
  const arrayBuffer = await archivo.arrayBuffer();

  const response = await fetchWithLogging(`${FILES_API_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': archivo.type
    },
    body: arrayBuffer,
  });

  return response.json();
};

/**
 * Obtiene el listado de imágenes subidas
 * @returns {Promise<Array>} - Array con la información de las imágenes
 */
export const obtenerImagenes = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(FILES_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
