// Servicio mock de Autenticación
// Simula login, registro y gestión de roles sin backend

import { ROL_USUARIO } from '../models/Usuario.js';
import { obtenerConductorPorDni } from './servicioConductores.js';

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
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, password: contrasena }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error en el inicio de sesión');
    }

    const data = await response.json();

    // Almacenar el token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return mapearUsuario(data);
  } catch (error) {
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
  if (usuarioExistente && usuarioExistente.contrasena !== '') {
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
  const response = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error en el registro');
  }

  const data = await response.json();

  // Almacenar el token si viene en el registro
  if (data.token) {
    localStorage.setItem('token', data.token);
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
    const response = await fetch(`${USERS_API_URL}/${dni}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al obtener el usuario');
    }
    const data = await response.json();
    return mapearUsuario(data);
  } catch (error) {
    console.error('Error fetching user by DNI:', error);
    throw error;
  }
};


/**
 * Pre-registrar un usuario (creado por admin)
 */
export const preRegistrarUsuario = async (conductor) => {
  // Evitar duplicados
  if (await obtenerUsuarioPorDni(conductor.dni)) {
    return;
  }

  const payload = {
    dni: conductor.dni,
    nombre: conductor.nombre,
    apellido: conductor.apellidos,
    telefono: conductor.telefono,
    direccion: conductor.direccion,
    contrasena: '', // Sin contraseña inicialmente
    email: '',
    rol: ROL_USUARIO.CONDUCTOR,
  };

  registrarUsuario(payload);
};

/**
 * Obtener todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No se encontró el token de autenticación');
    }

    const response = await fetch(USERS_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
