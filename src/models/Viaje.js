// Modelo de Viaje

// Estados posibles del viaje
export const ESTADO_VIAJE = {
  PENDIENTE: 'pendiente',
  EN_CURSO: 'en_curso',
  COMPLETADO: 'completado',
};

/**
 * Crea un trayecto vacío para usar dentro de un viaje
 */
export const crearTrayectoDeViajeVacio = () => ({
  origen: '',
  destino: '',
  kmRecorridos: 0,
  gastoGasolina: 0,
  horaSalida: '',
  horaLlegada: '',
});

/**
 * Crea un viaje vacío con valores por defecto
 */
export const crearViajeVacio = () => ({
  id: '',
  nombre: '',
  conductor: '',
  fecha: '',
  estado: ESTADO_VIAJE.PENDIENTE,
  trayectos: [crearTrayectoDeViajeVacio()],
});
