// Servicio mock de Trayectos

let trayectos = [
  {
    id: 'T001',
    horaSalida: '2026-03-10T08:00',
    horaLlegada: '2026-03-10T12:30',
    origen: 'Madrid',
    destino: 'Barcelona',
    kmRecorridos: 620,
    activo: false,
    completado: true,
    programado: false,
    gastoGasolina: 74.4,
    conductor: '12345678A',
  },
  {
    id: 'T002',
    horaSalida: '2026-03-12T06:00',
    horaLlegada: '2026-03-12T09:00',
    origen: 'Valencia',
    destino: 'Sevilla',
    kmRecorridos: 660,
    activo: false,
    completado: true,
    programado: false,
    gastoGasolina: 79.2,
    conductor: '12345678A',
  },
  {
    id: 'T003',
    horaSalida: '2026-03-15T07:30',
    horaLlegada: '',
    origen: 'Bilbao',
    destino: 'Málaga',
    kmRecorridos: 0,
    activo: false,
    completado: false,
    programado: true,
    gastoGasolina: 0,
    conductor: '87654321B',
  },
  {
    id: 'T004',
    horaSalida: '2026-03-18T09:00',
    horaLlegada: '',
    origen: 'Zaragoza',
    destino: 'Alicante',
    kmRecorridos: 250,
    activo: true,
    completado: false,
    programado: false,
    gastoGasolina: 12.5,
    conductor: '11223344C',
  },
  {
    id: 'T005',
    horaSalida: '2026-03-20T10:00',
    horaLlegada: '',
    origen: 'Salamanca',
    destino: 'Granada',
    kmRecorridos: 0,
    activo: false,
    completado: false,
    programado: true,
    gastoGasolina: 0,
    conductor: '87654321B',
  },
];

let contadorId = 6;

const simularRetardo = () => new Promise((res) => setTimeout(res, 200));

export const obtenerTrayectos = async () => {
  await simularRetardo();
  return [...trayectos];
};

export const obtenerTrayectoPorId = async (id) => {
  await simularRetardo();
  return trayectos.find((t) => t.id === id) || null;
};

export const crearTrayecto = async (trayecto) => {
  await simularRetardo();
  const nuevo = { ...trayecto, id: `T${String(contadorId++).padStart(3, '0')}` };
  trayectos.push(nuevo);
  return { ...nuevo };
};

export const actualizarTrayecto = async (id, datosActualizados) => {
  await simularRetardo();
  const indice = trayectos.findIndex((t) => t.id === id);
  if (indice === -1) throw new Error('Trayecto no encontrado');
  trayectos[indice] = { ...trayectos[indice], ...datosActualizados };
  return { ...trayectos[indice] };
};

export const eliminarTrayecto = async (id) => {
  await simularRetardo();
  trayectos = trayectos.filter((t) => t.id !== id);
  return true;
};
