import http from 'http';

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data.substring(0, 500), res.statusCode));
}).on('error', err => console.log('Error:', err.message));
