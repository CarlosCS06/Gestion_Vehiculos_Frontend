// Servicio mock de Autenticación
// Simula login, registro y gestión de roles sin backend

import { ROL_USUARIO } from '../models/Usuario.js';
import { obtenerConductorPorDni } from './servicioConductores.js';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/auth';

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

// Cargar usuarios de localStorage o usar iniciales
/*const cargarUsuarios = () => {
  const guardados = localStorage.getItem('usuarios_mock');
  return guardados ? JSON.parse(guardados) : USUARIOS_INICIALES;
};*/

//let usuarios = cargarUsuarios();

/*const guardarUsuarios = () => {
  localStorage.setItem('usuarios_mock', JSON.stringify(usuarios));
};*/

const simularRetardo = () => new Promise((res) => setTimeout(res, 300));

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

  /* CÓDIGO MOCK ANTERIOR
  await simularRetardo();
  const usuario = usuarios.find((u) => u.dni === dni);

  if (!usuario) {
    throw new Error('DNI no encontrado');
  }

  if (usuario.contrasena === '') {
    throw new Error('NUEVO_USUARIO_SIN_PASSWORD');
  }

  if (usuario.contrasena !== contrasena) {
    throw new Error('Contraseña incorrecta');
  }
  // Devuelve usuario sin contraseña
  const { contrasena: _, ...usuarioSeguro } = usuario;
  return usuarioSeguro;
  */
};


/**
 * Registrar un conductor: el admin previamente ha dado de alta su DNI
 * en el servicio de conductores. El conductor pone su DNI, si existe,
 * se le muestra su nombre y puede crear contraseña + email.
 */
export const verificarDniConductor = async (dni) => {
  await simularRetardo();
  const usuarioExistente = usuarios.find((u) => u.dni === dni);
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
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }

  /* CÓDIGO MOCK ANTERIOR
  await simularRetardo();
  const conductor = await obtenerConductorPorDni(dni);
  if (!conductor) {
    throw new Error('Conductor no encontrado');
  }
  const usuarioExistente = usuarios.find((u) => u.dni === dni);

  const datosUsuario = {
    dni: conductor.dni,
    nombre: conductor.nombre,
    apellido: conductor.apellidos,
    telefono: conductor.telefono,
    direccion: conductor.direccion,
    contrasena,
    email,
    rol: ROL_USUARIO.CONDUCTOR,
  };

  if (usuarioExistente) {
    // Actualizar usuario pre-registrado
    Object.assign(usuarioExistente, datosUsuario);
    guardarUsuarios();
    const { contrasena: _, ...usuarioSeguro } = usuarioExistente;
    return usuarioSeguro;
  } else {
    // Caso de registro directo (si no fue pre-registrado por error)
    usuarios.push(datosUsuario);
    guardarUsuarios();
    const { contrasena: _, ...usuarioSeguro } = datosUsuario;
    return usuarioSeguro;
  }
  */
};


/**
 * Pre-registrar un usuario (creado por admin)
 */
export const preRegistrarUsuario = async (conductor) => {
  await simularRetardo();
  // Evitar duplicados
  if (usuarios.find((u) => u.dni === conductor.dni)) { // usar endpoint obtener usuario por dni y usar el dni del conductor
    return;
  }

  usuarios.push({
    dni: conductor.dni,
    nombre: conductor.nombre,
    apellido: conductor.apellidos,
    telefono: conductor.telefono,
    direccion: conductor.direccion,
    contrasena: '', // Sin contraseña inicialmente
    email: '',
    rol: ROL_USUARIO.CONDUCTOR,
  });
  guardarUsuarios();
};

/**
 * Obtener todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async () => {
  await simularRetardo();
  return usuarios.map(({ contrasena, ...u }) => u);
};
