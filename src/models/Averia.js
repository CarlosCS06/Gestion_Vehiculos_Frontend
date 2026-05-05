// Modelo de Avería

/**
 * Crea una avería vacía con valores por defecto
 */
export const crearAveriaVacia = () => ({
  id: '',
  descripcion: '',
  vehiculosAveriados: [],
  fechaAveria: '',
  fechaComienzoReparacion: '',
  fechaFinReparacion: '',
  lugarReparacion: '',
  costeReparacion: '',
  conductorDNI: '',
  enReparacion: false,
});
