import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startServer(name, command, args, cwd) {
  console.log(`Starting ${name}...`);
  const proc = spawn(command, args, { cwd, stdio: 'pipe' });
  
  proc.stdout.on('data', (data) => {
    console.log(`[${name}] ${data}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`[${name}] ${data}`);
  });
  
  proc.on('close', (code) => {
    console.log(`${name} process exited with code ${code}`);
  });
  
  return proc;
}

const servers = [
  {
    name: 'Proxy Server',
    command: 'node',
    args: ['proxy_server.mjs'],
    cwd: __dirname
  },
  {
    name: 'App Server',
    command: 'node',
    args: ['app.mjs'],
    cwd: __dirname
  },
  {
    name: 'Live Server',
    command: 'npx',
    args: ['live-server', '--port=5500', '--no-browser'],
    cwd: __dirname
  }
];

const processes = servers.map(server => startServer(server.name, server.command, server.args, server.cwd));

process.on('SIGINT', () => {
  console.log('Shutting down all servers...');
  processes.forEach(proc => proc.kill());
  process.exit();
});