// A port nothing listens on, for a server another process starts.
import { createServer } from 'node:net';

/**
 * Binds port 0 on `host`, reads the port the OS gave and frees it. The port can be taken again
 * before the caller's server binds it, so that server must fail on a taken port, not share it.
 */
export function freePort(host = '127.0.0.1') {
  return new Promise((found, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, host, () => {
      const { port } = server.address();
      server.close(() => found(port));
    });
  });
}
