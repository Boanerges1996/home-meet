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
  const [meet, setMeet] = useState<IMeeting>();
  const [isHost, setIsHost] = useState<boolean | null>(null);
  const { profile } = useContext(AppContext);
  const viewersPeerConnections = useRef<ViewersPeerConnections>({});
  const broadcasterVideoRef = useRef<HTMLVideoElement | null>(null);
  const [hasStartedStreaming, setHasStartedStreaming] =
    useState<boolean>(false);
  const viewersMediaStreams = useRef<ViewersMediaStreams>({});
  const [
    viewerPeerConnectionToBroadcaster,
    setViewerPeerConnectionToBroadcaster,
  ] = useState<RTCPeerConnection>();
  const [broadcasterMediaStream, setBroadcasterMediaStream] =
    useState<MediaStream>();

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
                // Send ice candidates to viewer
                socket.emit(EXCHANGE_ICE_CANDIDATES, {
                  candidate: event.candidate,
                  userId: data.viewerId,
                  broadcasterId: meet.creator._id,
                  roomId: meetId,
                });
              }
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
            await viewersPeerConnections.current[userId].addIceCandidate(
              candidate
            );
          }
        );
      } else if (!isHost && meetId && meet) {
        socket.emit(JOIN_AS_VIEWER, {
          broadcasterId: meet.creator._id,
          roomId: meetId,
        });
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
          if (event.streams && event.streams[0]) {
            // set broadcaster stream
            setBroadcasterMediaStream(event.streams[0]);
          }
        };

        setViewerPeerConnectionToBroadcaster(viewerPeerConnection);

        socket.on(
          INCOMING_OFFER,
          async (data: { offer: any; viewerId: string }) => {
            if (viewerPeerConnectionToBroadcaster) {
              await viewerPeerConnectionToBroadcaster.setRemoteDescription(
                data.offer
              );

              const answer = await viewerPeerConnection.createAnswer();

              await viewerPeerConnection.setLocalDescription(answer);

              socket.emit(NEW_ANSWER, {
                roomId: meetId,
                data: {
                  answer,
                  viewerId: profile._id,
                },
              });
            }
          }
        );

        socket.on(
          INCOMING_CANDIDATE,
          async ({ candidate, userId }: { candidate: any; userId: string }) => {
            if (viewerPeerConnectionToBroadcaster)
              await viewerPeerConnectionToBroadcaster?.addIceCandidate(
                candidate
              );
          }
        );
      }
    })();
  }, [isHost, meet, meetId, profile._id, viewerPeerConnectionToBroadcaster]);

  useEffect(() => {
    if (meetData && meetId) {
      setMeet(meetData?.data?.data);
    }
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
