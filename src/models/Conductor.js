// Modelo de Conductor

/**
 * Crea un conductor vacío con valores por defecto
 */
export const crearConductorVacio = () => ({
  dni: '',
  image: null,
  nombre: '',
  apellidos: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  vehiculo: [],
  trayectos: [],
});
