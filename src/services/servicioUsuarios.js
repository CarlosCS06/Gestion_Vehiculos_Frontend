import { fetchWithLogging } from './apiUtils.js';

const USERS_API_URL = (import.meta.env.VITE_API_URL || 'https://gestion-vehiculos-backend.vercel.app/api') + '/users';
const REGISTER_API_URL = (import.meta.env.VITE_API_URL || 'https://gestion-vehiculos-backend.vercel.app/api') + '/auth/register';

/**
 * Obtiene la lista completa de usuarios del sistema
 * Convierte el diccionario/objeto indexado por el backend en un array plano
 * @returns {Promise<Array>}
 */
export const obtenerTodosLosUsuarios = async () => {
  try {
    const response = await fetchWithLogging(USERS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    // El backend puede devolver una lista indexada tipo {"0": {...}, "1": {...}}
    // o un array. Lo convertimos de forma segura a array.
    const usuarios = Array.isArray(data) ? data : Object.values(data);
    return usuarios;
  } catch (error) {
    console.error('Error al obtener los usuarios del backend:', error);
    throw error;
  }
};

/**
 * Crea un nuevo usuario en el sistema
 * @param {Object} datos - Contiene dni, email, password, fullName, telefono, isActive, roles
 * @returns {Promise<Object>}
 */
export const crearUsuario = async (datos) => {
  try {
    const payload = {
      dni: datos.dni || null,
      email: datos.email || null,
      password: datos.password || null,
      fullName: datos.fullName || null,
      telefono: datos.telefono || null,
      isActive: datos.isActive !== undefined ? datos.isActive : true,
      roles: datos.roles || ['user']
    };

    const response = await fetchWithLogging(REGISTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

/**
 * Modifica los datos de un usuario por su DNI
 * @param {string} dni
 * @param {Object} datos - Contiene email, password (opcional), fullName, telefono, isActive, roles
 * @returns {Promise<Object>}
 */
export const actualizarUsuario = async (dni, datos) => {
  try {
    const payload = {
      email: datos.email || null,
      fullName: datos.fullName || null,
      telefono: datos.telefono || null,
      isActive: datos.isActive !== undefined ? datos.isActive : true,
      roles: datos.roles || ['user']
    };

    // Si se especifica una contraseña no vacía, se actualiza. De lo contrario, se omite
    if (datos.password && datos.password.trim() !== '') {
      payload.password = datos.password;
    }

    const response = await fetchWithLogging(`${USERS_API_URL}/${dni}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    console.error(`Error al actualizar el usuario con DNI ${dni}:`, error);
    throw error;
  }
};

/**
 * Elimina un usuario del sistema por su DNI
 * @param {string} dni
 * @returns {Promise<Object>}
 */
export const eliminarUsuario = async (dni) => {
  try {
    const response = await fetchWithLogging(`${USERS_API_URL}/${dni}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return await response.json();
  } catch (error) {
    console.error(`Error al eliminar el usuario con DNI ${dni}:`, error);
    throw error;
  }
};
