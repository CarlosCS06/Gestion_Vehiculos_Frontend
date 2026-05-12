import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/averias';

export const obtenerAverias = async () => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return Array.isArray(data) ? data : (data && typeof data === 'object' ? Object.values(data) : []);
};

export const obtenerAveriaPorId = async (id) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

export const crearAveria = async (averia) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(averia),
  });
  return response.json();
};

export const actualizarAveria = async (id, datosActualizados) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datosActualizados),
  });
  return response.json();
};

export const eliminarAveria = async (id) => {
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
let averias = [
  {
    id: 'A001',
    descripcion: 'Fallo en el sistema de frenos',
    vehiculosAveriados: ['5678-DEF'],
    fechaAveria: '2026-02-19',
    fechaComienzoReparacion: '2026-02-20',
    fechaFinReparacion: '2026-02-20',
    lugarReparacion: 'Taller Hermanos Ruiz, Sevilla',
    enReparacion: false,
    costeReparacion: '1000',
  },
  {
    id: 'A002',
    descripcion: 'Motor recalentado, necesita revisión completa',
    vehiculosAveriados: ['7890-MNO'],
    fechaAveria: '2026-02-18',
    fechaComienzoReparacion: '2026-02-20',
    fechaFinReparacion: '',
    lugarReparacion: 'Taller de Pedro, Madrid',
    enReparacion: true,
    costeReparacion: '2000',
  },
  {
    id: 'A003',
    descripcion: 'Parabrisas agrietado',
    vehiculosAveriados: ['1234-ABC'],
    fechaAveria: '2026-02-20',
    fechaComienzoReparacion: '',
    fechaFinReparacion: '',
    lugarReparacion: '',
    enReparacion: false,
    costeReparacion: '',
  },
];

let contadorId = 4;

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerAverias = async () => {
  await simularRetardo();
  return [...averias];
};

export const obtenerAveriaPorId = async (id) => {
  await simularRetardo();
  return averias.find((a) => a.id === id) || null;
};

export const crearAveria = async (averia) => {
  await simularRetardo();
  const nueva = { ...averia, id: `A${String(contadorId++).padStart(3, '0')}` };
  averias.push(nueva);
  return { ...nueva };
};

export const actualizarAveria = async (id, datosActualizados) => {
  await simularRetardo();
  const indice = averias.findIndex((a) => a.id === id);
  if (indice === -1) throw new Error('Avería no encontrada');
  averias[indice] = { ...averias[indice], ...datosActualizados };
  return { ...averias[indice] };
};

export const eliminarAveria = async (id) => {
  await simularRetardo();
  averias = averias.filter((a) => a.id !== id);
  return true;
};*/
