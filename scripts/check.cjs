const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  if (entry.name === 'node_modules') return [];
  const file = path.join(dir, entry.name);
  return entry.isDirectory() ? walk(file) : [file];
});
for (const file of walk(root).filter(file => /\.(js|cjs)$/.test(file))) {
  const syntax = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(syntax.status, 0, syntax.stderr);
  const source = fs.readFileSync(file, 'utf8');
  for (const [, specifier] of source.matchAll(/require\(['"]([^'"]+)['"]\)/g)) {
    const resolved = require.resolve(specifier, { paths: [path.dirname(file)] });
    if (specifier.startsWith('.')) assert.ok(resolved.startsWith(root + path.sep), `Import leaves standalone server: ${file}`);
  }
}

// Register real Mongoose schemas on a disconnected connection. No database or
// external email service is contacted; this verifies the extracted app wiring.
const mongoose = require('mongoose');
const connection = mongoose.createConnection();
require('../config/db').getHccSmsDB = () => connection;
require('nodemailer').createTransport = () => ({ verify: callback => callback(null, true) });
const { createApp } = require('../app');
async function check() {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const endpoint of ['/hcc-sms/api/health', '/api/health']) {
      const response = await fetch(base + endpoint);
      assert.equal(response.status, 200);
      const body = await response.json();
      assert.equal(body.mountedRoutes, 25);
      assert.equal(body.failedRouteMounts, 0);
    }
    const cors = await fetch(base + '/hcc-sms/api/health', { headers: { Origin: 'http://localhost:5173' } });
    assert.equal(cors.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal((await fetch(base + '/missing')).status, 404);
    console.log('PASS: syntax, standalone imports, 25 route mounts, health endpoints, CORS and 404 handling. No live database accessed.');
  } finally {
    await new Promise(resolve => server.close(resolve));
    await connection.close();
  }
}
check().catch(error => { console.error(error); process.exitCode = 1; });
