// Modelo de Revisión

/**
 * Crea una revisión vacía con valores por defecto
 */
export const crearRevisionVacia = () => ({
  id: '',
  vehiculoMatricula: '',
  fecha: '',
  lugar: '',
  activo: false,
  aprobada: false,
  costo: 0,
  viajeId: null,
});
