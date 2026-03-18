// Modelo de Trayecto

/**
 * Crea un trayecto vacío con valores por defecto
 */
export const crearTrayectoVacio = () => ({
  id: '',
  horaSalida: '',
  horaLlegada: '',
  origen: '',
  destino: '',
  kmRecorridos: 0,
  activo: false,
  completado: false,
  programado: false,
  gastoGasolina: 0,
  conductor: '',
});
