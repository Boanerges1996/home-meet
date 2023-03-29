import io, { Socket } from 'socket.io-client';
import { IMeeting } from './interfaces';

export const hasMetAllRequirements = ({
  hasSetViewerPeerConnection,
  meet,
  meetId,
  socket,
  isHost,
}: {
  isHost?: boolean;
  meetId: string;
  meet: IMeeting | null;
  socket: Socket;
  hasSetViewerPeerConnection: boolean;
}) => {
  return (
    isHost !== null &&
    !isHost &&
    meetId &&
    meet &&
    socket &&
    !hasSetViewerPeerConnection
  );
};
