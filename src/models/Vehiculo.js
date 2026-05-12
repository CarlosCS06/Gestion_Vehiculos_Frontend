// Modelo de Vehículo
// Estados posibles del vehículo
export const ESTADO_VEHICULO = {
  DISPONIBLE: 'disponible',
  EN_TRAYECTO: 'en_trayecto',
  AVERIADO: 'averiado',
};

// Tipos de alimentación
export const TIPO_ALIMENTACION = {
  GASOLINA: 'Gasolina',
  DIESEL: 'Diésel',
  ELECTRICO: 'Eléctrico',
  HIBRIDO: 'Híbrido',
  GAS: 'Gas',
};

// Tipos de vehículo
export const TIPO_VEHICULO = {
  TURISMO: 'Turismo',
  FURGONETA: 'Furgoneta',
  CAMION: 'Camión',
  MOTOCICLETA: 'Motocicleta',
  AUTOBUS: 'Autobús',
  CICLOMOTOR: 'Ciclomotor',
  CARAVANA: 'Caravana',
};

/**
 * Crea un vehículo vacío con valores por defecto
 */
export const crearVehiculoVacio = () => ({
  matricula: '',
  marca: '',
  modelo: '',
  tipo: TIPO_VEHICULO.COCHE,
  alimentacion: TIPO_ALIMENTACION.GASOLINA,
  precio: 0,
  fechaCompra: '',
  kilometrosTotales: 0,
  gastoPorKm: 0,
  anyosAntiguedad: 0,
  proximaItv: '',
  foto: '',
  fotoHover: '',
  nuevo: true,

  comunidadAutonomaId: '',
  comunidadAutonomaNombre: '',
  provinciaId: '',
  provinciaNombre: '',
  municipioId: '',
  municipioNombre: '',
  carburanteId: '',
  carburanteNombre: '',
  precioCarburanteActual: 0,
});