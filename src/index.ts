import { httpServer } from './http_server/index.js';
import './ws-server.js';
import { FRONTEND_HTTP_PORT } from './constants/index.js';

console.log(`Starting static HTTP server on the ${FRONTEND_HTTP_PORT} port`);
httpServer.listen(FRONTEND_HTTP_PORT);
