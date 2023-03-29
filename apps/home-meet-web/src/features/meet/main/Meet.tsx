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
} from '@/common';
import { AppContext } from '@/providers';
import {
  axiosClient,
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
import React, {
  LegacyRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useQuery } from 'react-query';
import io, { Socket } from 'socket.io-client';
import { BroadcasterChats } from './BroadcasterChats';
import MeetViewers from './MeetViewers';
import { ViewersChat } from './ViewersChat';

export type MeetMainComponentProps = StyleProps & {};

let socket: Socket;

export function MeetMain() {
  const { meetId } = useRouter().query;
  const [meet, setMeet] = useState<IMeeting | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [viewers, setViewers] = useState<IUser[]>([]);
  const [chat, setChat] = useState<ChatType[]>([]);
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

  if ((isLogged !== null || isLogged !== undefined) && !isLogged) {
    router.push('/login');
  }

  const { data: meetData } = useQuery(
    ['get-meets'],
    async () => {
      return axiosClient.get('/meet/get/' + meetId);
    },
    {
      enabled: meetId ? true : false,
    }
  );

  useEffect(() => {
    socket = io('http://localhost:5001');
    socket.on('connect', () => {
      console.log('connected');
    });
    socket.on('disconnect', () => {
      console.log('disconnected');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (meet && profile._id) {
      const isBroadcaster = profile._id === meet.creator._id;
      setIsHost(isBroadcaster);
    }
  }, [meet, profile._id]);

  useEffect(() => {
    (async () => {
      if (isHost && meetId && meet) {
        let stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setBroadcasterMediaStream(stream);
        setHasStartedStreaming(true);

        socket.emit(
          JOIN_AS_BROADCASTER,
          {
            broadcasterId: meet.creator._id,
            roomId: meetId,
          },
          async (data: any) => {
            console.log('data', data);
          }
        );
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
                console.log('data channel message', event.data);
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
      } else if (
        isHost !== null &&
        !isHost &&
        meetId &&
        meet &&
        !hasSetViewerPeerConnection
      ) {
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
                console.log('on track', event.streams);
                if (event.streams && event.streams[0]) {
                  // set broadcaster stream
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
    hasSetViewerPeerConnection,
    isHost,
    meet,
    meetId,
    profile._id,
    profile.name,
    profile.pic,
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
    if (viewerPeerConnectionToBroadcaster) {
      socket.on(
        INCOMING_OFFER,
        async (data: { offer: any; viewerId: string }) => {
          try {
            if (viewerPeerConnectionToBroadcaster) {
              await viewerPeerConnectionToBroadcaster.setRemoteDescription(
                data.offer
              );

              const answer =
                await viewerPeerConnectionToBroadcaster.createAnswer();

              await viewerPeerConnectionToBroadcaster.setLocalDescription(
                answer
              );

              socket.emit(NEW_ANSWER, {
                roomId: meetId,
                data: {
                  answer,
                  viewerId: profile._id,
                },
              });
            }
          } catch (error) {
            console.log('Error', error);
          }
        }
      );

      socket.on(
        INCOMING_CANDIDATE,
        async ({
          candidate,
          userId,
        }: {
          candidate: RTCIceCandidate;
          userId: string;
        }) => {
          console.log(candidate);
          if (viewerPeerConnectionToBroadcaster)
            viewerPeerConnectionToBroadcaster.addIceCandidate(candidate);
        }
      );
    }
  }, [meetId, profile._id, viewerPeerConnectionToBroadcaster]);

  useEffect(() => {
    if (
      broadcasterMediaStream &&
      hasStartedStreaming &&
      broadcasterVideoRef.current
    ) {
      console.log(broadcasterMediaStream);
      broadcasterVideoRef.current.srcObject = broadcasterMediaStream;
      broadcasterVideoRef.current.play();
    }

    return () => {
      if (broadcasterVideoRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        broadcasterVideoRef.current.srcObject = null;
      }
    };
  }, [broadcasterMediaStream, hasStartedStreaming]);

  console.log('viewers', viewers);
  return (
    <div>
      <Row align="middle" justify="center">
        <Col xs={22} sm={22} md={16} className="h-[95vh] overflow-hidden">
          {hasStartedStreaming && (
            <video
              ref={broadcasterVideoRef as LegacyRef<HTMLVideoElement>}
              className="w-[100%]"
              muted
              autoPlay
              width="100%"
              height="60%"
            />
          )}
          <MeetViewers viewers={viewers} />
        </Col>
        <Col xs={22} sm={22} md={8}>
          {isHost !== null && isHost && <BroadcasterChats chats={chat} />}
          {isHost !== null && !isHost && (
            <ViewersChat
              dataChannel={viewerDataChannelToBroadcaster}
              user={profile}
            />
          )}
        </Col>
      </Row>
    </div>
  );
}
