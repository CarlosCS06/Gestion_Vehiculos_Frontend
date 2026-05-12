import { ROL_USUARIO } from '../models/Usuario.js';
import { obtenerConductorPorDni } from './servicioConductores.js';
import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/auth';
const USERS_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/users';

// Helper para mapear el usuario del backend al formato del frontend
const mapearUsuario = (data) => {
  let nombre = data.fullName || '';
  let apellido = '';

  if (data.fullName && data.fullName.includes(' ')) {
    const parts = data.fullName.split(' ');
    nombre = parts[0];
    apellido = parts.slice(1).join(' ');
  }

  const rol = data.roles && data.roles.includes('admin') ? ROL_USUARIO.ADMIN : ROL_USUARIO.CONDUCTOR;

  return {
    dni: data.dni,
    email: data.email,
    nombre,
    apellido,
    rol,
    isActive: data.isActive
  };
};

/**
 * Iniciar sesión con DNI y contraseña
 */
export const iniciarSesion = async (dni, contrasena) => {
  try {
    const response = await fetchWithLogging(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, password: contrasena }),
    });

    const data = await response.json();

    // Almacenar el token
    if (data.token) {
      sessionStorage.setItem('token', data.token);
    }

    return mapearUsuario(data);
  } catch (error) {
    // Mensaje claro cuando el usuario no existe en el sistema de auth
    if (error.status === 404) {
      throw new Error('Usuario no encontrado. Si eres conductor, debes registrarte primero.');
    }
    if (error.status === 401) {
      throw new Error('Contraseña incorrecta.');
    }
    console.error('Login error:', error);
    throw error;
  }
};


/**
 * Registrar un conductor: el admin previamente ha dado de alta su DNI
 * en el servicio de conductores. El conductor pone su DNI, si existe,
 * se le muestra su nombre y puede crear contraseña + email.
 */
export const verificarDniConductor = async (dni) => {
  const usuarioExistente = await obtenerUsuarioPorDni(dni);

  // Si el usuario existe y NO tiene un email temporal, es que ya está registrado de verdad
  if (usuarioExistente && !usuarioExistente.email.endsWith('@temporal.com')) {
    throw new Error('Este DNI ya tiene una cuenta registrada');
  }

  // Buscar en conductores dados de alta por el admin
  const conductor = await obtenerConductorPorDni(dni);
  if (!conductor) {
    throw new Error('Este DNI no ha sido dado de alta por un administrador');
  }
  return {
    dni: conductor.dni,
    nombre: conductor.nombre,
    apellidos: conductor.apellidos,
  };
};

/**
 * Función genérica para registrar un usuario
 * @param {Object} payload - Objeto con los datos del usuario (dni, email, password, fullName, telefono, etc.)
 */
export const registrarUsuario = async (payload) => {
  const response = await fetchWithLogging(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en el registro');
  }

  const data = await response.json();

  // Almacenar el token si viene en el registro
  if (data.token) {
    sessionStorage.setItem('token', data.token);
  }

  return mapearUsuario(data);
};

export const registrarConductor = async (dni, contrasena, email) => {
  try {
    const conductor = await obtenerConductorPorDni(dni);
    if (!conductor) {
      throw new Error('Conductor no encontrado. El admin debe darle de alta primero.');
    }

    const payload = {
      dni,
      email,
      telefono: conductor.telefono || '',
      password: contrasena,
      fullName: `${conductor.nombre} ${conductor.apellidos}`.trim()
    };

    // Si ya existe un usuario (pre-registrado), lo actualizamos en lugar de registrar uno nuevo
    const usuarioExistente = await obtenerUsuarioPorDni(dni);
    if (usuarioExistente) {
      return await actualizarUsuario(dni, { email, password: contrasena, fullName: payload.fullName });
    }

    // Llamamos a la función genérica de registro
    return await registrarUsuario(payload);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Obtener un usuario por su DNI (consulta al backend)
 * @param {string} dni
 * @returns {Promise<Object|null>}
 */
export const obtenerUsuarioPorDni = async (dni) => {
  try {
    const response = await fetchWithLogging(`${USERS_API_URL}/${dni}`, {
      skipLog: 404,
      skipAuth: true,
    });
    const data = await response.json();
    return mapearUsuario(data);
  } catch (error) {
    if (error.status === 404) return null;
    console.error('Error fetching user by DNI:', error);
    throw error;
  }
};


/**
 * Pre-registrar un usuario (creado por admin)
 */
export const preRegistrarUsuario = async (conductor) => {
  try {
    // Evitar duplicados
    if (await obtenerUsuarioPorDni(conductor.dni)) {
      console.log('El usuario ya está pre-registrado');
      return;
    }

    const payload = {
      dni: conductor.dni,
      email: `${conductor.dni}@temporal.com`, // Placeholder para cumplir validación backend
      password: `pass_${conductor.dni}`, // Placeholder inicial
      fullName: `${conductor.nombre} ${conductor.apellidos}`.trim(),
      telefono: conductor.telefono ? Number(String(conductor.telefono).replace(/\s+/g, '')) : 0,
      roles: ['conductor'],
      isActive: true
    };

    await registrarUsuario(payload);
  } catch (error) {
    console.error('Error in pre-registration:', error);
    // No lanzamos el error para no bloquear la creación del conductor físico
    // si el sistema de auth falla temporalmente, pero informamos en consola.
  }
};

/**
 * Obtener todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async () => {
  try {
    const response = await fetchWithLogging(USERS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener los usuarios');
    }

    const data = await response.json();

    // El backend devuelve un objeto con índices como strings ("0", "1", etc.)
    // Convertimos los valores del objeto en un array y los mapeamos
    const usuariosArray = Object.values(data);

    return usuariosArray.map(usuario => mapearUsuario(usuario));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
/**
 * Actualizar datos de un usuario (email, password, fullName)
 * @param {string} dni
 * @param {Object} datos
 */
export const actualizarUsuario = async (dni, datos) => {
  try {
    const response = await fetchWithLogging(`${USERS_API_URL}/${dni}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al actualizar el usuario');
    }

    const data = await response.json();
    return mapearUsuario(data);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};
