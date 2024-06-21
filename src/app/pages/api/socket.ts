import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createClient } from 'redis';

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server);

    io.on('connection', (socket) => {
      console.log('New client connected');

      socket.on('video-control', (data) => {
        socket.broadcast.emit('video-control', data);
        redisClient.set('videoState', JSON.stringify(data)).catch(console.error);
      });

      redisClient.get('videoState')
        .then((videoState) => {
          if (videoState) {
            socket.emit('video-control', JSON.parse(videoState));
          }
        })
        .catch(console.error);

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
