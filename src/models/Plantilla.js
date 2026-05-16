export const PLANTILLA_TRIGGER = {
  ANYO: 'ANYO',
  KM: 'KM',
};

export const PLANTILLA_FRECUENCIA = {
  MESES: 'MESES',
  KM: 'KM',
};

export const crearPlantillaVacia = () => ({
  nombre: '',
  esItv: false,
  trigger: PLANTILLA_TRIGGER.ANYO,
  frecuencia: PLANTILLA_FRECUENCIA.MESES,
  margenDias: 0,
  vehiculos: [],
  rangos: [
    {
      desdeAnyo: 0,
      desdeKilometro: 0,
      frecuenciaMeses: 12,
      frecuenciaKilometros: 15000,
    }
  ],
});
