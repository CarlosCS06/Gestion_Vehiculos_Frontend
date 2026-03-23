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
  fechaCompra: '',
  aniosAntiguedad: 0,
  precioCompra: 0,
  tipo: TIPO_VEHICULO.TURISMO,
  foto: '',
  kmTotales: 0,
  trayectos: [],
  revisiones: [],
  averias: [],
  alimentacion: TIPO_ALIMENTACION.GASOLINA,
  nuevo: true,
  gastoPorKm: 0,
  estado: ESTADO_VEHICULO.DISPONIBLE,
});
