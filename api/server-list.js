import { writeServerListChunks, writeServerListShell } from '../server.js';

export default async function handler(req, res) {
  res.status(200);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.flushHeaders?.();

  writeServerListShell(res);
  await writeServerListChunks(res);
  res.end();
}
