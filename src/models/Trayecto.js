// Modelo de Trayecto

/**
 * Crea un trayecto vacío con valores por defecto
 */
export const crearTrayectoVacio = () => ({
  horaSalida: '',
  horaLlegada: '',
  origen: '',
  destino: '',
  kmRecorridos: 0,
  gastoGasolina: 0,
  conductor: '',
  activo: false,
  completado: false,
  programado: false,
});
