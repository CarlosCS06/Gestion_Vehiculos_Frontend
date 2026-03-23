// Servicio mock de Vehículos
// Reemplazar la implementación interna por llamadas fetch cuando el backend esté listo

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/vehiculos';

export const obtenerVehiculos = async () => {
  const response = await fetch(AUTH_API_URL);
  if (!response.ok) {
    throw new Error('Error al obtener los vehículos');
  }
  return response.json();
};

export const obtenerVehiculoPorMatricula = async (matricula) => {
  const response = await fetch(`${AUTH_API_URL}/${matricula}`);
  if (!response.ok) {
    throw new Error('Error al obtener el vehículo');
  }
  return response.json();
};

export const crearVehiculo = async (vehiculo) => {
  const response = await fetch(AUTH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(vehiculo),
  });
  if (!response.ok) {
    throw new Error('Error al crear el vehículo');
  }
  return response.json();
};

export const actualizarVehiculo = async (matricula, datosActualizados) => {
  const response = await fetch(`${AUTH_API_URL}/${matricula}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el vehículo');
  }
  return response.json();
};

export const eliminarVehiculo = async (matricula) => {
  const response = await fetch(`${AUTH_API_URL}/${matricula}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el vehículo');
  }
  return response.json();
};

export const obtenerVehiculosAveriados = async () => {
  const response = await fetch(`${AUTH_API_URL}/avariados`);
  if (!response.ok) {
    throw new Error('Error al obtener los vehículos averiados');
  }
  return response.json();
};

/*
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
    foto: '/ToyotaHilux.jpg?v=20260323',
    kmTotales: 45200,
    trayectos: ['T001', 'T002'],
    revisiones: ['M001 (15k)', 'ITV-2024', 'M002 (30k)', 'ITV-2026', 'M003 (45k)'],
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
    foto: '/FordTransit.jpg',
    kmTotales: 32100,
    trayectos: ['T003'],
    revisiones: ['M004 (15k)', 'ITV-2025', 'M005 (30k)'],
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
    foto: '/RenaultKangoo_ETech.jpg',
    kmTotales: 8500,
    trayectos: ['T004'],
    revisiones: ['M006 (Primer año)'],
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
    foto: '/VolkswagenCaddy.jpg',
    kmTotales: 67800,
    trayectos: [],
    revisiones: ['M007 (15k)', 'ITV-2023', 'M008 (30k)', 'ITV-2025', 'M009 (45k)', 'M010 (60k)'],
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
    foto: '/MercedesSprinter.jpg',
    kmTotales: 21300,
    trayectos: ['T005'],
    revisiones: ['ITV-2025', 'M011 (20k)', 'ITV-2026'],
    averias: ['A002'],
    alimentacion: TIPO_ALIMENTACION.DIESEL,
    nuevo: false,
    gastoPorKm: 0.18,
    estado: ESTADO_VEHICULO.AVERIADO,
  },
  {
    matricula: '7364-CFG',
    marca: 'Honda',
    modelo: 'PCX Wave 110s',
    fechaCompra: '2024-06-01',
    aniosAntiguedad: 2,
    precioCompra: 42000,
    tipo: TIPO_VEHICULO.MOTOCICLETA,
    foto: '/Honda_PCX_Wave_110s.jpg',
    kmTotales: 21300,
    trayectos: ['T006'],
    revisiones: ['M012 (5k)', 'M013 (10k)', 'M014 (15k)', 'M015 (20k)'],
    averias: [],
    alimentacion: TIPO_ALIMENTACION.GASOLINA,
    nuevo: false,
    gastoPorKm: 0.08,
    estado: ESTADO_VEHICULO.DISPONIBLE,
  },
];

/**
 * Calcula la periodicidad de la ITV según el tipo y antigüedad
 */
export const obtenerPeriodicidadITV = (tipo, antiguedad) => {
  if (tipo === TIPO_VEHICULO.TURISMO || tipo === TIPO_VEHICULO.MOTOCICLETA) {
    if (antiguedad < 4) return 'Exento';
    if (antiguedad < 10) return 'Cada 2 años';
    return 'Cada año';
  }

  if (tipo === TIPO_VEHICULO.CICLOMOTOR) {
    if (antiguedad < 3) return 'Exento';
    return 'Cada 2 años';
  }

  if (tipo === TIPO_VEHICULO.FURGONETA) {
    if (antiguedad < 2) return 'Exento';
    if (antiguedad < 6) return 'Cada 2 años';
    if (antiguedad < 10) return 'Cada año';
    return 'Cada 6 meses';
  }

  if (tipo === TIPO_VEHICULO.CARAVANA) {
    if (antiguedad < 6) return 'Exento';
    return 'Cada 2 años';
  }

  // Pesados (Camión, Autobús) - Regla general similar a furgonetas maduras
  if (tipo === TIPO_VEHICULO.CAMION || tipo === TIPO_VEHICULO.AUTOBUS) {
    if (antiguedad < 10) return 'Cada año';
    return 'Cada 6 meses';
  }

  return 'No definida';
};
/*
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
*/
