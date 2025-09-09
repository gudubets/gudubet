import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorCount = new Counter('errors');
const errorRate = new Rate('error_rate');
const paymentDuration = new Trend('payment_duration', true);
const gameLaunchDuration = new Trend('game_launch_duration', true);

// Test configuration
export const options = {
  scenarios: {
    // Baseline load test
    baseline_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '5m',
      tags: { test_type: 'baseline' },
    },
    
    // Peak load simulation
    peak_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Stay at peak
        { duration: '2m', target: 100 },  // Peak load
        { duration: '3m', target: 100 },  // Sustain peak
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'peak' },
    },
    
    // Spike test
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 }, // Fast ramp up
        { duration: '30s', target: 100 }, // Short peak
        { duration: '10s', target: 0 },   // Fast ramp down
      ],
      tags: { test_type: 'spike' },
    },
    
    // Stress test - find breaking point
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '2m', target: 400 },
        { duration: '2m', target: 500 },
        { duration: '5m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'stress' },
    }
  },
  
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s
    http_req_failed: ['rate<0.05'], // Error rate < 5%
    payment_duration: ['p(95)<10000'], // Payment completion < 10s
    game_launch_duration: ['p(95)<5000'], // Game launch < 5s
  }
};

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'https://ziiwapwvyavfakeuhvpt.supabase.co';

// Test data
const users = [
  { email: 'test1@example.com', password: 'testpass123' },
  { email: 'test2@example.com', password: 'testpass123' },
  { email: 'test3@example.com', password: 'testpass123' },
];

export function setup() {
  // Create test users if needed
  console.log('Setting up load test environment...');
}

export default function() {
  const user = users[Math.floor(Math.random() * users.length)];
  
  // Test scenarios with weighted distribution
  const scenario = Math.random();
  
  if (scenario < 0.3) {
    testHomepageBrowsing();
  } else if (scenario < 0.5) {
    testUserRegistrationLogin(user);
  } else if (scenario < 0.7) {
    testGameLaunching(user);
  } else if (scenario < 0.9) {
    testPaymentFlow(user);
  } else {
    testLiveCasinoAccess(user);
  }
  
  sleep(1);
}

function testHomepageBrowsing() {
  // Homepage load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage response time OK': (r) => r.timings.duration < 2000,
  }) || errorCount.add(1);
  
  // Browse games
  response = http.get(`${BASE_URL}/casino`);
  check(response, {
    'casino page loads': (r) => r.status === 200,
  }) || errorCount.add(1);
  
  // Check live casino
  response = http.get(`${BASE_URL}/live-casino`);
  check(response, {
    'live casino loads': (r) => r.status === 200,
  }) || errorCount.add(1);
}

function testUserRegistrationLogin(user) {
  // Login attempt
  const loginData = {
    email: user.email,
    password: user.password,
  };
  
  const response = http.post(
    `${BASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify(loginData),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': __ENV.SUPABASE_ANON_KEY,
      },
    }
  );
  
  const success = check(response, {
    'login successful': (r) => r.status === 200,
    'login response time OK': (r) => r.timings.duration < 3000,
  });
  
  if (!success) {
    errorCount.add(1);
    errorRate.add(1);
  }
}

function testGameLaunching(user) {
  // Simulate authenticated user launching games
  const headers = {
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // Get games list
  let response = http.get(`${BASE_URL}/rest/v1/casino_games`, { headers });
  check(response, {
    'games list loads': (r) => r.status === 200,
  }) || errorCount.add(1);
  
  // Launch a game (simulate)
  const gameId = Math.floor(Math.random() * 100) + 1;
  const launchStart = Date.now();
  
  response = http.post(
    `${BASE_URL}/functions/v1/launch-game`,
    JSON.stringify({ gameId }),
    { headers }
  );
  
  const launchTime = Date.now() - launchStart;
  gameLaunchDuration.add(launchTime);
  
  check(response, {
    'game launches successfully': (r) => r.status === 200,
    'game launch time acceptable': () => launchTime < 5000,
  }) || errorCount.add(1);
}

function testPaymentFlow(user) {
  const headers = {
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // Initiate deposit
  const depositData = {
    amount: 50 + Math.random() * 200, // Random amount between 50-250
    currency: 'TRY',
    method: 'credit_card',
  };
  
  const paymentStart = Date.now();
  
  const response = http.post(
    `${BASE_URL}/functions/v1/create-payment`,
    JSON.stringify(depositData),
    { headers }
  );
  
  const paymentTime = Date.now() - paymentStart;
  paymentDuration.add(paymentTime);
  
  check(response, {
    'payment initiated': (r) => r.status === 200,
    'payment response time OK': () => paymentTime < 10000,
  }) || errorCount.add(1);
  
  // Check balance (simulate post-payment)
  sleep(2);
  const balanceResponse = http.get(
    `${BASE_URL}/rest/v1/users?select=balance&auth_user_id=eq.${user.id}`,
    { headers }
  );
  
  check(balanceResponse, {
    'balance check works': (r) => r.status === 200,
  }) || errorCount.add(1);
}

function testLiveCasinoAccess(user) {
  const headers = {
    'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };
  
  // Get live tables
  let response = http.get(`${BASE_URL}/rest/v1/live_tables`, { headers });
  check(response, {
    'live tables load': (r) => r.status === 200,
  }) || errorCount.add(1);
  
  // Join a table (simulate)
  const tableId = Math.floor(Math.random() * 10) + 1;
  response = http.post(
    `${BASE_URL}/functions/v1/join-live-table`,
    JSON.stringify({ tableId }),
    { headers }
  );
  
  check(response, {
    'live table join works': (r) => r.status === 200,
  }) || errorCount.add(1);
}

export function teardown(data) {
  console.log('Load test completed. Cleaning up...');
  
  // Performance summary
  console.log(`Total errors: ${errorCount.value}`);
  console.log(`Error rate: ${(errorRate.value * 100).toFixed(2)}%`);
}