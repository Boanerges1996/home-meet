import {
  EXCHANGE_ICE_CANDIDATES,
  INCOMING_ANSWER,
  INCOMING_CANDIDATE,
  JOIN_AS_BROADCASTER,
  JOIN_AS_VIEWER,
  NEW_OFFER,
  NEW_VIEWER_JOINED,
} from '@/common';
import { useMediaStream, useMeetData, useSocket } from '@/hooks';
import useViewerPeerConnection from '@/hooks/meet';
import { AppContext } from '@/providers';
import {
  ChatType,
  IUser,
  logConnectionState,
  StyleProps,
  ViewersDataChannels,
  ViewersPeerConnections,
  replaceWithNewTrack,
  toggleAudioStreamMuteStatus,
  IJoinedUser,
} from '@/util';
import { Col, notification, Row } from 'antd';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { MeetChats, MeetControls, MeetVideo, MeetViewers } from '.';

export type MeetMainComponentProps = StyleProps & {};

export function MeetMain() {
  const { meetId } = useRouter().query;
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [viewers, setViewers] = useState<IUser[]>([]);
  const [chat, setChat] = useState<ChatType[]>([]);
  const [
    viewerPeerConnectionToBroadcaster,
    setViewerPeerConnectionToBroadcaster,
  ] = useState<RTCPeerConnection>();
  const [viewerDataChannelToBroadcaster, setViewerDataChannelToBroadcaster] =
    useState<RTCDataChannel>();
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);
  const [hasSetViewerPeerConnection, setHasSetViewerPeerConnection] =
    useState<boolean>(false);
  const viewersPeerConnections = useRef<ViewersPeerConnections>({});
  const viewersDataChannels = useRef<ViewersDataChannels>({});
  const broadcasterVideoRef = useRef<HTMLVideoElement | null>(null);

  const { profile, isLogged } = useContext(AppContext);
  const router = useRouter();
  const { meet } = useMeetData(meetId as string | undefined);
  const [socket] = useSocket();
  const {
    mediaStream,
    audioDevices,
    selectedAudioDevice,
    selectedVideoDevice,
    setMediaStream,
    setSelectedVideoDevice,
    setSelectedAudioDevice,
    videoDevices,
  } = useMediaStream({
    isHost,
    meet,
    socket,
    meetId: meetId as string,
  });

  if ((isLogged !== null || isLogged !== undefined) && !isLogged) {
    router.push('/login');
  }

  useEffect(() => {
    if (meet && profile._id) {
      const isBroadcaster = profile._id === meet.creator._id;
      setIsHost(isBroadcaster);
    }
  }, [meet, profile._id]);

  const hasMetViewerRequirements =
    isHost !== null &&
    !isHost &&
    meetId &&
    meet &&
    socket &&
    !hasSetViewerPeerConnection;
  const hasMetHostRequirements = isHost && meetId && meet && socket;

  useEffect(() => {
    (async () => {
      if (hasMetHostRequirements && !hasStartedStreaming && mediaStream) {
        setHasStartedStreaming(true);

        socket.emit(JOIN_AS_BROADCASTER, {
          broadcasterId: meet.creator._id,
          roomId: meetId,
        });

        socket.on(NEW_VIEWER_JOINED, async (data: IJoinedUser) => {
          const newViewer = {
            name: data.name,
            pic: data.pic,
            _id: data.viewerId,
          };

          setViewers((prev) => [...prev, newViewer]);
          viewersPeerConnections.current[data.viewerId] = new RTCPeerConnection(
            {
              iceServers: [
                {
                  urls: 'stun:stun.l.google.com:19302',
                },
              ],
            }
          );

          const peerConnection = viewersPeerConnections.current[data.viewerId];

          peerConnection.createDataChannel('chat', {
            ordered: false,
            maxPacketLifeTime: 3000,
          });

          peerConnection.ondatachannel = (event) => {
            const dataChannel = event.channel;
            viewersDataChannels.current[data.viewerId] = dataChannel;

            dataChannel.onopen = () => {
              console.log('data channel opened');
            };
            dataChannel.onmessage = (event) => {
              setChat((prev) => [...prev, JSON.parse(event.data) as ChatType]);
            };
            dataChannel.onclose = () => {
              console.log('data channel closed');
            };
          };

          peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
              // Send ice candidates to viewer
              socket.emit(EXCHANGE_ICE_CANDIDATES, {
                candidate: event.candidate,
                userId: data.viewerId,
                broadcasterId: meet.creator._id,
                roomId: meetId,
              });
            }
          };

          peerConnection.onconnectionstatechange = (event) => {
            const connectionState = peerConnection.connectionState;
            if (connectionState === 'failed') {
              setViewers((prev) =>
                prev.filter((viewer) => viewer._id !== data.viewerId)
              );
            }
            logConnectionState({
              state: connectionState,
              viewerName: data.name ?? '',
            });
          };

          mediaStream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, mediaStream);
          });

          const offer = await peerConnection.createOffer();

          await peerConnection.setLocalDescription(offer);

          socket.emit(NEW_OFFER, {
            roomId: meetId,
            data: {
              offer,
              viewerId: data.viewerId,
            },
          });
        });

        socket.on(
          INCOMING_ANSWER,
          (data: { answer: RTCSessionDescription; viewerId: string }) => {
            viewersPeerConnections.current[data.viewerId].setRemoteDescription(
              data.answer
            );
          }
        );

        socket.on(
          INCOMING_CANDIDATE,
          async ({
            candidate,
            userId,
          }: {
            candidate: RTCIceCandidateInit;
            userId: string;
          }) => {
            await viewersPeerConnections.current[userId]?.addIceCandidate(
              candidate
            );
          }
        );
      } else if (hasMetViewerRequirements) {
        socket.emit(
          JOIN_AS_VIEWER,
          {
            roomId: meetId,
            viewerData: {
              viewerId: profile._id,
              name: profile.name,
              pic: profile.pic,
            },
          },
          async (data: { success: boolean }) => {
            if (data.success) {
              const viewerPeerConnection = new RTCPeerConnection({
                iceServers: [
                  {
                    urls: 'stun:stun.l.google.com:19302',
                  },
                ],
              });

              // this is used by the sender to send data to the receiver
              let sendChannel = viewerPeerConnection.createDataChannel(
                'chat',
                {}
              );

              sendChannel.onopen = () => {
                console.log('data channel opened');
              };

              sendChannel.onmessage = (event) => {
                console.log('data channel message', event.data);
              };

              sendChannel.onclose = () => {
                console.log('data channel closed');
              };

              viewerPeerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                  // Send ice candidates to broadcaster
                  socket.emit(EXCHANGE_ICE_CANDIDATES, {
                    candidate: event.candidate,
                    userId: meet.creator._id,
                    viewerId: profile._id,
                    roomId: meetId,
                  });
                }
              };

              viewerPeerConnection.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                  setMediaStream(event.streams[0]);
                  setHasStartedStreaming(true);
                }
              };

              viewerPeerConnection.onconnectionstatechange = (event) => {
                if (viewerPeerConnection.connectionState === 'failed') {
                  notification.open({
                    message: 'Broadcaster has left the meet',
                    description:
                      'The connection to the broadcaster has been closed',
                    duration: 5,
                  });
                  router.push('/');
                }
              };

              setViewerPeerConnectionToBroadcaster(viewerPeerConnection);
              setHasSetViewerPeerConnection(true);
              setViewerDataChannelToBroadcaster(sendChannel);
            }
          }
        );
      }
    })();
  }, [
    hasMetHostRequirements,
    hasMetViewerRequirements,
    hasSetViewerPeerConnection,
    hasStartedStreaming,
    isHost,
    mediaStream,
    meet,
    meetId,
    profile._id,
    profile.name,
    profile.pic,
    router,
    setMediaStream,
    socket,
    viewerPeerConnectionToBroadcaster,
  ]);

  useEffect(() => {
    if (
      mediaStream !== null &&
      mediaStream &&
      hasStartedStreaming &&
      broadcasterVideoRef.current
    ) {
      broadcasterVideoRef.current.srcObject = mediaStream;
      broadcasterVideoRef.current.play();
    }
  }, [hasStartedStreaming, mediaStream]);

  useViewerPeerConnection({
    meetId: meetId as string | null,
    profile,
    socket,
    viewerPeerConnectionToBroadcaster,
  });

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toggleAudioStreamMuteStatus({ stream: mediaStream! });
  };

  const onSelectAudioDevice = async (audioId: string) => {
    const stream = await replaceWithNewTrack({
      peerConnections: viewersPeerConnections.current,
      deviceId: audioId,
      stream: mediaStream!,
      type: 'audio',
      selectedDeviceId: selectedAudioDevice!,
    });

    setSelectedAudioDevice(audioId);
    setMediaStream(stream!);
  };

  const onSelectVideoDevice = async (videoId: string) => {
    const stream = await replaceWithNewTrack({
      peerConnections: viewersPeerConnections.current,
      deviceId: videoId,
      stream: mediaStream!,
      type: 'video',
      selectedDeviceId: selectedVideoDevice!,
    });

    setSelectedVideoDevice(videoId);
    setMediaStream(stream!);
  };

  const setChatMessage = (message: string) => {
    setChat((prev) => [
      ...prev,
      {
        message,
        user: profile,
      },
    ]);
  };
  return (
    <div>
      <Row align="middle" justify="center">
        <Col
          xs={22}
          sm={22}
          md={isChatOpen ? 16 : 23}
          className="h-[100vh] w-full overflow-hidden"
        >
          <MeetVideo
            hasStartedStreaming={hasStartedStreaming}
            isHost={isHost}
            isMuted={isMuted}
            ref={broadcasterVideoRef}
          />
          <MeetControls
            audioDevices={audioDevices}
            videoDevices={videoDevices}
            isMuted={isMuted}
            selectedAudioDevice={selectedAudioDevice}
            selectedVideoDevice={selectedVideoDevice}
            toggleMute={toggleMute}
            isHost={isHost}
            onSelectAudioDevice={onSelectAudioDevice}
            onSelectVideoDevice={onSelectVideoDevice}
          />
          <MeetViewers viewers={viewers} />
        </Col>
        <Col
          xs={22}
          sm={22}
          md={isChatOpen ? 8 : 1}
          className={`transition-all duration-200 ${
            isChatOpen ? 'ease-out' : 'ease-out'
          }`}
        >
          <MeetChats
            chats={chat}
            isHost={isHost}
            user={profile}
            dataChannel={viewerDataChannelToBroadcaster}
            sendMessage={(message) => setChatMessage(message)}
            isOpen={isChatOpen}
            toggleOpenClose={() => setIsChatOpen(!isChatOpen)}
          />
        </Col>
      </Row>
    </div>
  );
}
