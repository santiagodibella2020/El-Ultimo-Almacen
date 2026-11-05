// Servidor del modo cooperativo: un relé WebSocket mínimo (sin dependencias).
// El anfitrión lo abre desde el juego; los dos juegos se conectan y cada mensaje de uno le llega al otro.
const http = require('http'), crypto = require('crypto'), os = require('os');
let srv = null, port0 = 27015;
const clients = new Set();

function frame(buf, op = 1) {
  const n = buf.length; let h;
  if (n < 126) h = Buffer.from([0x80 | op, n]);
  else if (n < 65536) { h = Buffer.alloc(4); h[0] = 0x80 | op; h[1] = 126; h.writeUInt16BE(n, 2); }
  else { h = Buffer.alloc(10); h[0] = 0x80 | op; h[1] = 127; h.writeBigUInt64BE(BigInt(n), 2); }
  return Buffer.concat([h, buf]);
}
function send(c, buf) { try { c.sock.write(frame(buf, 1)); } catch (e) {} }
function others(c, buf) { for (const o of clients) if (o !== c) send(o, buf); }
function parse(c) {
  for (;;) {
    const b = c.buf; if (b.length < 2) return;
    const fin = b[0] & 0x80, op = b[0] & 15, masked = b[1] & 0x80; let n = b[1] & 127, o = 2;
    if (n === 126) { if (b.length < 4) return; n = b.readUInt16BE(2); o = 4; }
    else if (n === 127) { if (b.length < 10) return; n = Number(b.readBigUInt64BE(2)); o = 10; }
    const mo = o; if (masked) o += 4; if (b.length < o + n) return;
    let p = Buffer.from(b.subarray(o, o + n));
    if (masked) { const m = b.subarray(mo, mo + 4); for (let i = 0; i < p.length; i++) p[i] ^= m[i & 3]; }
    c.buf = b.subarray(o + n);
    if (op === 8) { try { c.sock.write(frame(Buffer.alloc(0), 8)); } catch (e) {} c.sock.destroy(); return; }
    if (op === 9) { try { c.sock.write(frame(p, 10)); } catch (e) {} continue; }
    if (op === 10) continue;
    c.frag.push(p); if (!fin) continue;
    const msg = Buffer.concat(c.frag); c.frag = []; others(c, msg);
  }
}
function info() {
  const ips = [];
  for (const l of Object.values(os.networkInterfaces())) for (const a of l || []) if (a.family === 'IPv4' && !a.internal) ips.push(a.address);
  return { port: port0, ips };
}
function start(port) {
  if (port) port0 = port;
  if (srv) return Promise.resolve(info());
  return new Promise((res, rej) => {
    const s = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'text/plain' }); r.end('El Ultimo Almacen - cooperativo'); });
    s.on('upgrade', (req, sock) => {
      const key = req.headers['sec-websocket-key'];
      if (!key || clients.size >= 2) { sock.destroy(); return; }
      const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
      sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
      sock.setNoDelay(true);
      const c = { sock, buf: Buffer.alloc(0), frag: [] }; clients.add(c);
      others(c, Buffer.from('{"t":"join"}'));
      sock.on('data', d => { c.buf = Buffer.concat([c.buf, d]); try { parse(c); } catch (e) { sock.destroy(); } });
      const bye = () => { if (!clients.delete(c)) return; others(c, Buffer.from('{"t":"bye"}')); };
      sock.on('close', bye); sock.on('error', bye);
    });
    s.on('error', e => { rej(e); });
    s.listen(port0, '0.0.0.0', () => { srv = s; res(info()); });
  });
}
function stop() { if (!srv) return; for (const c of clients) c.sock.destroy(); clients.clear(); srv.close(); srv = null; }
module.exports = { start, stop, info };
