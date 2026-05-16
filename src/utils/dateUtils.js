/**
 * Formatea una fecha ISO a una cadena compatible con <input type="datetime-local">
 * respetando la zona horaria local.
 */
export const formatForDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    return '';
  }
};

/**
 * Formatea una fecha ISO a una cadena compatible con <input type="date">
 * respetando la zona horaria local.
 */
export const formatForDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    return '';
  }
};

/**
 * Convierte una cadena de un <input type="datetime-local"> a un objeto Date
 * interpretándola como hora local.
 */
export const parseFromDateTimeLocal = (value) => {
  if (!value) return null;
  return new Date(value);
};

/**
 * Formatea una fecha para mostrar en tablas usando el locale es-ES
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-ES');
  } catch (e) {
    return '—';
  }
};

/**
 * Convierte un valor de input (date o datetime-local) a string ISO UTC
 * de forma segura.
 */
export const safeIsoString = (value) => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toISOString();
  } catch (e) {
    return '';
  }
};
