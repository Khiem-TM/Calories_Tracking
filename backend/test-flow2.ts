import axios from 'axios';
import * as fs from 'fs';
import FormData = require('form-data');

const API_URL = 'http://localhost:3001';

async function testFlow() {
  try {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    console.log('1. Registering user:', uniqueEmail);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      email: uniqueEmail,
      password: 'password123',
      display_name: 'Test User'
    });
    
    let token = regRes.data?.data?.access_token;
    if (!token) {
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
        email: uniqueEmail,
        password: 'password123'
        });
        token = loginRes.data?.data?.access_token;
    }
    
    console.log('Got token:', token ? 'YES' : 'NO');
    
    console.log('2. Uploading progress photo...');
    const form = new FormData();
    form.append('file', fs.createReadStream('/Users/UET/DACN/Project/sample/ok.jpg'));
    form.append('photoType', 'front');
    
    const uploadRes = await axios.post(`${API_URL}/body-metrics/photos`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload response:', uploadRes.data);

    console.log('3. Checking Database (fetching photos)...');
    const photosRes = await axios.get(`${API_URL}/body-metrics/photos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Photos retrieved:', JSON.stringify(photosRes.data, null, 2));
    
    const photoUrl = photosRes.data?.data?.[0]?.photoUrl || uploadRes.data?.data?.photoUrl;
    console.log('4. Testing image URL:', photoUrl);
    
    if (photoUrl && photoUrl.startsWith('http')) {
        const imgRes = await axios.head(photoUrl);
        console.log('Image fetch status:', imgRes.status, imgRes.headers['content-type']);
    } else if (photoUrl) {
        const fullUrl = `${API_URL}${photoUrl}`;
        const imgRes = await axios.head(fullUrl);
        console.log('Image fetch status:', imgRes.status, imgRes.headers['content-type']);
    } else {
        console.log('No photo URL found');
    }
    
  } catch (err: any) {
    console.error('Error during test flow:', err.response?.data ?? { message: err.message, code: err.code });
  }
}

testFlow();
