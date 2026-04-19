#!/usr/bin/env node
const axios = require('axios');

const api = axios.create({
  baseURL: process.env.VITE_API_URL || 'http://backend:8000',
  headers: { 'Content-Type': 'application/json' },
});

async function test() {
  try {
    console.log('URL base:', api.defaults.baseURL);
    
    const params = new URLSearchParams();
    params.append('username', 'admin@hospital.bo');
    params.append('password', 'Admin1234!');

    console.log('Enviando request de login...');
    const res = await api.post('/api/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    
    console.log('Login exitoso:', res.status);
    console.log('Token:', res.data.access_token?.substring(0, 50) + '...');
  } catch (err) {
    console.log('Error:', err.message);
    if (err.response) {
      console.log('Status:', err.response.status);
      console.log('Data:', err.response.data);
    }
  }
}

test();