const http = require('http');
const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist3');
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  let filePath = path.join(dist, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath)) filePath = path.join(dist, 'index.html');
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(3001, () => console.log('Serving dist3 at http://localhost:3001'));
