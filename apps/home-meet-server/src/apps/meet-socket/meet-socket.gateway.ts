import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MeetSocketService } from './meet-socket.service';
import {
  EXCHANGE_ICE_CANDIDATES,
  INCOMING_ANSWER,
  INCOMING_CANDIDATE,
  INCOMING_OFFER,
  JOIN_AS_BROADCASTER,
  JOIN_AS_VIEWER,
  NEW_ANSWER,
  NEW_OFFER,
  NEW_VIEWER_JOINED,
} from './meet-socket.constants';

type RoomBroadcasters = {
  [key: string]: string;
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MeetSocketGateway {
  constructor(private readonly meetSocketService: MeetSocketService) {
    this.rooms = {};
  }

  private logger: Logger = new Logger(MeetSocketGateway.name);
  private rooms: RoomBroadcasters;

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket): Promise<any> {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<any> {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, room: string): Promise<any> {
    this.logger.log(`Client ${client.id} joined room ${room}`);

    client.join(room);
    console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage(JOIN_AS_BROADCASTER)
  async handleJoinAsBroadcaster(
    client: Socket,
    {
      broadcasterId,
      roomId,
    }: {
      broadcasterId: string;
      roomId: string;
    },
  ): Promise<any> {
    client.join(roomId);
    client.join(broadcasterId);
    this.rooms[roomId] = broadcasterId; // Refactor to make sure only broadcaster can join
  }

  @SubscribeMessage(JOIN_AS_VIEWER)
  async handleJoinAsViewer(
    client: Socket,
    {
      roomId,
      viewerData,
    }: {
      roomId: string;
      viewerData: {
        name: string;
        pic: string;
        viewerId: string;
        socketId: string;
      };
    },
  ): Promise<any> {
    client.join(roomId);
    const broadcasterId = this.rooms[roomId];
    if (broadcasterId) {
      this.server.to(broadcasterId).emit(NEW_VIEWER_JOINED, viewerData);
    }
  }

  @SubscribeMessage(NEW_OFFER)
  async handleCall(
    client: Socket,
    {
      roomId,
      data,
    }: {
      roomId: string;
      data: {
        offer: any;
        viewerId: string;
      };
    },
  ): Promise<any> {
    this.logger.log(
      `Client ${client.id} offered to room ${roomId} to viewer ${data.viewerId}`,
    );
    this.server.to(data.viewerId).emit(INCOMING_OFFER, data);
    // console.log(this.server.sockets.adapter.rooms);
  }

  @SubscribeMessage(NEW_ANSWER)
  async handleAnswer(
    client: Socket,
    {
      data,
      roomId,
    }: {
      roomId: string;
      data: {
        answer: any;
        viewerId: string;
      };
    },
  ): Promise<any> {
    const broadcasterId = this.rooms[roomId];
    if (broadcasterId) {
      this.logger.log(`Client ${client.id} answered to room ${roomId}`);
      this.server.to(broadcasterId).emit(INCOMING_ANSWER, data);
    }
  }

  @SubscribeMessage(EXCHANGE_ICE_CANDIDATES)
  async handleIceCandidate(
    client: Socket,
    {
      roomId,
      candidate,
      userId,
    }: { roomId: string; candidate: any; userId: string },
  ): Promise<any> {
    this.logger.log(`Client ${client.id} ice-candidate ${roomId}`);
    console.log('ice-candidate', candidate);
    this.server.to(userId).emit(INCOMING_CANDIDATE, candidate);
  }

  // async handleJoinInstanceRoom(client: Socket, room: string) {
  //   const roomExists = !this.rooms.find((r) => r.roomName === room);
  //   if (!roomExists) {
  //     this.rooms.push({ roomName: room, members: [client.id] });
  //     return;
  //   }
  //   this.rooms = this.rooms.map((r) => {
  //     if (r.roomName === room) {
  //       r.members.push(client.id);
  //     }
  //     return r;
  //   });

  //   this.logger.log(`Client ${client.id} joined room`);

  //   console.log(this.server.sockets.adapter.rooms);
  // }

  // async handleLeaveInstanceRoom(client: Socket) {
  //   const tempRooms: RoomAndMembersType[] = [];
  //   this.rooms.forEach((r) => {
  //     client.leave(r.roomName);
  //     const members = r.members.filter((m) => m !== client.id);
  //     if (members.length > 0) {
  //       tempRooms.push({ roomName: r.roomName, members });
  //     }
  //   });

  //   this.rooms = tempRooms;
  //   this.logger.log(`Client ${client.id} left room`);
  // }
}
