import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

let refreshTokenPromise = null;

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && localStorage.getItem('refresh_token')) {
      originalRequest._retry = true;
      
      if (!refreshTokenPromise) {
        refreshTokenPromise = refreshTokenRequest(localStorage.getItem('refresh_token'));
      }
      
      try {
        await refreshTokenPromise;
        refreshTokenPromise = null;
        originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
        return API(originalRequest);
      } catch (refreshError) {
        refreshTokenPromise = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const refreshTokenRequest = async (refresh) => {
  const response = await API.post('/user/token/refresh/', { refresh });
  const { access } = response.data;
  localStorage.setItem('access_token', access);
  return response;
};

export const login = (credentials) => API.post('/user/login/', credentials);
export const register = (userData) => API.post('/user/register/', userData);
export const logout = (data) => API.post('/user/logout/', data);

export const fetchTasks = () => API.get('/tasks/');
export const createTask = (newTask) => API.post('/tasks/', newTask);
export const updateTask = (id, updatedTask) => API.put(`/tasks/${id}/`, updatedTask);
export const deleteTask = (id) => API.delete(`/tasks/${id}/`);
export const completeTask = (id) => API.post(`/tasks/${id}/complete/`);
export const suggestPriority = (title) => API.post('/tasks/suggest_priority/', { title });