import fsPromises from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { HTTPStatusCode } from '../types/http.js';

export const httpServer = http.createServer(async (req, res) => {
  const __dirname = path.resolve(path.dirname(''));
  const filePath = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);

  try {
    const data = await fsPromises.readFile(filePath);
    res.writeHead(HTTPStatusCode.OK);
    res.end(data);
  } catch (err) {
    res.writeHead(HTTPStatusCode.NotFound);
    res.end(JSON.stringify(err));
  }
});
