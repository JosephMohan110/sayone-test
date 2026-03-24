import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const fetchTasks = () => API.get('/tasks/');
export const createTask = (newTask) => API.post('/tasks/', newTask);
export const updateTask = (id, updatedTask) => API.put(`/tasks/${id}/`, updatedTask);
export const deleteTask = (id) => API.delete(`/tasks/${id}/`);
export const completeTask = (id) => API.post(`/tasks/${id}/complete/`);
export const suggestPriority = (title) => API.post('/tasks/suggest_priority/', { title });