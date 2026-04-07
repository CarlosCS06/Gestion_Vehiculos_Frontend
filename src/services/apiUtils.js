/**
 */
export const fetchWithLogging = async (url, options = {}) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorMessage = `${response.status} ${response.statusText}`;
      let errorDetails = null;
      console.log(token);
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
          if (errorDetails.message) {
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

      console.group(`%c[API Error] ${response.status} ${url}`, 'color: #d13438; font-weight: bold;');
      console.log('Metodo:', options.method || 'GET');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Detalles:', errorDetails);
      console.groupEnd();

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
