import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

export const initSocket = (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('A user connected:', socket.id);

        // Join a room based on userId for targeted notifications
        socket.on('join', (userId: string) => {
            if (userId) {
                socket.join(userId);
                console.log(`User ${userId} joined their notification room`);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

/**
 * Send a notification to a specific user
 * @param userId The ID of the user to notify
 * @param message The message to send
 * @param data Optional extra data
 */
export const notifyUser = (userId: string, message: string, data?: any) => {
    if (io) {
        io.to(userId).emit('notification', {
            message,
            data,
            timestamp: new Date()
        });
    }
};
