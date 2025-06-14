/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as IOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import handleChat from './handleChat';
import { User } from '../modules/user/user.model';
import AppError from '../error/appError';
import httpStatus from 'http-status';
import { emitError } from './helper';
let io: IOServer;
export const onlineUser = new Set();
const initializeSocket = (server: HTTPServer) => {
  if (!io) {
    io = new IOServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });
    // io.on('ping', (data) => {
    //   io.emit('pong', data);
    // });
    io.on('connection', async (socket: Socket) => {
      const userId = socket.handshake.query.id as string;
      if (!userId) {
        return;
      }
      // const token = socket.handshake.headers['authorization'];
      // if (!token) {
      //   emitError(socket, {
      //     code: 400,
      //     message: 'Unauthorized access',
      //     type: 'general',
      //     details: 'You are not authorized , becasue your account not found',
      //   });
      // }
      // let decoded;

      // try {
      //   decoded = jwt.verify(
      //     token as string,
      //     config.jwt_access_secret as string,
      //   ) as JwtPayload;
      // } catch (err) {
      //   emitError(socket, {
      //     code: 400,
      //     message: 'Unauthorized access',
      //     type: 'general',
      //     details: 'You are not authorized , becasue your account not found',
      //   });
      //   return;
      // }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars

      // if (!decoded) {
      //   emitError(socket, {
      //     code: 400,
      //     message: 'Unauthorized access',
      //     type: 'general',
      //     details: 'Token is expired',
      //   });
      //   return;
      // }
      // const { id } = decoded;

      const currentUser = await User.findById(userId);
      // const currentUser = await User.findById(id);
      if (!currentUser) {
        emitError(socket, {
          code: 400,
          message: 'Unauthorized access',
          type: 'general',
          details: 'You are not authorized , becasue your account not found',
        });
      }
      const currentUserId = currentUser?._id.toString();
      console.log('curretn user id', currentUserId);
      // create a room-------------------------
      socket.join(currentUserId as string);
      // set online user
      onlineUser.add(currentUserId);
      // send to the client
      io.emit('onlineUser', Array.from(onlineUser));

      // handle chat -------------------
      await handleChat(io, socket, currentUserId as string);

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        onlineUser.delete(currentUserId);
        io.emit('onlineUser', Array.from(onlineUser));
      });
    });
  }
  return io;
};

const getIO = () => {
  if (!io) {
    throw new AppError(
      httpStatus.CONFLICT,
      'Socket.io is not initialized. Call initializeSocket first.',
    );
  }
  return io;
};

export { initializeSocket, getIO };
