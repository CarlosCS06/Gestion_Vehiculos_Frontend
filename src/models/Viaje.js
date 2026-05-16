// Modelo de Viaje

// Estados posibles del viaje
export const ESTADO_VIAJE = {
  PENDIENTE: 'PENDIENTE',
  EN_CURSO: 'ACTIVO',
  COMPLETADO: 'FINALIZADO',
};

export const normalizarEstadoViaje = (estado) => {
  if (estado === null || estado === undefined) {
    return ESTADO_VIAJE.PENDIENTE;
  }

  const valor = String(estado).trim().toLowerCase();
  if (valor === 'pendiente' || valor === 'programado') {
    return ESTADO_VIAJE.PENDIENTE;
  }
  if (valor === 'en_curso' || valor === 'en curso' || valor === 'activo') {
    return ESTADO_VIAJE.EN_CURSO;
  }
  if (valor === 'completado' || valor === 'finalizado') {
    return ESTADO_VIAJE.COMPLETADO;
  }

  if (Object.values(ESTADO_VIAJE).includes(estado)) {
    return estado;
  }

  return ESTADO_VIAJE.PENDIENTE;
};

/**
 * Calcula el estado de un viaje basándose en las horas de sus trayectos
 * y la hora actual.
 */
export const calcularEstadoViaje = (viaje) => {
  if (!viaje.trayectos || viaje.trayectos.length === 0) {
    return normalizarEstadoViaje(viaje.estado);
  }

  const ahora = new Date();
  
  // Extraer todas las horas válidas
  const horasSalida = viaje.trayectos
    .map(t => t.horaSalida ? new Date(t.horaSalida) : null)
    .filter(d => d && !isNaN(d.getTime()));
  
  const horasLlegada = viaje.trayectos
    .map(t => t.horaLlegada ? new Date(t.horaLlegada) : null)
    .filter(d => d && !isNaN(d.getTime()));

  if (horasSalida.length === 0) {
    return normalizarEstadoViaje(viaje.estado);
  }

  // El viaje empieza con el primer trayecto y termina con el último
  const primeraSalida = new Date(Math.min(...horasSalida.map(h => h.getTime())));
  
  // Si no hay horas de llegada, no podemos marcarlo como completado automáticamente por tiempo
  const ultimaLlegada = horasLlegada.length > 0 
    ? new Date(Math.max(...horasLlegada.map(h => h.getTime()))) 
    : null;

  if (ahora < primeraSalida) {
    return ESTADO_VIAJE.PENDIENTE;
  }

  if (ultimaLlegada && ahora >= ultimaLlegada) {
    return ESTADO_VIAJE.COMPLETADO;
  }

  return ESTADO_VIAJE.EN_CURSO;
};

/**
 * Crea un trayecto vacío para usar dentro de un viaje
 */
export const crearTrayectoDeViajeVacio = () => ({
  origen: '',
  destino: '',
  distanciaEnKm: 0,
  horaSalida: '',
  horaLlegada: '',
});

/**
 * Crea un viaje vacío con valores por defecto
 */

export const crearViajeVacio = () => ({
  descripcion: '',
  conductorDni: '',
  vehiculoMatricula: '',
  fechaSalida: '',
  fechaLlegada: '',
  origen: '',
  destino: '',
  kmSalida: '',
  kmLlegada: '',
  gastoGasolina: 0,
  visible: true,
  estado: ESTADO_VIAJE.PENDIENTE,
  trayectos: [],
});