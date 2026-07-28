import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:5000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone: '1234567890', password: 'password123' })
  });
  const data = await res.json();
  console.log('Response:', res.status, data);
}

test();
