// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL for cookies
});

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    withCredentials: config.withCredentials,
    headers: config.headers
  });
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const publicRoutes =[
        '/',
        '/login'
      ]

      const isPublicRoute = 
      currentPath === '/' ||
      currentPath === '/login' ||
      // publicRoutes.includes(currentPath) || 
      currentPath.startsWith('/poll/') ||
      currentPath.startsWith('/results/');

      if(!isPublicRoute){
        window.location.href = '/login';
      }
      // if (currentPath !== '/login' && !currentPath.startsWith('/poll/')) {
      //   window.location.href = '/login';
      // }
    }
    return Promise.reject(error);
  }
);

export default api;

// frontend/src/services/api.ts
// import axios from 'axios';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// const api = axios.create({
//   baseURL: API_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add token
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token');
//       const currentPath = window.location.pathname;
//       if (currentPath !== '/login' && !currentPath.startsWith('/poll/')) {
//         window.location.href = '/login';
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;