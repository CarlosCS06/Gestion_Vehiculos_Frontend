// Servicio mock de Revisiones

let revisiones = [
  {
    id: 'R001',
    fecha: '2025-12-01',
    lugar: 'Taller Central Madrid',
    activo: false,
    aprobada: true,
  },
  {
    id: 'R002',
    fecha: '2026-02-15',
    lugar: 'Taller Norte Barcelona',
    activo: true,
    aprobada: false,
  },
  {
    id: 'R003',
    fecha: '2026-01-20',
    lugar: 'Taller Sur Sevilla',
    activo: false,
    aprobada: true,
  },
];

let contadorId = 4;

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
