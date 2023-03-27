import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MeetSocketService } from './meet-socket.service';

type RoomAndMembersType = {
  roomName: string;
  members: string[];
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MeetSocketGateway {
  constructor(private readonly meetSocketService: MeetSocketService) {
    this.rooms = [];
  }

  private logger: Logger = new Logger(MeetSocketGateway.name);
  private rooms: RoomAndMembersType[];

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket): Promise<any> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.handleLeaveInstanceRoom(client);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, room: string): Promise<any> {
    this.logger.log(`Client ${client.id} joined room ${room}`);
    this.handleJoinInstanceRoom(client, room);
    client.join(room);
    console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('offer')
  async handleCall(
    client: Socket,
    { roomId, data }: { roomId: string; data: any },
  ): Promise<any> {
    this.logger.log(`Client ${client.id} offer for room ${roomId}`);
    this.server.to(roomId).emit('incoming-offer', data);
    console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage('answer')
  async handleAnswer(
    client: Socket,
    { data, roomId }: { roomId: string; data: any },
  ): Promise<any> {
    this.logger.log(`Client ${client.id} answered to room ${roomId}`);
    this.server.to(roomId).emit('incoming-answer', data);
  }

  @SubscribeMessage('exchange-ice-candidates')
  async handleIceCandidate(
    client: Socket,
    { roomId, data }: { roomId: string; data: any },
  ): Promise<any> {
    this.logger.log(`Client ${client.id} ice-candidate ${roomId}`);
    console.log('ice-candidate', data);
    this.server.to(roomId).emit('incoming-candidate', data);
  }

  async handleJoinInstanceRoom(client: Socket, room: string) {
    const roomExists = !this.rooms.find((r) => r.roomName === room);
    if (!roomExists) {
      this.rooms.push({ roomName: room, members: [client.id] });
      return;
    }
    this.rooms = this.rooms.map((r) => {
      if (r.roomName === room) {
        r.members.push(client.id);
      }
      return r;
    });

    this.logger.log(`Client ${client.id} joined room`);

    console.log(this.server.sockets.adapter.rooms);
  }

  async handleLeaveInstanceRoom(client: Socket) {
    const tempRooms: RoomAndMembersType[] = [];
    this.rooms.forEach((r) => {
      client.leave(r.roomName);
      const members = r.members.filter((m) => m !== client.id);
      if (members.length > 0) {
        tempRooms.push({ roomName: r.roomName, members });
      }
    });

    this.rooms = tempRooms;
    this.logger.log(`Client ${client.id} left room`);
  }
}
