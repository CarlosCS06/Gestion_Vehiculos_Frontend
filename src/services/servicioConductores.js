import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/conductores';

export const obtenerConductores = async () => {
  const response = await fetchWithLogging(AUTH_API_URL);
  return response.json();
};

export const obtenerConductorPorDni = async (dni) => {
  const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`);
  return response.json();
};

export const crearConductor = async (conductor) => {
  const token = localStorage.getItem('token');
  const response = await fetchWithLogging(AUTH_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(conductor),
  });
  return response.json();
};

export const actualizarConductor = async (dni, datosActualizados) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(datosActualizados),
  });
  return response.json();
};

export const eliminarConductor = async (dni) => {
  const token = sessionStorage.getItem('token');
  const response = await fetchWithLogging(`${AUTH_API_URL}/${dni}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  return response.json();
};
/*  
const CONDUCTORES_INICIALES = [
  {
    dni: '12345678A',
    foto: '/fotoCarlos.png',
    nombre: 'Carlos',
    apellidos: 'García López',
    telefono: '612345678',
    direccion: 'Calle Mayor 10, Madrid',
    fecha_nacimiento: '1990-12-10',
    trayectos: ['T001', 'T002'],
  },
  {
    dni: '87654321B',
    foto: '/fotoMaria.png',
    nombre: 'María',
    apellidos: 'Fernández Ruiz',
    telefono: '698765432',
    direccion: 'Avenida del Sol 5, Barcelona',
    fecha_nacimiento: '1985-05-05',
    trayectos: ['T003', 'T005'],
  },
  {
    dni: '11223344C',
    foto: '/fotoPedro.png',
    nombre: 'Pedro',
    apellidos: 'Martínez Sánchez',
    telefono: '655112233',
    direccion: 'Plaza España 3, Valencia',
    fecha_nacimiento: '1988-01-01',
    trayectos: ['T004'],
  },
];

const cargarConductores = () => {
  const guardados = localStorage.getItem('conductores_mock');
  return guardados ? JSON.parse(guardados) : CONDUCTORES_INICIALES;
};

let conductores = cargarConductores();

const guardarConductores = () => {
  localStorage.setItem('conductores_mock', JSON.stringify(conductores));
};

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerConductores = async () => {
  await simularRetardo();
  return [...conductores];
};

export const obtenerConductorPorDni = async (dni) => {
  await simularRetardo();
  return conductores.find((c) => c.dni === dni) || null;
};

export const crearConductor = async (conductor) => {
  await simularRetardo();
  conductores.push({ ...conductor, trayectos: conductor.trayectos || [] });
  guardarConductores();
  return { ...conductor };
};

export const actualizarConductor = async (dni, datosActualizados) => {
  await simularRetardo();
  const indice = conductores.findIndex((c) => c.dni === dni);
  if (indice === -1) throw new Error('Conductor no encontrado');
  conductores[indice] = { ...conductores[indice], ...datosActualizados };
  guardarConductores();
  return { ...conductores[indice] };
};

export const eliminarConductor = async (dni) => {
  await simularRetardo();
  conductores = conductores.filter((c) => c.dni !== dni);
  guardarConductores();
  return true;
};
*/
