/**
 * @file api.js
 * @description Centralized API configuration and fetch wrapper with automatic JWT Bearer token injection.
 */

const API_URL = "";

/**
 * Enhanced fetch wrapper that automatically handles credentials and Authorization headers.
 * @param {string} url - Request URL endpoint.
 * @param {Object} [options={}] - Fetch options object.
 * @returns {Promise<Response>} Fetch API Response promise.
 */
function apiFetch(url, options = {}) {
  options.credentials = 'include';
  options.headers = options.headers || {};

  let token = localStorage.getItem('token');
  if (token) {
    token = token.replace(/['"]+/g, '').trim();
    if (token && token !== 'null' && token !== 'undefined' && token !== '""') {
      if (options.headers instanceof Headers) {
        if (!options.headers.has('Authorization')) {
          options.headers.set('Authorization', `Bearer ${token}`);
        }
      } else {
        options.headers = {
          'Authorization': `Bearer ${token}`,
          ...options.headers
        };
      }
    }
  }
  return fetch(url, options);
}
