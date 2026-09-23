import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { SOCKET_EVENTS } from '@saas/shared';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.replace('Bearer ', '') as string);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token, disconnecting`);
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>(
        'JWT_SECRET',
        'super-secret-jwt-key-replace-in-production',
      );

      const payload = this.jwtService.verify(token, { secret });
      const userId = payload.sub;

      client.data.userId = userId;
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected and joined room user:${userId}`);
    } catch (error: any) {
      this.logger.warn(`Socket authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  emitUserSuspended(userId: string) {
    this.logger.log(`Emitting user:suspended to user:${userId}`);
    this.server.to(`user:${userId}`).emit(SOCKET_EVENTS.USER_SUSPENDED, {
      userId,
      message: 'Your account has been suspended by an administrator.',
    });
  }
}
