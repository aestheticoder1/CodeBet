import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://codebet-backend.onrender.com/api', // or your backend URL
});

export default instance;