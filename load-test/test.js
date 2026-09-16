import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Stage 1: Ramp up to 50 Virtual Users
    { duration: '1m',  target: 200 },  // Stage 2: Spike to 200 Virtual Users
    { duration: '3m',  target: 500 },  // Stage 3: Maintain peak load 500 VUs to push CPU > 70%
    { duration: '1m',  target: 50 },   // Stage 4: Ramp down to 50 VUs
    { duration: '30s', target: 0 },    // Stage 5: Cool down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should respond under 2000ms
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:5000';

export default function () {
  // 1. Test GET Search API
  const searchRes = http.get(`${BASE_URL}/api/products/search?name=iphone`);
  check(searchRes, {
    'Search API status is 200': (r) => r.status === 200,
  });

  sleep(1);

  // 2. Test POST Add Product API
  const payload = JSON.stringify({
    name: `LoadTest Product ${Math.floor(Math.random() * 10000)}`,
    price: 199000,
    description: 'Auto Scaling Load Test Item',
    stock: 10,
    category: 'LoadTest',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const addRes = http.post(`${BASE_URL}/api/products`, payload, params);
  check(addRes, {
    'Add Product API status is 201': (r) => r.status === 201,
  });

  sleep(1);
}
