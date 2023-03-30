import {
  EXCHANGE_ICE_CANDIDATES,
  INCOMING_ANSWER,
  INCOMING_CANDIDATE,
  JOIN_AS_BROADCASTER,
  NEW_OFFER,
  NEW_VIEWER_JOINED,
} from '@/common';
import {
  ChatType,
  IMeeting,
  IUser,
  logConnectionState,
  ViewersDataChannels,
  ViewersPeerConnections,
} from '@/util';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useSocket } from './socket';
type BroadcasterProps = {
  isHost: boolean | null;
  meetId: string | null;
  meet: IMeeting | null;
};
export const useBroadcaster = ({ isHost, meetId, meet }: BroadcasterProps) => {
  const viewersPeerConnections = useRef<ViewersPeerConnections>({});
  const viewersDataChannels = useRef<ViewersDataChannels>({});
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [viewers, setViewers] = useState<IUser[]>([]);
  const [chat, setChat] = useState<ChatType[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null
  );
  const [broadcasterMediaStream, setBroadcasterMediaStream] =
    useState<MediaStream>();
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);
  const [socket] = useSocket();
  const hasMetHostRequirements = Boolean(socket && isHost && meetId && meet);

  useEffect(() => {
    (async () => {
      if (hasMetHostRequirements && !hasStartedStreaming) {
        let stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        const audioDevices = devices.filter(
          (device) => device.kind === 'audioinput'
        );

        setAudioDevices(audioDevices);
        setVideoDevices(videoDevices);
        setSelectedAudioDevice(audioDevices[0].deviceId);
        setSelectedVideoDevice(videoDevices[0].deviceId);

        setBroadcasterMediaStream(stream);
        setHasStartedStreaming(true);

        socket?.emit(JOIN_AS_BROADCASTER, {
          broadcasterId: meet?.creator._id,
          roomId: meetId,
        });

        socket?.on(
          NEW_VIEWER_JOINED,
          async (data: {
            name: string;
            pic: string;
            viewerId: string;
            socketId: string;
          }) => {
            const newViewer = {
              name: data.name,
              pic: data.pic,
              _id: data.viewerId,
            };

            setViewers((prev) => [...prev, newViewer]);
            viewersPeerConnections.current[data.viewerId] =
              new RTCPeerConnection({
                iceServers: [
                  {
                    urls: 'stun:stun.l.google.com:19302',
                  },
                ],
              });

            viewersPeerConnections.current[data.viewerId].createDataChannel(
              'chat',
              {
                ordered: false,
                maxPacketLifeTime: 3000,
              }
            );

            viewersPeerConnections.current[data.viewerId].ondatachannel = (
              event
            ) => {
              const dataChannel = event.channel;

              viewersDataChannels.current[data.viewerId] = dataChannel;

              dataChannel.onopen = () => {
                console.log('data channel opened');
              };

              dataChannel.onmessage = (event) => {
                setChat((prev) => [
                  ...prev,
                  JSON.parse(event.data) as ChatType,
                ]);
              };

              dataChannel.onclose = () => {
                console.log('data channel closed');
              };
            };

            viewersPeerConnections.current[data.viewerId].onicecandidate = (
              event
            ) => {
              if (event.candidate) {
                // Send ice candidates to viewer
                socket.emit(EXCHANGE_ICE_CANDIDATES, {
                  candidate: event.candidate,
                  userId: data.viewerId,
                  broadcasterId: meet?.creator._id,
                  roomId: meetId,
                });
              }
            };

            viewersPeerConnections.current[
              data.viewerId
            ].onconnectionstatechange = (event) => {
              logConnectionState({
                state:
                  viewersPeerConnections.current[data.viewerId].connectionState,
                viewerName: data.name ?? '',
              });
            };

            // Add tracks to stream
            stream.getTracks().forEach((track) => {
              viewersPeerConnections.current[data.viewerId].addTrack(
                track,
                stream
              );
            });

            // Create offer
            const offer = await viewersPeerConnections.current[
              data.viewerId
            ].createOffer();

            // Set local description
            await viewersPeerConnections.current[
              data.viewerId
            ].setLocalDescription(offer);

            // Send offer to viewer
            socket.emit(NEW_OFFER, {
              roomId: meetId,
              data: {
                offer,
                viewerId: data.viewerId,
              },
            });
          }
        );

        socket?.on(
          INCOMING_ANSWER,
          (data: { answer: any; viewerId: string }) => {
            viewersPeerConnections.current[data.viewerId].setRemoteDescription(
              data.answer
            );
          }
        );

        socket?.on(
          INCOMING_CANDIDATE,
          async ({ candidate, userId }: { candidate: any; userId: string }) => {
            await viewersPeerConnections.current[userId]?.addIceCandidate(
              candidate
            );
          }
        );
      }
    })();
  }, [
    socket,
    isHost,
    meetId,
    meet,
    hasMetHostRequirements,
    hasStartedStreaming,
  ]);

  return {
    videoDevices,
    audioDevices,
    selectedVideoDevice,
    selectedAudioDevice,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    viewers,
    chat,
    broadcasterMediaStream,
    viewersPeerConnections,
    viewersDataChannels,
  };
};

useBroadcaster.displayName = 'useBroadcaster';
