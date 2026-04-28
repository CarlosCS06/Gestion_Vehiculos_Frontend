// Modelo de Conductor

/**
 * Crea un conductor vacío con valores por defecto
 */
export const crearConductorVacio = () => ({
  dni: '',
  image: { url: '', name: '' },
  nombre: '',
  apellidos: '',
  telefono: '',
  direccion: '',
  fechaNacimiento: '',
  vehiculo: [],
  trayectos: [],
});
