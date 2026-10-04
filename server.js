require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const http = require('node:http');
const { connectHccSmsDB, getHccSmsDB } = require('./config/db');
const { createApp } = require('./app');

async function start() {
  if (!process.env.HCC_SMS_JWT_SECRET || process.env.HCC_SMS_JWT_SECRET === 'replace-with-a-long-random-secret') {
    throw new Error('Set HCC_SMS_JWT_SECRET in server/.env before starting the server.');
  }
  await connectHccSmsDB();
  const server = http.createServer(createApp());
  server.keepAliveTimeout = 120000;
  server.headersTimeout = 120000;
  const port = Number(process.env.PORT || 5000);
  const host = process.env.HOST || '0.0.0.0';
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  console.log(`HCC SMS server running at http://${host}:${port}/hcc-sms`);
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    const timeout = setTimeout(() => process.exit(1), 10000);
    timeout.unref();
    server.close(async () => {
      try {
        await getHccSmsDB().close();
        clearTimeout(timeout);
        process.exit(0);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
    });
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
  return server;
}

if (require.main === module) {
  start().catch(async error => {
    console.error(`SMS startup failed: ${error.message}`);
    try { await getHccSmsDB().close(); } catch { /* No open connection. */ }
    process.exit(1);
  });
}

module.exports = { start };
