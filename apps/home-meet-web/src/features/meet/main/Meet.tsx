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
import { axiosClient, IMeeting, StyleProps } from '@/util';
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

export type MeetMainComponentProps = StyleProps & {};

type ViewersPeerConnections = {
  [key: string]: RTCPeerConnection;
};
type ViewersMediaStreams = {
  [key: string]: MediaStream;
};

let socket: Socket;

export default function MeetMain() {
  const { meetId } = useRouter().query;
  const [toggle, setToggle] = useState<boolean>(false);
  const [meet, setMeet] = useState<IMeeting | null>(null);
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const [
    viewerPeerConnectionToBroadcaster,
    setViewerPeerConnectionToBroadcaster,
  ] = useState<RTCPeerConnection>();
  const [broadcasterMediaStream, setBroadcasterMediaStream] =
    useState<MediaStream>();
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);

  const [hasSetViewerPeerConnection, setHasSetViewerPeerConnection] =
    useState<boolean>(false);
  const { profile, isLogged } = useContext(AppContext);
  const viewersPeerConnections = useRef<ViewersPeerConnections>({});
  const broadcasterVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewersMediaStreams = useRef<ViewersMediaStreams>({});
  const router = useRouter();
  const remoteStreamRef = React.useRef<HTMLVideoElement>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();

  // if (!isLogged) {
  //   router.push('/login');
  // }

  const { data: meetData } = useQuery(
    ['login'],
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

    // Pause before redirect
    // window.addEventListener(
    //   'beforeunload',
    //   function () {
    //     debugger;
    //   },
    //   false
    // );

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
        console.log('I am the host');
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
            console.log('New viewer joined', data);
            viewersPeerConnections.current[data.viewerId] =
              new RTCPeerConnection({
                iceServers: [
                  {
                    urls: 'stun:stun.l.google.com:19302',
                  },
                ],
              });

            viewersPeerConnections.current[data.viewerId].onicecandidate = (
              event
            ) => {
              if (event.candidate) {
                console.log('candidate ', event.candidate);
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
              console.log(
                'connection state',
                viewersPeerConnections.current[data.viewerId].connectionState
              );
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

            console.log('Offer', offer);

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
        console.log('I am a viewer');
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
                console.log(
                  'connection state',
                  viewerPeerConnection.connectionState
                );
              };

              setViewerPeerConnectionToBroadcaster(viewerPeerConnection);

              setHasSetViewerPeerConnection(true);
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
            console.log('Incoming offer', data);
            console.log(
              'Viewer peer connection',
              viewerPeerConnectionToBroadcaster
            );

            if (viewerPeerConnectionToBroadcaster) {
              await viewerPeerConnectionToBroadcaster.setRemoteDescription(
                data.offer
              );

              console.log(
                'Viewer peer connection',
                viewerPeerConnectionToBroadcaster
              );

              const answer =
                await viewerPeerConnectionToBroadcaster.createAnswer();

              await viewerPeerConnectionToBroadcaster.setLocalDescription(
                answer
              );

              console.log('Answer', answer);

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

  return (
    <div>
      MeetMain
      {hasStartedStreaming && (
        <video
          ref={broadcasterVideoRef as LegacyRef<HTMLVideoElement>}
          className="w-[150px] h-[150px]"
        />
      )}
    </div>
  );
}
