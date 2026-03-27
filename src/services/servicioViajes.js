import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/viajes';

export const obtenerViajes = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const obtenerViajePorId = async (id) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const crearViaje = async (viaje) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(viaje),
  });
  return response.json();
};

export const actualizarViaje = async (id, datosActualizados) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datosActualizados),
  });
  return response.json();
};

export const eliminarViaje = async (id) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

/*
let viajes = [
  {
    id: 'V001',
    nombre: 'Ruta sur peninsular',
    conductor: '12345678A',
    fecha: '2026-03-10',
    estado: 'completado',
    trayectos: [
      {
        origen: 'Madrid',
        destino: 'Toledo',
        kmRecorridos: 75,
        gastoGasolina: 9.0,
        horaSalida: '2026-03-10T07:00',
        horaLlegada: '2026-03-10T08:00',
      },
      {
        origen: 'Toledo',
        destino: 'Córdoba',
        kmRecorridos: 300,
        gastoGasolina: 36.0,
        horaSalida: '2026-03-10T08:30',
        horaLlegada: '2026-03-10T11:30',
      },
      {
        origen: 'Córdoba',
        destino: 'Sevilla',
        kmRecorridos: 140,
        gastoGasolina: 16.8,
        horaSalida: '2026-03-10T12:00',
        horaLlegada: '2026-03-10T13:30',
      },
    ],
  },
  {
    id: 'V002',
    nombre: 'Reparto costa este',
    conductor: '87654321B',
    fecha: '2026-03-15',
    estado: 'en_curso',
    trayectos: [
      {
        origen: 'Barcelona',
        destino: 'Tarragona',
        kmRecorridos: 100,
        gastoGasolina: 12.0,
        horaSalida: '2026-03-15T06:00',
        horaLlegada: '2026-03-15T07:00',
      },
      {
        origen: 'Tarragona',
        destino: 'Valencia',
        kmRecorridos: 250,
        gastoGasolina: 30.0,
        horaSalida: '2026-03-15T07:30',
        horaLlegada: '',
      },
    ],
  },
  {
    id: 'V003',
    nombre: 'Transporte norte',
    conductor: '11223344C',
    fecha: '2026-03-20',
    estado: 'pendiente',
    trayectos: [
      {
        origen: 'Bilbao',
        destino: 'Santander',
        kmRecorridos: 0,
        gastoGasolina: 0,
        horaSalida: '2026-03-20T08:00',
        horaLlegada: '',
      },
      {
        origen: 'Santander',
        destino: 'Gijón',
        kmRecorridos: 0,
        gastoGasolina: 0,
        horaSalida: '2026-03-20T11:00',
        horaLlegada: '',
      },
    ],
  },
];

let contadorId = 4;

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerViajes = async () => {
  await simularRetardo();
  return viajes.map((v) => ({ ...v, trayectos: v.trayectos.map((t) => ({ ...t })) }));
};

export const obtenerViajePorId = async (id) => {
  await simularRetardo();
  const viaje = viajes.find((v) => v.id === id);
  return viaje ? { ...viaje, trayectos: viaje.trayectos.map((t) => ({ ...t })) } : null;
};

export const crearViaje = async (viaje) => {
  await simularRetardo();
  const nuevo = {
    ...viaje,
    id: `V${String(contadorId++).padStart(3, '0')}`,
    trayectos: viaje.trayectos.map((t) => ({ ...t })),
  };
  viajes.push(nuevo);
  return { ...nuevo, trayectos: nuevo.trayectos.map((t) => ({ ...t })) };
};

export const actualizarViaje = async (id, datosActualizados) => {
  await simularRetardo();
  const indice = viajes.findIndex((v) => v.id === id);
  if (indice === -1) throw new Error('Viaje no encontrado');
  viajes[indice] = {
    ...viajes[indice],
    ...datosActualizados,
    trayectos: datosActualizados.trayectos.map((t) => ({ ...t })),
  };
  return { ...viajes[indice], trayectos: viajes[indice].trayectos.map((t) => ({ ...t })) };
};

export const eliminarViaje = async (id) => {
  await simularRetardo();
  viajes = viajes.filter((v) => v.id !== id);
  return true;
};
*/
