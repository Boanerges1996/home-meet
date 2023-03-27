import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocksService } from './socks.service';

@WebSocketGateway(5002, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*',
  },
  path: '/webrtc/api',
})
export class SocksGateway {
  constructor(private readonly socksService: SocksService) {}

  private users: string[] = [];

  private logger: Logger = new Logger(SocksGateway.name);

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket): Promise<any> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async handleLeaveRoom(client: Socket, room: string): Promise<any> {
    this.logger.log(`Client ${client.id} left room ${room}`);
    client.leave(room);
  }

  @SubscribeMessage('get-users')
  async handleGetUsers(client: Socket, room: string): Promise<any> {
    this.logger.log(`Client ${client.id} requested users in room ${room}`);

    client.emit('all-users', this.users);
  }

  @SubscribeMessage('add-username')
  async handleAddUsername(client: Socket, username: string): Promise<any> {
    this.logger.log(`Client ${client.id} added username ${username}`);

    if (
      this.users
        .map((name) => name.toLocaleLowerCase())
        .includes(username.toLowerCase())
    ) {
      client.emit('username-taken');
      return;
    }
    client.join(username);

    this.users.push(username);
    this.server.emit('added-user', username);
    console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, room: string): Promise<any> {
    this.logger.log(`Client ${client.id} joined room ${room}`);
    client.join(room);
  }

  @SubscribeMessage('call')
  async handleCall(client: Socket, data: any): Promise<any> {
    this.logger.log(`Client ${client.id} called ${data.to}`);
    this.server.to(data.callee).emit('incoming-call', data);
    console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, data: any): Promise<any> {
    // this.logger.log(`Client ${client.id} answered ${data.caller}`);
    this.server.to(data.caller).emit('incoming-answer', data);
  }

  @SubscribeMessage('sdp-exchanged')
  async handleSdpEchanged(client: Socket, data: any): Promise<any> {
    this.server.to(data.callee).emit('sdp-exchanged', data);
  }

  @SubscribeMessage('exchange-ice-candidates')
  async handleIceCandidate(client: Socket, data: any): Promise<any> {
    this.logger.log(`Client ${client.id} ice-candidate ${data.to}`);
    console.log('ice-candidate', data);
    this.server.to(data.to).emit('incoming-candidate', data);
  }
}
