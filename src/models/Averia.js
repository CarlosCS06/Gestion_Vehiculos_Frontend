// Modelo de Avería

/**
 * Crea una avería vacía con valores por defecto
 */
export const crearAveriaVacia = () => ({
  descripcion: '',
  fechaAveria: '',
  fechaComienzoReparacion: '',
  fechaFinReparacion: '',
  lugarReparacion: '',
  costeReparacion: 0,
  userDni: '',
  vehiculoMatricula: '',
  resuelta: false,
});
