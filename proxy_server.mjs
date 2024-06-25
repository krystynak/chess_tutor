import httpProxy from 'http-proxy';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const proxy = httpProxy.createProxyServer();

http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    proxy.web(req, res, { target: 'http://localhost:3000' });
  } else if (req.url === '/favicon.ico') {
    const faviconPath = path.join(__dirname, '/img/favicon.ico');
    fs.readFile(faviconPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {'Content-Type': 'image/x-icon'});
      res.end(data);
    });
  } else {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  }
}).listen(5500);

console.log('Proxy server running on http://localhost:5500');