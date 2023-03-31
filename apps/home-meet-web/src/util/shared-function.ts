import io, { Socket } from 'socket.io-client';
import { IMeeting, ViewersPeerConnections } from './interfaces';

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

export const stopTrack = ({
  type,
  stream,
}: {
  type: 'video' | 'audio';
  stream: MediaStream;
}) => {
  if (type === 'video') {
    const videoTrack = stream.getVideoTracks()[0];
    videoTrack.stop();
  } else {
    const audioTrack = stream.getAudioTracks()[0];
    audioTrack.stop();
  }
};

export const replaceWithNewTrack = async ({
  type,
  stream,
  peerConnections,
  deviceId,
  selectedDeviceId,
}: {
  type: 'video' | 'audio';
  stream: MediaStream;
  peerConnections: ViewersPeerConnections;
  deviceId: string;
  selectedDeviceId?: string;
}) => {
  if (selectedDeviceId) {
    stopTrack({ type, stream });
  }

  const newStream = await getNewStream({ type, deviceId });
  replaceTrack({ type, stream: newStream!, peerConnections });
  return newStream;
};

export const getNewStream = async ({
  type,
  deviceId,
}: {
  type: 'video' | 'audio';
  deviceId: string;
}) => {
  try {
    if (type === 'video') {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
      });
      return newStream;
    }
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });
    return newStream;
  } catch (error) {
    console.log(error);
  }
};

export const replaceTrack = ({
  type,
  stream,
  peerConnections,
}: {
  type: 'video' | 'audio';
  stream: MediaStream;
  peerConnections: ViewersPeerConnections;
}) => {
  const track =
    type === 'video' ? stream.getVideoTracks()[0] : stream.getAudioTracks()[0];
  Object.keys(peerConnections).forEach((viewerId) => {
    peerConnections[viewerId]
      ?.getSenders()
      .find((s) => s.track?.kind === type)
      ?.replaceTrack(track);
  });
};

export const toggleAudioStreamMuteStatus = ({
  stream,
}: {
  stream?: MediaStream;
}) => {
  if (stream) {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};
