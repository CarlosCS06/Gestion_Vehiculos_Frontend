/**
 * Utilidades de validación para la aplicación FlotaGest.
 * Contiene validaciones reales de DNI español, teléfono, email, edad, etc.
 */

// Tabla de letras del DNI español (algoritmo oficial)
const LETRAS_DNI = 'TRWAGMYFPDXBNJZSQVHLCKE';

/**
 * Valida un DNI/NIF español comprobando el dígito de control.
 * Formato: 8 dígitos + 1 letra (ej: 12345678Z)
 * También acepta NIE: X/Y/Z + 7 dígitos + letra
 * @param {string} dni
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarDNI = (dni) => {
  if (!dni || typeof dni !== 'string') {
    return { valido: false, mensaje: 'El DNI es obligatorio.' };
  }

  const dniLimpio = dni.trim().toUpperCase().replace(/[\s.-]/g, '');

  // Comprobar formato NIE (X/Y/Z + 7 dígitos + letra)
  const regexNIE = /^[XYZ]\d{7}[A-Z]$/;
  // Comprobar formato DNI (8 dígitos + letra)
  const regexDNI = /^\d{8}[A-Z]$/;

  if (!regexDNI.test(dniLimpio) && !regexNIE.test(dniLimpio)) {
    return { valido: false, mensaje: 'Formato de DNI/NIE incorrecto. Debe ser 8 dígitos + letra (ej: 12345678Z) o NIE (X1234567L).' };
  }

  let numero;
  const letra = dniLimpio.charAt(dniLimpio.length - 1);

  if (regexNIE.test(dniLimpio)) {
    // Convertir letra inicial del NIE a número
    const primeraLetra = dniLimpio.charAt(0);
    const reemplazo = { X: '0', Y: '1', Z: '2' };
    numero = parseInt(reemplazo[primeraLetra] + dniLimpio.substring(1, 8), 10);
  } else {
    numero = parseInt(dniLimpio.substring(0, 8), 10);
  }

  const letraEsperada = LETRAS_DNI[numero % 23];
  if (letra !== letraEsperada) {
    return { valido: false, mensaje: `La letra del DNI no es correcta. Para el número ${dniLimpio.substring(0, dniLimpio.length - 1)} la letra debería ser "${letraEsperada}".` };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Valida un número de teléfono español.
 * Acepta con o sin prefijo +34 / 0034.
 * Los números españoles empiezan por 6, 7, 8 o 9 y tienen 9 dígitos.
 * @param {string} telefono
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarTelefono = (telefono) => {
  if (!telefono || typeof telefono !== 'string') {
    return { valido: false, mensaje: 'El teléfono es obligatorio.' };
  }

  // Limpiar: quitar espacios, guiones, paréntesis
  let limpio = telefono.trim().replace(/[\s\-().]/g, '');

  // Quitar prefijo si lo tiene
  if (limpio.startsWith('+34')) {
    limpio = limpio.substring(3);
  } else if (limpio.startsWith('0034')) {
    limpio = limpio.substring(4);
  }

  // Comprobar que son 9 dígitos
  if (!/^\d{9}$/.test(limpio)) {
    return { valido: false, mensaje: 'El teléfono debe tener 9 dígitos (con o sin prefijo +34).' };
  }

  // Comprobar que empieza por 6, 7, 8 o 9
  const primerDigito = limpio.charAt(0);
  if (!['6', '7', '8', '9'].includes(primerDigito)) {
    return { valido: false, mensaje: 'El teléfono español debe empezar por 6, 7, 8 o 9.' };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Valida un email con formato estándar.
 * No puede verificar si "existe" realmente sin un servicio externo,
 * pero sí valida el formato de forma estricta.
 * @param {string} email
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valido: false, mensaje: 'El correo electrónico es obligatorio.' };
  }

  const limpio = email.trim();

  // Regex estricta para emails
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  if (!regex.test(limpio)) {
    return { valido: false, mensaje: 'El formato del correo electrónico no es válido (ej: usuario@dominio.com).' };
  }

  // Comprobar dominios comunes que existen
  const dominio = limpio.split('@')[1].toLowerCase();
  const dominiosConocidos = [
    'gmail.com', 'hotmail.com', 'hotmail.es', 'outlook.com', 'outlook.es',
    'yahoo.com', 'yahoo.es', 'icloud.com', 'live.com', 'protonmail.com',
    'proton.me', 'zoho.com', 'aol.com', 'mail.com', 'gmx.com', 'gmx.es',
    'telefonica.net', 'movistar.es', 'orange.es', 'vodafone.es',
    'edu.es', 'usal.es', 'upm.es', 'ucm.es', 'uam.es', 'ugr.es', 'us.es',
  ];

  // No bloquear dominios desconocidos, solo advertir si parece sospechoso
  const tld = dominio.split('.').pop();
  if (tld.length < 2) {
    return { valido: false, mensaje: 'El dominio del correo no parece válido.' };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Valida que una persona sea mayor de edad (18+).
 * @param {string} fechaNacimiento - Fecha en formato yyyy-MM-dd o ISO
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarEdadMinima = (fechaNacimiento, edadMinima = 18) => {
  if (!fechaNacimiento) {
    return { valido: false, mensaje: 'La fecha de nacimiento es obligatoria.' };
  }

  const fecha = new Date(fechaNacimiento);
  if (isNaN(fecha.getTime())) {
    return { valido: false, mensaje: 'La fecha de nacimiento no es válida.' };
  }

  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mesDiff = hoy.getMonth() - fecha.getMonth();
  if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }

  if (edad < edadMinima) {
    return { valido: false, mensaje: `El conductor debe tener al menos ${edadMinima} años. La fecha indica ${edad} años.` };
  }

  if (edad > 120) {
    return { valido: false, mensaje: `La edad calculada (${edad} años) no parece realista.` };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Valida que la fecha de matriculación no sea posterior a la de compra.
 * @param {string} fechaMatriculacion
 * @param {string} fechaCompra
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarFechasVehiculo = (fechaMatriculacion, fechaCompra) => {
  if (!fechaMatriculacion || !fechaCompra) {
    return { valido: true, mensaje: '' }; // Si falta alguna, no se puede validar
  }

  const matriculacion = new Date(fechaMatriculacion);
  const compra = new Date(fechaCompra);

  if (isNaN(matriculacion.getTime()) || isNaN(compra.getTime())) {
    return { valido: true, mensaje: '' }; // Si no se pueden parsear, dejamos pasar
  }

  if (matriculacion > compra) {
    return { valido: false, mensaje: 'La fecha de matriculación no puede ser posterior a la fecha de compra.' };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Valida que la fecha/hora de llegada sea posterior a la de salida.
 * @param {string} fechaSalida
 * @param {string} fechaLlegada
 * @returns {{ valido: boolean, mensaje: string }}
 */
export const validarFechasViaje = (fechaSalida, fechaLlegada) => {
  if (!fechaSalida || !fechaLlegada) {
    return { valido: true, mensaje: '' }; // Si falta alguna, no se puede validar
  }

  const salida = new Date(fechaSalida);
  const llegada = new Date(fechaLlegada);

  if (isNaN(salida.getTime()) || isNaN(llegada.getTime())) {
    return { valido: true, mensaje: '' };
  }

  if (llegada < salida) {
    return { valido: false, mensaje: 'La fecha y hora de llegada debe ser igual o posterior a la de salida.' };
  }

  return { valido: true, mensaje: '' };
};

/**
 * Formatea un teléfono español al formato estándar con prefijo.
 * @param {string} telefono
 * @returns {string} Teléfono formateado (+34 6XX XXX XXX)
 */
export const formatearTelefono = (telefono) => {
  if (!telefono) return '';
  
  let limpio = telefono.trim().replace(/[\s\-().]/g, '');
  
  if (limpio.startsWith('+34')) {
    limpio = limpio.substring(3);
  } else if (limpio.startsWith('0034')) {
    limpio = limpio.substring(4);
  }
  
  if (limpio.length !== 9) return telefono; // Devolver tal cual si no tiene 9 dígitos
  
  return `+34 ${limpio.substring(0, 3)} ${limpio.substring(3, 6)} ${limpio.substring(6, 9)}`;
};
