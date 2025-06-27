const http = require('http');
const server = http.createServer((req, res) => {
  res.end('OK');
});

server.listen(5000, '127.0.0.1', () => {
  console.log('Test server running on http://127.0.0.1:5000');
});
