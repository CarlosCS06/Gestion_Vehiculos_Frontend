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
  if (valor === 'pendiente') {
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
  conductor: '',
  matricula: '',
  fecha: '',
  origen: '',
  destino: '',
  gastoGasolina: 0,
  visible: true,
  estado: ESTADO_VIAJE.PENDIENTE,
  trayectos: [],
});


