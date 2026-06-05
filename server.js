const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = 8888;
const types = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
};

http.createServer((req, res) => {
  const requestedPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  const filePath = path.join(__dirname, requestedPath);
  const fallbackPath = path.join(__dirname, 'index.html');
  const responsePath = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : fallbackPath;

  res.setHeader('content-type', types[path.extname(responsePath)] || 'text/plain');
  fs.createReadStream(responsePath).pipe(res);
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
