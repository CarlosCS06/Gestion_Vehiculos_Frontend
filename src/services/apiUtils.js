export const fetchWithLogging = async (url, options = {}) => {
  try {
    const token = sessionStorage.getItem('token');
    
    // Preparar las cabeceras asegurando que no sobreescribimos las existentes
    const headers = { ...options.headers };
    
    // Inyectar el token automáticamente si existe y no se ha solicitado omitir la autenticación
    if (!options.skipAuth && token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const finalOptions = { ...options, headers };
    const method = options.method || 'GET';

    const response = await fetch(url, finalOptions);

    if (!response.ok) {
      let errorMessage = response.statusText || 'Error desconocido';
      let errorDetails = null;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
          if (errorDetails.error) {
            errorMessage = errorDetails.error;
          } else if (errorDetails.message) {
            errorMessage = errorDetails.message;
          }
        } else {
          const text = await response.text();
          if (text && text.length < 500) {
            errorDetails = text;
          }
        }
      } catch (e) {
        console.warn('Could not parse error response body', e);
      }

      const shouldLog = !options.skipLog || (Array.isArray(options.skipLog) ? !options.skipLog.includes(response.status) : options.skipLog !== response.status);

      if (shouldLog) {
        console.group(`%c[API Error] ${response.status} ${url}`, 'color: #d13438; font-weight: bold;');
        console.log('Metodo:', method);
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Token enviado:', !!headers['Authorization'] || !!headers['authorization']);
        console.log('Detalles:', errorDetails);
        console.groupEnd();
      }

      const error = new Error(errorMessage);
      error.status = response.status;
      error.details = errorDetails;
      throw error;
    }

    return response;
  } catch (error) {
    if (!error.status) {
      console.error(`[Network Error] ${options.method || 'GET'} ${url}`, error);
    }
    throw error;
  }
};

