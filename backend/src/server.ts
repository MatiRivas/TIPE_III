import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './core/config';
import { setIO } from './core/socket';
import productsRouter from './modules/products/products.router';
import { ensureProtectedAdminAccount } from './modules/users/users.service';

app.use('/api/products', productsRouter);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

setIO(io);

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  socket.on('disconnect', () => console.log('Cliente desconectado:', socket.id));
});

const startServer = () => {
  const basePort = Number(config.port);
  let listeningLogged = false;

  server.on('listening', () => {
    if (listeningLogged) return;
    listeningLogged = true;
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : basePort;
    console.log(`Servidor corriendo en http://localhost:${port}`);
  });

  const startListening = (port: number) => {
    server
      .once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE' && port === basePort) {
          const fallbackPort = basePort + 1;
          console.warn(`Puerto ${basePort} en uso. Levantando servidor en ${fallbackPort}...`);
          startListening(fallbackPort);
          return;
        }
        throw err;
      })
      .listen(port);
  };

  startListening(basePort);
};

const seedProtectedAdmin = async () => {
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      await ensureProtectedAdminAccount();
      return;
    } catch (err) {
      console.error(`No se pudo asegurar la cuenta admin protegida (intento ${attempt}/10).`, err);
      if (attempt < 10) {
        await wait(2000);
      }
    }
  }

  console.warn('La cuenta admin protegida no pudo crearse en este arranque, pero el servidor sigue activo.');
};

startServer();
void seedProtectedAdmin();
