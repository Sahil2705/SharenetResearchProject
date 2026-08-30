// SmartNet API Client Service

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal HTTP request handler
 */
async function request(endpoint, { method = 'GET', data = null, params = null, headers = {} } = {}) {
  let url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Append URL Query parameters if provided
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const token = localStorage.getItem('smartnet_token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...headers
  };

  const config = {
    method,
    headers: defaultHeaders,
    ...(data ? { body: JSON.stringify(data) } : {})
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 401 Unauthorized (Session Expiry)
    if (response.status === 401) {
      if (localStorage.getItem('smartnet_token') && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('smartnet_token');
        localStorage.removeItem('smartnet_user');
        window.location.href = '/login?expired=true';
      }
    }

    const json = await response.json().catch(() => ({
      success: false,
      message: `Failed to parse response (Status: ${response.status})`
    }));

    if (!response.ok) {
      throw new Error(json.message || `Request failed with status ${response.status}`);
    }

    return json;
  } catch (error) {
    console.error(`API Error [${method} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  get: (endpoint, params = null, headers = {}) => request(endpoint, { method: 'GET', params, headers }),
  post: (endpoint, data = null, headers = {}) => request(endpoint, { method: 'POST', data, headers }),
  put: (endpoint, data = null, headers = {}) => request(endpoint, { method: 'PUT', data, headers }),
  patch: (endpoint, data = null, headers = {}) => request(endpoint, { method: 'PATCH', data, headers }),
  delete: (endpoint, data = null, headers = {}) => request(endpoint, { method: 'DELETE', data, headers })
};

export default api;
