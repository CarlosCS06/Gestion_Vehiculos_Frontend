// Servicio mock de Autenticación
// Simula login, registro y gestión de roles sin backend

import { ROL_USUARIO } from '../models/Usuario.js';
import { obtenerConductorPorDni } from './servicioConductores.js';

let usuarios = [
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

const simularRetardo = () => new Promise((res) => setTimeout(res, 300));

/**
 * Iniciar sesión con DNI y contraseña
 */
export const iniciarSesion = async (dni, contrasena) => {
  await simularRetardo();
  const usuario = usuarios.find(
    (u) => u.dni === dni && u.contrasena === contrasena
  );
  if (!usuario) {
    throw new Error('DNI o contraseña incorrectos');
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
  // Mirar si ya está registrado como usuario
  const yaRegistrado = usuarios.find((u) => u.dni === dni);
  if (yaRegistrado) {
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
  const nuevoUsuario = {
    dni: conductor.dni,
    nombre: conductor.nombre,
    apellido: conductor.apellidos,
    telefono: conductor.telefono,
    direccion: conductor.direccion,
    contrasena,
    email,
    rol: ROL_USUARIO.CONDUCTOR,
  };
  usuarios.push(nuevoUsuario);
  const { contrasena: _, ...usuarioSeguro } = nuevoUsuario;
  return usuarioSeguro;
};

/**
 * Obtener todos los usuarios (solo admin)
 */
export const obtenerUsuarios = async () => {
  await simularRetardo();
  return usuarios.map(({ contrasena, ...u }) => u);
};
