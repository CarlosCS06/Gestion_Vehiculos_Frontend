// Servicio mock de Autenticación
// Simula login, registro y gestión de roles sin backend

import { ROL_USUARIO } from '../models/Usuario.js';
import { obtenerConductorPorDni } from './servicioConductores.js';

const USUARIOS_INICIALES = [
  {
    dni: '00000000Z',
    nombre: 'Administrador',
    apellido: 'Sistema',
    telefono: '600000000',
    direccion: 'Oficina Central',
    contrasena: 'admin123',
    email: 'admin@empresa.com',
    rol: ROL_USUARIO.ADMIN,
  },
  {
    dni: '12345678A',
    nombre: 'Carlos',
    apellido: 'García López',
    telefono: '612345678',
    direccion: 'Calle Mayor 10, Madrid',
    contrasena: 'carlos123',
    email: 'carlos@empresa.com',
    rol: ROL_USUARIO.CONDUCTOR,
  },
  {
    dni: '87654321B',
    nombre: 'María',
    apellido: 'Fernández Ruiz',
    telefono: '698765432',
    direccion: 'Avenida del Sol 5, Barcelona',
    contrasena: 'maria123',
    email: 'maria@empresa.com',
    rol: ROL_USUARIO.CONDUCTOR,
  },
  {
    dni: '11223344C',
    nombre: 'Pedro',
    apellido: 'Martínez Sánchez',
    telefono: '655112233',
    direccion: 'Plaza España 3, Valencia',
    contrasena: 'pedro123',
    email: 'pedro@empresa.com',
    rol: ROL_USUARIO.CONDUCTOR,
  },
];

// Cargar usuarios de localStorage o usar iniciales
const cargarUsuarios = () => {
  const guardados = localStorage.getItem('usuarios_mock');
  return guardados ? JSON.parse(guardados) : USUARIOS_INICIALES;
};

let usuarios = cargarUsuarios();

const guardarUsuarios = () => {
  localStorage.setItem('usuarios_mock', JSON.stringify(usuarios));
};

const simularRetardo = () => new Promise((res) => setTimeout(res, 300));

/**
 * Iniciar sesión con DNI y contraseña
 */
export const iniciarSesion = async (dni, contrasena) => {
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
};

/**
 * Pre-registrar un usuario (creado por admin)
 */
export const preRegistrarUsuario = async (conductor) => {
  await simularRetardo();
  // Evitar duplicados
  if (usuarios.find((u) => u.dni === conductor.dni)) {
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
