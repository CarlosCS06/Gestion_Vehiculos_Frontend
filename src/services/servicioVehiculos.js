// Servicio mock de Vehículos
// Reemplazar la implementación interna por llamadas fetch cuando el backend esté listo

import { ESTADO_VEHICULO, TIPO_ALIMENTACION, TIPO_VEHICULO } from '../models/Vehiculo.js';

let vehiculos = [
  {
    matricula: '1234-ABC',
    marca: 'Toyota',
    modelo: 'Hilux',
    fechaCompra: '2022-03-15',
    aniosAntiguedad: 4,
    precioCompra: 32000,
    tipo: TIPO_VEHICULO.FURGONETA,
    foto: '',
    kmTotales: 45200,
    trayectos: ['T001', 'T002'],
    revisiones: ['R001'],
    averias: [],
    alimentacion: TIPO_ALIMENTACION.DIESEL,
    nuevo: false,
    gastoPorKm: 0.12,
    estado: ESTADO_VEHICULO.DISPONIBLE,
  },
  {
    matricula: '5678-DEF',
    marca: 'Ford',
    modelo: 'Transit',
    fechaCompra: '2023-07-20',
    aniosAntiguedad: 3,
    precioCompra: 28000,
    tipo: TIPO_VEHICULO.FURGONETA,
    foto: '',
    kmTotales: 32100,
    trayectos: ['T003'],
    revisiones: ['R002'],
    averias: ['A001'],
    alimentacion: TIPO_ALIMENTACION.DIESEL,
    nuevo: false,
    gastoPorKm: 0.14,
    estado: ESTADO_VEHICULO.AVERIADO,
  },
  {
    matricula: '9012-GHI',
    marca: 'Renault',
    modelo: 'Kangoo E-Tech',
    fechaCompra: '2025-01-10',
    aniosAntiguedad: 1,
    precioCompra: 35000,
    tipo: TIPO_VEHICULO.FURGONETA,
    foto: '',
    kmTotales: 8500,
    trayectos: ['T004'],
    revisiones: [],
    averias: [],
    alimentacion: TIPO_ALIMENTACION.ELECTRICO,
    nuevo: true,
    gastoPorKm: 0.05,
    estado: ESTADO_VEHICULO.EN_TRAYECTO,
  },
  {
    matricula: '3456-JKL',
    marca: 'Volkswagen',
    modelo: 'Caddy',
    fechaCompra: '2021-11-05',
    aniosAntiguedad: 5,
    precioCompra: 25000,
    tipo: TIPO_VEHICULO.FURGONETA,
    foto: '',
    kmTotales: 67800,
    trayectos: [],
    revisiones: ['R003'],
    averias: [],
    alimentacion: TIPO_ALIMENTACION.GASOLINA,
    nuevo: false,
    gastoPorKm: 0.15,
    estado: ESTADO_VEHICULO.DISPONIBLE,
  },
  {
    matricula: '7890-MNO',
    marca: 'Mercedes',
    modelo: 'Sprinter',
    fechaCompra: '2024-06-01',
    aniosAntiguedad: 2,
    precioCompra: 42000,
    tipo: TIPO_VEHICULO.CAMION,
    foto: '',
    kmTotales: 21300,
    trayectos: ['T005'],
    revisiones: [],
    averias: ['A002'],
    alimentacion: TIPO_ALIMENTACION.DIESEL,
    nuevo: false,
    gastoPorKm: 0.18,
    estado: ESTADO_VEHICULO.AVERIADO,
  },
];

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerVehiculos = async () => {
  await simularRetardo();
  return [...vehiculos];
};

export const obtenerVehiculoPorMatricula = async (matricula) => {
  await simularRetardo();
  return vehiculos.find((v) => v.matricula === matricula) || null;
};

export const crearVehiculo = async (vehiculo) => {
  await simularRetardo();
  vehiculos.push({ ...vehiculo });
  return { ...vehiculo };
};

export const actualizarVehiculo = async (matricula, datosActualizados) => {
  await simularRetardo();
  const indice = vehiculos.findIndex((v) => v.matricula === matricula);
  if (indice === -1) throw new Error('Vehículo no encontrado');
  vehiculos[indice] = { ...vehiculos[indice], ...datosActualizados };
  return { ...vehiculos[indice] };
};

export const eliminarVehiculo = async (matricula) => {
  await simularRetardo();
  vehiculos = vehiculos.filter((v) => v.matricula !== matricula);
  return true;
};

export const obtenerVehiculosAveriados = async () => {
  await simularRetardo();
  return vehiculos.filter((v) => v.estado === ESTADO_VEHICULO.AVERIADO);
};
