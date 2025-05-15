import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/', // Update with your Django backend
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  // console.log("token:",token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }else{
    config.headers.Authorization = null;
  }
  // console.log("config:",config)
  return config;

});

export default api;
