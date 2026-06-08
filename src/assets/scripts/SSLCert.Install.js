const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const sslPath = path.join(__dirname, '../../../ssl');
const certPath = path.join(sslPath, 'server.crt');
const keyPath = path.join(sslPath, 'server.key');

if (!fs.existsSync(sslPath)) {
  fs.mkdirSync(sslPath, { recursive: true });
}

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  try {
    console.log('Installing SSL certificates for local development...');
    execSync('npx office-addin-dev-certs install --machine', { stdio: 'inherit' });
    console.log('SSL certificates installed successfully.');
  } catch (error) {
    console.error('Failed to install SSL certificates:', error);
  }
}
