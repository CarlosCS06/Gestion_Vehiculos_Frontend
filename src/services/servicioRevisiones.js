import { fetchWithLogging } from './apiUtils';

const AUTH_API_URL = 'https://gestion-vehiculos-backend.vercel.app/api/revisiones';

export const obtenerRevisiones = async () => {
  const response = await fetchWithLogging(AUTH_API_URL);
  return response.json();
};

export const obtenerRevisionPorId = async (id) => {
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`);
  return response.json();
};

export const crearRevision = async (revision) => {
  const response = await fetchWithLogging(AUTH_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(revision),
  });
  return response.json();
};

export const actualizarRevision = async (id, datosActualizados) => {
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datosActualizados),
  });
  return response.json();
};

export const eliminarRevision = async (id) => {
  const response = await fetchWithLogging(`${AUTH_API_URL}/${id}`, {
    method: 'DELETE',
  });
  return response.json();
};
/*
let revisiones = [
  // Toyota Hilux (1234-ABC)
  { id: 'M001 (15k)', matricula: '1234-ABC', fecha: '2023-03-15', lugar: 'Taller Central Madrid', activo: false, aprobada: true },
  { id: 'ITV-2024', matricula: '1234-ABC', fecha: '2024-03-15', lugar: 'ITV Vicálvaro', activo: false, aprobada: true },
  { id: 'M002 (30k)', matricula: '1234-ABC', fecha: '2025-03-15', lugar: 'Taller Central Madrid', activo: false, aprobada: true },
  { id: 'ITV-2026', matricula: '1234-ABC', fecha: '2026-03-15', lugar: 'ITV Vicálvaro', activo: true, aprobada: false },
  { id: 'M003 (45k)', matricula: '1234-ABC', fecha: '2026-01-10', lugar: 'Taller Central Madrid', activo: false, aprobada: true },

  // Ford Transit (5678-DEF)
  { id: 'M004 (15k)', matricula: '5678-DEF', fecha: '2024-07-20', lugar: 'Taller Norte Barcelona', activo: false, aprobada: true },
  { id: 'ITV-2025', matricula: '5678-DEF', fecha: '2025-07-20', lugar: 'ITV Badalona', activo: false, aprobada: true },
  { id: 'M005 (30k)', matricula: '5678-DEF', fecha: '2026-02-10', lugar: 'Taller Norte Barcelona', activo: true, aprobada: false },

  // Renault Kangoo (9012-GHI)
  { id: 'M006 (Primer año)', matricula: '9012-GHI', fecha: '2026-01-15', lugar: 'Renault Retail Group', activo: false, aprobada: true },

  // Volkswagen Caddy (3456-JKL)
  { id: 'M007 (15k)', matricula: '3456-JKL', fecha: '2022-11-05', lugar: 'Taller Sur Sevilla', activo: false, aprobada: true },
  { id: 'ITV-2023', matricula: '3456-JKL', fecha: '2023-11-05', lugar: 'ITV La Cartuja', activo: false, aprobada: true },
  { id: 'M008 (30k)', matricula: '3456-JKL', fecha: '2024-11-05', lugar: 'Taller Sur Sevilla', activo: false, aprobada: true },
  { id: 'ITV-2025', matricula: '3456-JKL', fecha: '2025-11-05', lugar: 'ITV La Cartuja', activo: false, aprobada: true },
  { id: 'M009 (45k)', matricula: '3456-JKL', fecha: '2026-01-20', lugar: 'Taller Sur Sevilla', activo: false, aprobada: true },
  { id: 'M010 (60k)', matricula: '3456-JKL', fecha: '2026-03-10', lugar: 'Taller Sur Sevilla', activo: true, aprobada: false },

  // Mercedes Sprinter (7890-MNO)
  { id: 'ITV-2025', matricula: '7890-MNO', fecha: '2025-06-01', lugar: 'ITV Getafe', activo: false, aprobada: true },
  { id: 'M011 (20k)', matricula: '7890-MNO', fecha: '2025-12-15', lugar: 'Mercedes-Benz Service', activo: false, aprobada: true },
  { id: 'ITV-2026', matricula: '7890-MNO', fecha: '2026-03-10', lugar: 'ITV Getafe', activo: true, aprobada: false },

  // Honda PCX (7364-CFG)
  { id: 'M012 (5k)', matricula: '7364-CFG', fecha: '2024-08-01', lugar: 'Honda Moto Valencia', activo: false, aprobada: true },
  { id: 'M013 (10k)', matricula: '7364-CFG', fecha: '2025-02-01', lugar: 'Honda Moto Valencia', activo: false, aprobada: true },
  { id: 'M014 (15k)', matricula: '7364-CFG', fecha: '2025-08-01', lugar: 'Honda Moto Valencia', activo: false, aprobada: true },
  { id: 'M015 (20k)', matricula: '7364-CFG', fecha: '2026-02-01', lugar: 'Honda Moto Valencia', activo: true, aprobada: false },
];

let contadorId = 16;

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerRevisiones = async () => {
  await simularRetardo();
  return [...revisiones];
};

export const obtenerRevisionPorId = async (id) => {
  await simularRetardo();
  return revisiones.find((r) => r.id === id) || null;
};

export const crearRevision = async (revision) => {
  await simularRetardo();
  const nueva = { ...revision, id: `R${String(contadorId++).padStart(3, '0')}` };
  revisiones.push(nueva);
  return { ...nueva };
};

export const actualizarRevision = async (id, datosActualizados) => {
  await simularRetardo();
  const indice = revisiones.findIndex((r) => r.id === id);
  if (indice === -1) throw new Error('Revisión no encontrada');
  revisiones[indice] = { ...revisiones[indice], ...datosActualizados };
  return { ...revisiones[indice] };
};

export const eliminarRevision = async (id) => {
  await simularRetardo();
  revisiones = revisiones.filter((r) => r.id !== id);
  return true;
};
*/