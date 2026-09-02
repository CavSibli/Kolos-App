import http from 'node:http';

const API_HEALTH_URL =
  process.env.KOLOS_API_HEALTH_URL ?? 'http://localhost:3000/v1/health/live';
const INTERVAL_MS = 500;
const MAX_ATTEMPTS = 120;

function ping() {
  return new Promise((resolve, reject) => {
    const request = http.get(API_HEALTH_URL, (response) => {
      response.resume();
      if (response.statusCode === 200) {
        resolve();
        return;
      }
      reject(new Error(`Unexpected status ${response.statusCode}`));
    });

    request.on('error', reject);
    request.setTimeout(2000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
  try {
    await ping();
    console.log(`API ready at ${API_HEALTH_URL}`);
    break;
  } catch {
    if (attempt === MAX_ATTEMPTS) {
      console.error(
        `API not reachable at ${API_HEALTH_URL} after ${MAX_ATTEMPTS} attempts`,
      );
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
  }
}
