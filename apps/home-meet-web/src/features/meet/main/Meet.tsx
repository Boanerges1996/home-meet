import {
  EXCHANGE_ICE_CANDIDATES,
  INCOMING_ANSWER,
  INCOMING_CANDIDATE,
  JOIN_AS_BROADCASTER,
  JOIN_AS_VIEWER,
  NEW_OFFER,
  NEW_VIEWER_JOINED,
} from '@/common';
import { useMeetData, useSocket } from '@/hooks';
import useViewerPeerConnection from '@/hooks/meet';
import { AppContext } from '@/providers';
import {
  ChatType,
  IMeeting,
  IUser,
  logConnectionState,
  StyleProps,
  ViewersDataChannels,
  ViewersPeerConnections,
} from '@/util';
import { Col, notification, Row } from 'antd';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { MeetChats, MeetControls, MeetVideo, MeetViewers } from '.';

export type MeetMainComponentProps = StyleProps & {};

export function MeetMain() {
  const { meetId } = useRouter().query;
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [meet, setMeet] = useState<IMeeting | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [viewers, setViewers] = useState<IUser[]>([]);
  const [chat, setChat] = useState<ChatType[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string | null>(
    null
  );
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string | null>(
    null
  );
  const [
    viewerPeerConnectionToBroadcaster,
    setViewerPeerConnectionToBroadcaster,
  ] = useState<RTCPeerConnection>();
  const [viewerDataChannelToBroadcaster, setViewerDataChannelToBroadcaster] =
    useState<RTCDataChannel>();
  const [broadcasterMediaStream, setBroadcasterMediaStream] =
    useState<MediaStream>();
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);

  const [hasSetViewerPeerConnection, setHasSetViewerPeerConnection] =
    useState<boolean>(false);
  const { profile, isLogged } = useContext(AppContext);
  const viewersPeerConnections = useRef<ViewersPeerConnections>({});
  const viewersDataChannels = useRef<ViewersDataChannels>({});
  const broadcasterVideoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();
  const { meetData } = useMeetData(meetId as string | undefined);
  const [socket] = useSocket();

  // if ((isLogged !== null || isLogged !== undefined) && !isLogged) {
  //   router.push('/login');
  // }

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
      if (hasMetHostRequirements) {
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

        socket.emit(JOIN_AS_BROADCASTER, {
          broadcasterId: meet.creator._id,
          roomId: meetId,
        });
        socket.on(
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
                  broadcasterId: meet.creator._id,
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

        socket.on(
          INCOMING_ANSWER,
          (data: { answer: any; viewerId: string }) => {
            viewersPeerConnections.current[data.viewerId].setRemoteDescription(
              data.answer
            );
          }
        );

        socket.on(
          INCOMING_CANDIDATE,
          async ({ candidate, userId }: { candidate: any; userId: string }) => {
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
                  setBroadcasterMediaStream(event.streams[0]);
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
                console.log(
                  'connection state',
                  viewerPeerConnection.connectionState
                );
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
    isHost,
    meet,
    meetId,
    profile._id,
    profile.name,
    profile.pic,
    router,
    socket,
    viewerPeerConnectionToBroadcaster,
  ]);

  useEffect(() => {
    if (meetData && meetId) {
      setMeet(meetData?.data?.data);
    }

    return () => {
      setMeet(null);
    };
  }, [meetData, meetId]);

  useEffect(() => {
    if (
      broadcasterMediaStream &&
      hasStartedStreaming &&
      broadcasterVideoRef.current
    ) {
      broadcasterVideoRef.current.srcObject = broadcasterMediaStream;
      broadcasterVideoRef.current.play();
    }
  }, [broadcasterMediaStream, hasStartedStreaming]);

  useViewerPeerConnection({
    meetId: meetId as string | null,
    profile,
    socket,
    viewerPeerConnectionToBroadcaster,
  });

  const toggleMute = () => {
    setIsMuted(!isMuted);
    broadcasterMediaStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  };

  const onSelectAudioDevice = async (audioId: string) => {
    if (selectedAudioDevice) {
      const audioStream = broadcasterMediaStream?.getAudioTracks()[0];
      audioStream?.stop();
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioId },
      });

      Object.keys(viewersPeerConnections.current).forEach((viewerId) => {
        const sender = viewersPeerConnections.current[viewerId]
          ?.getSenders()
          .find((s) => s.track?.kind === 'audio');
        sender?.replaceTrack(newStream.getAudioTracks()[0]);
      });

      setSelectedAudioDevice(audioId);
    } catch (error) {}
  };

  const onSelectVideoDevice = async (videoId: string) => {
    if (selectedVideoDevice) {
      const videoStream = broadcasterMediaStream?.getVideoTracks()[0];
      videoStream?.stop();
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: videoId },
      });

      Object.keys(viewersPeerConnections.current).forEach((viewerId) => {
        const sender = viewersPeerConnections.current[viewerId]
          ?.getSenders()
          .find((s) => s.track?.kind === 'video');
        sender?.replaceTrack(newStream.getVideoTracks()[0]);
      });

      setSelectedVideoDevice(videoId);
      setBroadcasterMediaStream(newStream);
    } catch (error) {
      console.error('Failed to get user media:', error);
    }
  };
  return (
    <div>
      <Row align="middle" justify="center">
        <Col
          xs={22}
          sm={22}
          md={16}
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
        <Col xs={22} sm={22} md={8}>
          <MeetChats
            chats={chat}
            isHost={isHost}
            user={profile}
            dataChannel={viewerDataChannelToBroadcaster}
            sendMessage={(message) => {
              setChat((prev) => [
                ...prev,
                {
                  message,
                  user: profile,
                },
              ]);
            }}
          />
        </Col>
      </Row>
    </div>
  );
}
