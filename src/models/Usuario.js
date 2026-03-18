// Modelo de Usuario

export const ROL_USUARIO = {
  ADMIN: 'admin',
  CONDUCTOR: 'conductor',
};

/**
 * Crea un usuario vacío con valores por defecto
 */
export const crearUsuarioVacio = () => ({
  dni: '',
  nombre: '',
  apellido: '',
  telefono: '',
  direccion: '',
  contrasena: '',
  email: '',
  rol: ROL_USUARIO.CONDUCTOR,
});
